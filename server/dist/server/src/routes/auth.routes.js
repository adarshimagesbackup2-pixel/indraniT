"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_schema_1 = require("@bardan/shared/validation/auth.schema");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const authService = __importStar(require("../services/auth.service"));
const router = (0, express_1.Router)();
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { success: false, error: { message: "Too many login attempts. Try again later." } },
});
const REFRESH_COOKIE = "bardan_refresh_token";
const isProd = process.env.NODE_ENV === "production";
router.post("/login", loginLimiter, (0, validate_1.validateBody)(auth_schema_1.loginSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { phone, password, rememberMe } = req.body;
    const result = await authService.login(phone, password, rememberMe);
    res.cookie(REFRESH_COOKIE, result.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        maxAge: (rememberMe ? 90 : 30) * 24 * 60 * 60 * 1000,
    });
    res.json({
        success: true,
        data: { accessToken: result.accessToken, user: result.user },
    });
}));
router.post("/refresh", (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token)
        throw new errorHandler_1.ApiError(401, "No refresh token present");
    const accessToken = authService.refreshAccessToken(token);
    res.json({ success: true, data: { accessToken } });
}));
router.post("/logout", (req, res) => {
    res.clearCookie(REFRESH_COOKIE);
    res.json({ success: true, data: null });
});
router.post("/change-password", auth_1.requireAuth, (0, validate_1.validateBody)(auth_schema_1.changePasswordSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(req.user.userId, oldPassword, newPassword);
    res.json({ success: true, data: null });
}));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map