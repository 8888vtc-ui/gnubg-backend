/**
 * Validation Middleware - Middleware de validation avec Zod
 */
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
/**
 * Middleware de validation Zod
 */
export declare const validationMiddleware: (schema: z.ZodSchema, target?: "body" | "params" | "query") => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map