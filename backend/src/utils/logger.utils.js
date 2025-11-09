"use strict";
/**
 * Utilitaire de logging - Structuré et configuré
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
const config_1 = require("../config");
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "ERROR";
    LogLevel["WARN"] = "WARN";
    LogLevel["INFO"] = "INFO";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    static isProduction = config_1.EnvConfig.isProduction();
    /**
     * Log niveau ERROR
     */
    static error(message, context, metadata) {
        Logger.log(LogLevel.ERROR, message, context, metadata);
    }
    /**
     * Log niveau WARN
     */
    static warn(message, context, metadata) {
        Logger.log(LogLevel.WARN, message, context, metadata);
    }
    /**
     * Log niveau INFO
     */
    static info(message, context, metadata) {
        Logger.log(LogLevel.INFO, message, context, metadata);
    }
    /**
     * Log niveau DEBUG
     */
    static debug(message, context, metadata) {
        Logger.log(LogLevel.DEBUG, message, context, metadata);
    }
    /**
     * Log structuré principal
     */
    static log(level, message, context, metadata) {
        const logEntry = {
            level,
            message,
            timestamp: new Date(),
            context: context || undefined,
            metadata: metadata || undefined
        };
        // Filtrage par niveau en fonction de l'environnement
        if (Logger.shouldLog(level)) {
            Logger.output(logEntry);
        }
    }
    /**
     * Détermine si le log doit être affiché
     */
    static shouldLog(level) {
        if (Logger.isProduction) {
            return level === LogLevel.ERROR || level === LogLevel.WARN;
        }
        return true; // En développement, tout logger
    }
    /**
     * Sortie du log (console ou service externe)
     */
    static output(logEntry) {
        const { level, message, timestamp, context, metadata } = logEntry;
        // Format structuré pour la production
        if (Logger.isProduction) {
            const structuredLog = {
                level,
                message,
                timestamp: timestamp.toISOString(),
                ...context,
                ...metadata
            };
            console.log(JSON.stringify(structuredLog));
        }
        else {
            // Format lisible pour le développement
            const contextStr = context ? ` [${context.userId || ''}:${context.gameId || ''}:${context.action || ''}]` : '';
            const metaStr = metadata && Object.keys(metadata).length > 0 ? ` ${JSON.stringify(metadata)}` : '';
            const timestampStr = timestamp.toTimeString().split(' ')[0];
            console.log(`[${timestampStr}] ${level}${contextStr} ${message}${metaStr}`);
        }
    }
    /**
     * Création d'un logger avec contexte pré-rempli
     */
    static withContext(context) {
        return {
            error: (message, metadata) => Logger.error(message, context, metadata),
            warn: (message, metadata) => Logger.warn(message, context, metadata),
            info: (message, metadata) => Logger.info(message, context, metadata),
            debug: (message, metadata) => Logger.debug(message, context, metadata),
            timer: (label) => Logger.timer(label, context),
            errorWithStack: (message, error) => Logger.errorWithStack(message, error, context)
        };
    }
    /**
     * Mesure de performance
     */
    static timer(label, context) {
        const start = Date.now();
        const timerContext = { ...context, action: `timer_${label}` };
        Logger.debug(`Timer started: ${label}`, timerContext);
        return () => {
            const duration = Date.now() - start;
            Logger.info(`Timer completed: ${label}`, timerContext, { duration: `${duration}ms` });
        };
    }
    /**
     * Log d'erreur avec stack trace
     */
    static errorWithStack(message, error, context) {
        Logger.error(message, context, {
            error: error.message,
            stack: error.stack
        });
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.utils.js.map