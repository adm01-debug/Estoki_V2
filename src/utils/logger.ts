 type LogLevel = 'info' | 'warn' | 'error' | 'debug';
 
 interface LogMetadata {
   [key: string]: unknown;
 }
 
 class Logger {
   private isDev = import.meta.env.DEV;
 
   private formatMessage(level: LogLevel, message: string, metadata?: LogMetadata): string {
     const timestamp = new Date().toISOString();
     const meta = metadata ? ` | ${JSON.stringify(metadata)}` : '';
     return `[${timestamp}] [${level.toUpperCase()}] ${message}${meta}`;
   }
 
   info(message: string, metadata?: LogMetadata) {
     if (this.isDev) {
       console.info(this.formatMessage('info', message, metadata));
     }
     // In production, we could send this to Sentry or a logging service
   }
 
   warn(message: string, metadata?: LogMetadata) {
     console.warn(this.formatMessage('warn', message, metadata));
   }
 
   error(message: string, error?: unknown, metadata?: LogMetadata) {
     const errorMeta = error instanceof Error 
       ? { ...metadata, stack: error.stack, message: error.message }
       : { ...metadata, error };
     
     console.error(this.formatMessage('error', message, errorMeta));
     
     // Here we would integrate with Sentry
     // Sentry.captureException(error, { extra: metadata });
   }
 
   debug(message: string, metadata?: LogMetadata) {
     if (this.isDev) {
       console.debug(this.formatMessage('debug', message, metadata));
     }
   }
 }
 
 export const logger = new Logger();
 export default logger;