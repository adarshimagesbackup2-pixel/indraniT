"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentCreateSchema = exports.paymentModeEnum = void 0;
const zod_1 = require("zod");
exports.paymentModeEnum = zod_1.z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"]);
exports.paymentCreateSchema = zod_1.z
    .object({
    customerId: zod_1.z.string().uuid("Customer is required"),
    amount: zod_1.z.coerce
        .number()
        .positive("Amount must be greater than 0")
        .max(9999999.99, "Amount is too large"),
    paymentDate: zod_1.z
        .string()
        .refine((d) => !isNaN(Date.parse(d)), "Invalid date")
        .refine((d) => new Date(d) <= new Date(), "Payment date cannot be in the future"),
    paymentMode: exports.paymentModeEnum,
    referenceNo: zod_1.z.string().trim().max(100).optional().or(zod_1.z.literal("")),
    notes: zod_1.z.string().trim().max(1000).optional().or(zod_1.z.literal("")),
})
    .refine((data) => data.paymentMode === "CASH" ||
    (data.referenceNo !== undefined && data.referenceNo.length > 0), {
    message: "Reference ID is required for UPI, Bank Transfer, and Cheque",
    path: ["referenceNo"],
});
//# sourceMappingURL=payment.schema.js.map