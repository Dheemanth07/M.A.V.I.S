/**
 * @file Centralized application logger.
 */

const formatMeta = (meta) => {
    if (!meta) return "";

    if (meta instanceof Error) {
        return ` ${meta.stack || meta.message}`;
    }

    if (typeof meta === "object") {
        try {
            return ` ${JSON.stringify(meta)}`;
        } catch {
            return " [unserializable meta]";
        }
    }

    return ` ${meta}`;
};

const write = (level, message, meta) => {
    const line = `[${new Date().toISOString()}] ${level.toUpperCase()}: ${message}${formatMeta(meta)}`;

    if (level === "error") {
        console.error(line);
        return;
    }

    if (level === "warn") {
        console.warn(line);
        return;
    }

    console.log(line);
};

const logger = {
    info: (message, meta) => write("info", message, meta),
    warn: (message, meta) => write("warn", message, meta),
    error: (message, meta) => write("error", message, meta),
    debug: (message, meta) => {
        if (process.env.NODE_ENV === "development") write("debug", message, meta);
    },
};

export default logger;
