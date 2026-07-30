"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blacklistToggleSchema = exports.customerUpdateSchema = exports.customerSchema = exports.pincodeSchema = exports.stateCodeSchema = exports.gstinSchema = void 0;
const zod_1 = require("zod");
const auth_schema_1 = require("./auth.schema");
// Standard GSTIN regex
exports.gstinSchema = zod_1.z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format")
    .optional()
    .or(zod_1.z.literal(""));
// 2-digit GST state code, e.g. "27" for Maharashtra
exports.stateCodeSchema = zod_1.z
    .string()
    .regex(/^[0-9]{2}$/, "State code must be 2 digits");
exports.pincodeSchema = zod_1.z.string().regex(/^[0-9]{6}$/, "Pincode must be 6 digits");
exports.customerSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, "Name is required").max(200),
    phone: auth_schema_1.phoneSchema,
    address: zod_1.z.string().trim().min(1, "Address is required").max(500),
    gstin: exports.gstinSchema,
    creditLimit: zod_1.z.coerce.number().min(0, "Credit limit cannot be negative").default(0),
    trademarkName: zod_1.z.string().trim().max(200).optional().or(zod_1.z.literal("")),
    openingBalance: zod_1.z.coerce.number().min(0, "Opening balance cannot be negative").default(0),
    openingBalanceType: zod_1.z.enum(["DEBIT", "CREDIT"]).default("DEBIT"),
    // §1.3 — required for e-Way Bill threshold + intrastate/interstate determination
    stateCode: exports.stateCodeSchema,
    pincode: exports.pincodeSchema,
    // §1.3 — optional ship-to details; if blank, ship-to = bill-to
    shipToAddress: zod_1.z.string().trim().max(500).optional().or(zod_1.z.literal("")),
    shipToGstin: exports.gstinSchema,
    shipToPincode: zod_1.z
        .string()
        .regex(/^[0-9]{6}$/, "Pincode must be 6 digits")
        .optional()
        .or(zod_1.z.literal("")),
    shipToStateCode: zod_1.z
        .string()
        .regex(/^[0-9]{2}$/, "State code must be 2 digits")
        .optional()
        .or(zod_1.z.literal("")),
});
exports.customerUpdateSchema = exports.customerSchema.partial();
const booleanLikeSchema = zod_1.z.preprocess((value) => {
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "true")
            return true;
        if (normalized === "false")
            return false;
    }
    return value;
}, zod_1.z.boolean());
// §4 — blacklist toggle, ADMIN only, reason required when blacklisting
exports.blacklistToggleSchema = zod_1.z.object({
    isBlacklisted: booleanLikeSchema,
    blacklistReason: zod_1.z.string().trim().max(500).optional(),
}).refine((data) => !data.isBlacklisted || (data.blacklistReason && data.blacklistReason.length > 0), {
    message: "A reason is required to blacklist a customer",
    path: ["blacklistReason"],
});
//# sourceMappingURL=customer.schema.js.map