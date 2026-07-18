type LogContext = Record<string, string | number | boolean | null | undefined>;

function serialise(context?: LogContext) {
  if (!context) {
    return "";
  }

  return JSON.stringify(context);
}

export const logger = {
  info(message: string, context?: LogContext) {
    console.info(`[BuddyBin] ${message}`, serialise(context));
  },
  warn(message: string, context?: LogContext) {
    console.warn(`[BuddyBin] ${message}`, serialise(context));
  },
  error(message: string, context?: LogContext) {
    console.error(`[BuddyBin] ${message}`, serialise(context));
  },
};
