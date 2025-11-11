// Security and Performance Middleware
const rateLimit = require('express-rate-limit')
const slowDown = require('express-slow-down')
const compression = require('compression')
const hpp = require('hpp')
const helmet = require('helmet')
const { body, param, query, validationResult } = require('express-validator')

// Rate limiting configurations
const createRateLimit = (windowMs, maxRequests, message) => {
  return rateLimit({
    windowMs: windowMs,
    max: maxRequests,
    message: {
      error: 'Too many requests',
      message: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Redis store in production
    // store: new RedisStore({ /* redis config */ })
  })
}

// Different rate limits for different endpoints
const rateLimits = {
  // Strict limits for auth endpoints
  auth: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 attempts per 15 minutes
    'Too many authentication attempts. Try again in 15 minutes.'
  ),

  // Moderate limits for game actions
  game: createRateLimit(
    60 * 1000, // 1 minute
    60, // 60 requests per minute
    'Too many game requests. Slow down!'
  ),

  // Generous limits for read operations
  read: createRateLimit(
    60 * 1000, // 1 minute
    120, // 120 requests per minute
    'Too many requests. Please wait.'
  ),

  // Strict limits for image generation
  images: createRateLimit(
    60 * 1000, // 1 minute
    30, // 30 images per minute
    'Too many image requests. Slow down!'
  ),

  // Very generous limits for health checks
  health: createRateLimit(
    60 * 1000, // 1 minute
    1000, // 1000 requests per minute
    'Health check limit exceeded'
  )
}

// Slow down progressive delays
const speedLimit = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // Allow 100 requests per 15 minutes
  delayMs: 500, // Add 500ms delay per request after limit
  maxDelayMs: 20000 // Maximum delay of 20 seconds
})

// Input validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    })
  }
  next()
}

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  // Remove null bytes and control characters
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str
    return str.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim()
  }

  // Sanitize all string inputs
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key])
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key])
      }
    }
  }

  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body)
  }
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query)
  }
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params)
  }

  next()
}

// Request size limits
const requestSizeLimits = {
  json: '10mb',
  urlencoded: '10mb',
  text: '1mb'
}

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost:*"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https:", "http://localhost:*", "ws:", "wss:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
})

// Compression configuration
const compressionConfig = compression({
  level: 6, // Good balance between speed and compression
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress images, they're already compressed
    if (req.headers.accept && req.headers.accept.includes('image/')) {
      return false
    }
    return compression.filter(req, res)
  }
})

// Request timeout middleware
const requestTimeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request timeout',
          message: 'The request took too long to process'
        })
      }
    }, timeoutMs)

    res.on('finish', () => clearTimeout(timeout))
    res.on('close', () => clearTimeout(timeout))

    next()
  }
}

// Error sanitization middleware
const sanitizeError = (error, req, res, next) => {
  // Don't leak internal errors
  const sanitizedError = {
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  }

  // Log the full error for monitoring
  console.error('Sanitized Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  })

  if (!res.headersSent) {
    res.status(500).json(sanitizedError)
  }
}

// Audit logging middleware
const auditLog = (req, res, next) => {
  const startTime = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - startTime
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous',
      contentLength: res.get('Content-Length') || 0
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('AUDIT:', JSON.stringify(logEntry))
    }

    // In production, send to monitoring service
    // monitoringService.log('api_request', logEntry)
  })

  next()
}

// Validation rules for common inputs
const validationRules = {
  userId: param('userId').isUUID().withMessage('Invalid user ID'),
  gameId: param('gameId').isString().isLength({ min: 10, max: 50 }).withMessage('Invalid game ID'),

  register: [
    body('name').isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],

  login: [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').exists().withMessage('Password is required')
  ],

  gameMove: [
    body('from').optional().isString().withMessage('Invalid from position'),
    body('to').optional().isString().withMessage('Invalid to position'),
    body('gnubgNotation').optional().isString().matches(/^[0-9bar]+\/[0-9off]+\*?$/).withMessage('Invalid GNUBG notation')
  ]
}

module.exports = {
  rateLimits,
  speedLimit,
  validateRequest,
  sanitizeInput,
  requestSizeLimits,
  securityHeaders,
  compressionConfig,
  requestTimeout,
  sanitizeError,
  auditLog,
  validationRules
}
