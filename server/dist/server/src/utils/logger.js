"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
function log(level, message, meta) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    if (meta !== undefined) {
        console[level === "debug" ? "log" : level](line, meta);
    }
    else {
        console[level === "debug" ? "log" : level](line);
    }
}
exports.logger = {
    info: (message, meta) => log("info", message, meta),
    warn: (message, meta) => log("warn", message, meta),
    error: (message, meta) => log("error", message, meta),
    debug: (message, meta) => log("debug", message, meta),
};
//# sourceMappingURL=logger.js.map