"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderCancelSchema = exports.orderEditSchema = exports.ewayBillNoSchema = exports.orderCreateSchema = exports.orderLineItemSchema = exports.transportationReasonEnum = exports.transportModeEnum = exports.pricingTypeEnum = void 0;
const zod_1 = require("zod");
exports.pricingTypeEnum = zod_1.z.enum(["PER_BAG", "LUMPSUM"]);
exports.transportModeEnum = zod_1.z.enum(["ROAD", "RAIL", "AIR", "SHIP"]);
exports.transportationReasonEnum = zod_1.z.enum([
    "SUPPLY",
    "EXPORT",
    "JOB_WORK",
    "SKD_CKD",
    "RECIPIENT_NOT_KNOWN",
    "LINE_SALES",
    "SALES_RETURN",
    "EXHIBITION_FAIRS",
    "FOR_OWN_USE",
    "OTHERS",
]);
exports.orderLineItemSchema = zod_1.z
    .object({
    bagTypeId: zod_1.z.string().uuid("Select a bag type"),
    quantity: zod_1.z.coerce.number().int("Quantity must be a whole number").positive("Quantity must be greater than 0"),
    pricingType: exports.pricingTypeEnum,
    ratePerBag: zod_1.z.coerce.number().positive().max(9999999.99).optional(),
    lumpsumAmount: zod_1.z.coerce.number().positive().max(9999999.99).optional(),
})
    .refine((item) => (item.pricingType === "PER_BAG" ? item.ratePerBag !== undefined : true), {
    message: "Rate per bag is required",
    path: ["ratePerBag"],
})
    .refine((item) => (item.pricingType === "LUMPSUM" ? item.lumpsumAmount !== undefined : true), {
    message: "Lump-sum amount is required",
    path: ["lumpsumAmount"],
});
exports.orderCreateSchema = zod_1.z
    .object({
    customerId: zod_1.z.string().uuid("Select a customer"),
    transportId: zod_1.z.string().uuid("Select a vehicle"),
    gstEnabled: zod_1.z.boolean().default(false),
    items: zod_1.z.array(exports.orderLineItemSchema).min(1, "Add at least one bag type"),
    overrideCreditLimit: zod_1.z.boolean().optional().default(false),
    // §4 — blacklist override, ADMIN only (same pattern as credit limit override)
    overrideBlacklist: zod_1.z.boolean().optional().default(false),
    // §2 — custom bill/challan numbers
    customChallanNo: zod_1.z.string().trim().max(50).optional().or(zod_1.z.literal("")),
    customerBillNo: zod_1.z.string().trim().max(50).optional().or(zod_1.z.literal("")),
    // §1.4 — e-way transport detail
    transportationReason: exports.transportationReasonEnum.default("SUPPLY"),
    transportMode: exports.transportModeEnum.default("ROAD"),
    transportDocNo: zod_1.z.string().trim().max(50).optional().or(zod_1.z.literal("")),
    transportDocDate: zod_1.z.string().optional().or(zod_1.z.literal("")),
    transDistanceKm: zod_1.z.coerce.number().int().positive().optional(),
})
    .refine((data) => data.transportMode === "ROAD" || (data.transportDocNo && data.transportDocNo.length > 0), { message: "Transport document number is required for Rail/Air/Ship", path: ["transportDocNo"] });
exports.ewayBillNoSchema = zod_1.z.object({
    ewayBillNo: zod_1.z.string().regex(/^[0-9]{12}$/, "EWB number must be exactly 12 digits"),
});
// §3 — editing an existing order requires a reason (ADMIN only)
exports.orderEditSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid("Select a customer"),
    transportId: zod_1.z.string().uuid("Select a vehicle"),
    gstEnabled: zod_1.z.boolean().default(false),
    items: zod_1.z.array(exports.orderLineItemSchema).min(1, "Add at least one bag type"),
    customerBillNo: zod_1.z.string().trim().max(50).optional().or(zod_1.z.literal("")),
    transportationReason: exports.transportationReasonEnum.default("SUPPLY"),
    transportMode: exports.transportModeEnum.default("ROAD"),
    transportDocNo: zod_1.z.string().trim().max(50).optional().or(zod_1.z.literal("")),
    transportDocDate: zod_1.z.string().optional().or(zod_1.z.literal("")),
    transDistanceKm: zod_1.z.coerce.number().int().positive().optional(),
    editReason: zod_1.z.string().trim().min(1, "A reason for this edit is required").max(500),
});
exports.orderCancelSchema = zod_1.z.object({
    cancelReason: zod_1.z.string().trim().min(1, "A reason for cancelling is required").max(500),
});
//# sourceMappingURL=order.schema.js.map