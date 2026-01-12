/**
 * Centralized Logger Service
 * @module @logger
 */

import { Environment } from '@commonTypes';

enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    FATAL = 'FATAL',
}

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: number;
    context?: string;
    data?: any;
    error?: Error;
}

class Logger {
    private static instance: Logger;
    private logLevel: LogLevel = LogLevel.DEBUG;
    private environment: Environment = Environment.DEVELOPMENT;
    private enableConsoleOutput: boolean = true;
    private logBuffer: LogEntry[] = [];
    private maxBufferSize: number = 100;

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    /**
     * Configure logger settings
     */
    configure(config: {
        logLevel?: LogLevel;
        environment?: Environment;
        enableConsoleOutput?: boolean;
        maxBufferSize?: number;
    }) {
        if (config.logLevel) this.logLevel = config.logLevel;
        if (config.environment) this.environment = config.environment;
        if (config.enableConsoleOutput !== undefined)
            this.enableConsoleOutput = config.enableConsoleOutput;
        if (config.maxBufferSize) this.maxBufferSize = config.maxBufferSize;
    }

    /**
     * Log a debug message
     */
    debug(message: string, context?: string, data?: any) {
        this.log(LogLevel.DEBUG, message, context, data);
    }

    /**
     * Log an info message
     */
    info(message: string, context?: string, data?: any) {
        this.log(LogLevel.INFO, message, context, data);
    }

    /**
     * Log a warning message
     */
    warn(message: string, context?: string, data?: any) {
        this.log(LogLevel.WARN, message, context, data);
    }

    /**
     * Log an error message
     */
    error(message: string, error?: Error, context?: string, data?: any) {
        this.log(LogLevel.ERROR, message, context, data, error);
    }

    /**
     * Log a fatal error message
     */
    fatal(message: string, error?: Error, context?: string, data?: any) {
        this.log(LogLevel.FATAL, message, context, data, error);
    }

    /**
     * Internal log method
     */
    private log(
        level: LogLevel,
        message: string,
        context?: string,
        data?: any,
        error?: Error,
    ) {
        // Check if we should log based on level
        if (!this.shouldLog(level)) {
            return;
        }

        const logEntry: LogEntry = {
            level,
            message,
            timestamp: Date.now(),
            context,
            data,
            error,
        };

        // Add to buffer
        this.addToBuffer(logEntry);

        // Console output in development
        if (this.enableConsoleOutput && this.environment === Environment.DEVELOPMENT) {
            this.outputToConsole(logEntry);
        }

        // In production, send to analytics/crash reporting service
        if (this.environment === Environment.PRODUCTION && level === LogLevel.ERROR || level === LogLevel.FATAL) {
            this.sendToRemoteLogging(logEntry);
        }
    }

    /**
     * Check if log level should be logged
     */
    private shouldLog(level: LogLevel): boolean {
        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex >= currentLevelIndex;
    }

    /**
     * Output log to console with appropriate styling
     */
    private outputToConsole(entry: LogEntry) {
        const timestamp = new Date(entry.timestamp).toISOString();
        const contextStr = entry.context ? `[${entry.context}]` : '';
        const prefix = `${timestamp} ${entry.level} ${contextStr}`;

        switch (entry.level) {
            case LogLevel.DEBUG:
                console.debug(prefix, entry.message, entry.data || '');
                break;
            case LogLevel.INFO:
                console.info(prefix, entry.message, entry.data || '');
                break;
            case LogLevel.WARN:
                console.warn(prefix, entry.message, entry.data || '');
                break;
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                console.error(prefix, entry.message, entry.data || '', entry.error || '');
                if (entry.error?.stack) {
                    console.error('Stack trace:', entry.error.stack);
                }
                break;
        }
    }

    /**
     * Add log entry to buffer
     */
    private addToBuffer(entry: LogEntry) {
        this.logBuffer.push(entry);
        if (this.logBuffer.length > this.maxBufferSize) {
            this.logBuffer.shift(); // Remove oldest entry
        }
    }

    /**
     * Send logs to remote logging service (implement based on your backend)
     */
    private sendToRemoteLogging(entry: LogEntry) {
        // TODO: Implement remote logging
        // Example: Send to Sentry, LogRocket, or custom backend
        // This could be integrated with your analytics service
    }

    /**
     * Get all buffered logs
     */
    getBufferedLogs(): LogEntry[] {
        return [...this.logBuffer];
    }

    /**
     * Clear log buffer
     */
    clearBuffer() {
        this.logBuffer = [];
    }

    /**
     * Export logs for debugging
     */
    exportLogs(): string {
        return JSON.stringify(this.logBuffer, null, 2);
    }
}

// Export singleton instance
export const logger = Logger.getInstance();
export { LogLevel };
export type { LogEntry };
