"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
/**
 * Requires a valid access token via `Authorization: Bearer <token>`.
 * All /api/* routes except /api/auth/* go through this, per §4.
 */
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            error: { message: "Missing or invalid Authorization header" },
        });
    }
    const token = header.slice("Bearer ".length);
    try {
        const payload = jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
        req.user = payload;
        next();
    }
    catch {
        return res.status(401).json({
            success: false,
            error: { message: "Access token is invalid or expired" },
        });
    }
}
/**
 * Role guard: only ADMIN may proceed. STAFF gets 403.
 * Used on credit-limit edits, customer/bag deletes, settings edits,
 * ledger entry edits/deletes, and the recalculate-balances maintenance
 * action, per §4 and §6.3/§6.7/§6.8.
 */
function requireAdmin(req, res, next) {
    if (req.user?.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            error: { message: "This action requires an ADMIN role" },
        });
    }
    next();
}
//# sourceMappingURL=auth.js.map