"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
exports.errorHandler = errorHandler;
exports.asyncHandler = asyncHandler;
const logger_1 = require("../utils/logger");
class ApiError extends Error {
    statusCode;
    fields;
    constructor(statusCode, message, fields) {
        super(message);
        this.statusCode = statusCode;
        this.fields = fields;
    }
}
exports.ApiError = ApiError;
/**
 * Centralized error → JSON response. Every route/service throws ApiError
 * (or lets Zod validation errors bubble via the validate middleware) and
 * this converts it to the standard { success, error: { message, fields? } }
 * envelope described in §9.
 */
function errorHandler(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            error: { message: err.message, fields: err.fields },
        });
    }
    logger_1.logger.error("Unhandled error", err);
    return res.status(500).json({
        success: false,
        error: { message: "An unexpected server error occurred" },
    });
}
/** Wraps an async route handler so thrown/rejected errors reach errorHandler. */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
//# sourceMappingURL=errorHandler.js.map