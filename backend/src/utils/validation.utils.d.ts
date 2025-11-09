/**
 * Utilitaires de validation - Zod schemas
 */
import { z } from 'zod';
import { GameMode, Difficulty, AnalysisType } from '../types';
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    username: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    username: string;
    password: string;
}, {
    email: string;
    username: string;
    password: string;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const CreateGameSchema: z.ZodObject<{
    mode: z.ZodNativeEnum<typeof GameMode>;
    difficulty: z.ZodOptional<z.ZodNativeEnum<typeof Difficulty>>;
    isRanked: z.ZodBoolean;
    timeLimit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    mode: GameMode;
    isRanked: boolean;
    difficulty?: Difficulty | undefined;
    timeLimit?: number | undefined;
}, {
    mode: GameMode;
    isRanked: boolean;
    difficulty?: Difficulty | undefined;
    timeLimit?: number | undefined;
}>;
export declare const MakeMoveSchema: z.ZodObject<{
    from: z.ZodNumber;
    to: z.ZodNumber;
    diceValue: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    from: number;
    to: number;
    diceValue: number;
}, {
    from: number;
    to: number;
    diceValue: number;
}>;
export declare const AnalyzeRequestSchema: z.ZodObject<{
    boardState: z.ZodString;
    dice: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    move: z.ZodOptional<z.ZodString>;
    analysisType: z.ZodNativeEnum<typeof AnalysisType>;
    playerColor: z.ZodEnum<["WHITE", "BLACK"]>;
}, "strip", z.ZodTypeAny, {
    dice: [number, number];
    boardState: string;
    analysisType: AnalysisType;
    playerColor: "WHITE" | "BLACK";
    move?: string | undefined;
}, {
    dice: [number, number];
    boardState: string;
    analysisType: AnalysisType;
    playerColor: "WHITE" | "BLACK";
    move?: string | undefined;
}>;
export declare const UpdateProfileSchema: z.ZodEffects<z.ZodObject<{
    username: z.ZodOptional<z.ZodString>;
    currentPassword: z.ZodOptional<z.ZodString>;
    newPassword: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    username?: string | undefined;
    currentPassword?: string | undefined;
    newPassword?: string | undefined;
}, {
    username?: string | undefined;
    currentPassword?: string | undefined;
    newPassword?: string | undefined;
}>, {
    username?: string | undefined;
    currentPassword?: string | undefined;
    newPassword?: string | undefined;
}, {
    username?: string | undefined;
    currentPassword?: string | undefined;
    newPassword?: string | undefined;
}>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateGameInput = z.infer<typeof CreateGameSchema>;
export type MakeMoveInput = z.infer<typeof MakeMoveSchema>;
export type AnalyzeRequestInput = z.infer<typeof AnalyzeRequestSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export declare class ValidationUtils {
    /**
     * Validation et transformation sécurisée
     */
    static validate<T>(schema: z.ZodSchema<T>, data: unknown): T;
    /**
     * Validation async (pour les validations complexes)
     */
    static validateAsync<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T>;
    /**
     * Validation partielle (ne retourne que les erreurs)
     */
    static validatePartial<T>(schema: z.ZodSchema<T>, data: unknown): {
        isValid: boolean;
        errors: string[];
        data?: T;
    };
}
//# sourceMappingURL=validation.utils.d.ts.map