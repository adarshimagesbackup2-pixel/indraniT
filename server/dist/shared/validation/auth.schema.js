"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.loginSchema = exports.phoneSchema = void 0;
const zod_1 = require("zod");
exports.phoneSchema = zod_1.z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits");
exports.loginSchema = zod_1.z.object({
    phone: exports.phoneSchema,
    password: zod_1.z.string().min(1, "Password is required"),
    rememberMe: zod_1.z.boolean().optional().default(false),
});
exports.changePasswordSchema = zod_1.z
    .object({
    oldPassword: zod_1.z.string().min(1, "Current password is required"),
    newPassword: zod_1.z
        .string()
        .min(8, "New password must be at least 8 characters")
        .regex(/[A-Z]/, "New password must contain an uppercase letter")
        .regex(/[0-9]/, "New password must contain a number"),
    confirmPassword: zod_1.z.string(),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
//# sourceMappingURL=auth.schema.js.map