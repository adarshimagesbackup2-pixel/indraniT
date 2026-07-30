"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
const zod_1 = require("zod");
/**
 * Validates req.body against the given Zod schema. On failure, responds
 * 422 with field-level errors so the frontend can map them directly onto
 * React Hook Form field errors (per §9). On success, replaces req.body
 * with the parsed (and coerced/defaulted) value.
 */
function validateBody(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const fields = {};
                for (const issue of err.issues) {
                    const key = issue.path.join(".") || "_root";
                    if (!fields[key])
                        fields[key] = issue.message;
                }
                return res.status(422).json({
                    success: false,
                    error: { message: "Validation failed", fields },
                });
            }
            next(err);
        }
    };
}
//# sourceMappingURL=validate.js.map