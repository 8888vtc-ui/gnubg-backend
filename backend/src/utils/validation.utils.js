"use strict";
/**
 * Utilitaires de validation - Zod schemas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationUtils = exports.UpdateProfileSchema = exports.AnalyzeRequestSchema = exports.MakeMoveSchema = exports.CreateGameSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("../types");
// Schémas de validation
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    password: zod_1.z.string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
    username: zod_1.z.string()
        .min(3, 'Le pseudo doit contenir au moins 3 caractères')
        .max(20, 'Le pseudo ne peut pas dépasser 20 caractères')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Le pseudo ne peut contenir que des lettres, chiffres, _ et -')
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    password: zod_1.z.string().min(1, 'Le mot de passe est requis')
});
exports.CreateGameSchema = zod_1.z.object({
    mode: zod_1.z.nativeEnum(types_1.GameMode),
    difficulty: zod_1.z.nativeEnum(types_1.Difficulty).optional(),
    isRanked: zod_1.z.boolean(),
    timeLimit: zod_1.z.number().int().min(60).max(3600).optional() // 1 minute à 1 heure
});
exports.MakeMoveSchema = zod_1.z.object({
    from: zod_1.z.number().int().min(0).max(25),
    to: zod_1.z.number().int().min(0).max(25),
    diceValue: zod_1.z.number().int().min(1).max(6)
});
exports.AnalyzeRequestSchema = zod_1.z.object({
    boardState: zod_1.z.string().min(1, 'L\'état du plateau est requis'),
    dice: zod_1.z.tuple([zod_1.z.number().int().min(1).max(6), zod_1.z.number().int().min(1).max(6)]),
    move: zod_1.z.string().optional(),
    analysisType: zod_1.z.nativeEnum(types_1.AnalysisType),
    playerColor: zod_1.z.enum(['WHITE', 'BLACK'])
});
exports.UpdateProfileSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, 'Le pseudo doit contenir au moins 3 caractères')
        .max(20, 'Le pseudo ne peut pas dépasser 20 caractères')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Le pseudo ne peut contenir que des lettres, chiffres, _ et -')
        .optional(),
    currentPassword: zod_1.z.string().min(1, 'Le mot de passe actuel est requis').optional(),
    newPassword: zod_1.z.string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
        .optional()
}).refine((data) => {
    // Si nouveau mot de passe, l'ancien est requis
    if (data.newPassword && !data.currentPassword) {
        return false;
    }
    return true;
}, {
    message: 'Le mot de passe actuel est requis pour en définir un nouveau',
    path: ['currentPassword']
});
// Classe de validation utilitaire
class ValidationUtils {
    /**
     * Validation et transformation sécurisée
     */
    static validate(schema, data) {
        try {
            return schema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const message = error.issues.map((e) => e.message).join(', ');
                throw new Error(`Validation failed: ${message}`);
            }
            throw error;
        }
    }
    /**
     * Validation async (pour les validations complexes)
     */
    static async validateAsync(schema, data) {
        try {
            return await schema.parseAsync(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const message = error.issues.map((e) => e.message).join(', ');
                throw new Error(`Validation failed: ${message}`);
            }
            throw error;
        }
    }
    /**
     * Validation partielle (ne retourne que les erreurs)
     */
    static validatePartial(schema, data) {
        try {
            const parsed = schema.parse(data);
            return { isValid: true, errors: [], data: parsed };
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errors = error.issues.map((e) => e.message);
                return { isValid: false, errors };
            }
            return { isValid: false, errors: ['Validation error'] };
        }
    }
}
exports.ValidationUtils = ValidationUtils;
//# sourceMappingURL=validation.utils.js.map