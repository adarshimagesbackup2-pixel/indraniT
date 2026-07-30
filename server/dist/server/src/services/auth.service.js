"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.refreshAccessToken = refreshAccessToken;
exports.changePassword = changePassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_TTL = "8h";
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}
function signRefreshToken(payload, rememberMe) {
    return jsonwebtoken_1.default.sign(payload, REFRESH_SECRET, { expiresIn: rememberMe ? "90d" : "30d" });
}
async function login(phone, password, rememberMe) {
    const user = await prisma_1.prisma.user.findUnique({ where: { phone } });
    if (!user)
        throw new errorHandler_1.ApiError(401, "Invalid phone number or password");
    const valid = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!valid)
        throw new errorHandler_1.ApiError(401, "Invalid phone number or password");
    const payload = { userId: user.id, name: user.name, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload, rememberMe);
    return {
        accessToken,
        refreshToken,
        rememberMe,
        user: {
            id: user.id,
            name: user.name,
            role: user.role,
            mustChangePassword: user.mustChangePassword,
        },
    };
}
function refreshAccessToken(refreshToken) {
    try {
        const payload = jsonwebtoken_1.default.verify(refreshToken, REFRESH_SECRET);
        const accessToken = signAccessToken({
            userId: payload.userId,
            name: payload.name,
            role: payload.role,
        });
        return accessToken;
    }
    catch {
        throw new errorHandler_1.ApiError(401, "Refresh token is invalid or expired");
    }
}
async function changePassword(userId, oldPassword, newPassword) {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new errorHandler_1.ApiError(404, "User not found");
    const valid = await bcrypt_1.default.compare(oldPassword, user.passwordHash);
    if (!valid)
        throw new errorHandler_1.ApiError(422, "Current password is incorrect");
    const passwordHash = await bcrypt_1.default.hash(newPassword, 12);
    await prisma_1.prisma.user.update({
        where: { id: userId },
        data: { passwordHash, mustChangePassword: false },
    });
}
//# sourceMappingURL=auth.service.js.map