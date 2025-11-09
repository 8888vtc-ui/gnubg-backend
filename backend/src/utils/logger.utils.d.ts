/**
 * Utilitaire de logging - Structuré et configuré
 */
import { LogContext } from '../types';
export declare enum LogLevel {
    ERROR = "ERROR",
    WARN = "WARN",
    INFO = "INFO",
    DEBUG = "DEBUG"
}
export interface LogEntry {
    readonly level: LogLevel;
    readonly message: string;
    readonly timestamp: Date;
    readonly context?: LogContext | undefined;
    readonly metadata?: Record<string, unknown> | undefined;
}
export declare class Logger {
    private static readonly isProduction;
    /**
     * Log niveau ERROR
     */
    static error(message: string, context?: LogContext, metadata?: Record<string, unknown>): void;
    /**
     * Log niveau WARN
     */
    static warn(message: string, context?: LogContext, metadata?: Record<string, unknown>): void;
    /**
     * Log niveau INFO
     */
    static info(message: string, context?: LogContext, metadata?: Record<string, unknown>): void;
    /**
     * Log niveau DEBUG
     */
    static debug(message: string, context?: LogContext, metadata?: Record<string, unknown>): void;
    /**
     * Log structuré principal
     */
    private static log;
    /**
     * Détermine si le log doit être affiché
     */
    private static shouldLog;
    /**
     * Sortie du log (console ou service externe)
     */
    private static output;
    /**
     * Création d'un logger avec contexte pré-rempli
     */
    static withContext(context: LogContext): {
        error: (message: string, metadata?: Record<string, unknown>) => void;
        warn: (message: string, metadata?: Record<string, unknown>) => void;
        info: (message: string, metadata?: Record<string, unknown>) => void;
        debug: (message: string, metadata?: Record<string, unknown>) => void;
        timer: (label: string) => () => void;
        errorWithStack: (message: string, error: Error) => void;
    };
    /**
     * Mesure de performance
     */
    static timer(label: string, context?: LogContext): () => void;
    /**
     * Log d'erreur avec stack trace
     */
    static errorWithStack(message: string, error: Error, context?: LogContext): void;
}
//# sourceMappingURL=logger.utils.d.ts.map