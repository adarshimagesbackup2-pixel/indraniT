"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsUpdateSchema = exports.numberingModeEnum = void 0;
const zod_1 = require("zod");
const auth_schema_1 = require("./auth.schema");
const customer_schema_1 = require("./customer.schema");
const order_schema_1 = require("./order.schema");
exports.numberingModeEnum = zod_1.z.enum(["AUTO", "MANUAL"]);
exports.settingsUpdateSchema = zod_1.z.object({
    businessName: zod_1.z.string().trim().min(1, "Business name is required").max(200),
    businessGstin: customer_schema_1.gstinSchema,
    businessAddress: zod_1.z.string().trim().min(1, "Address is required").max(500),
    businessPhone: auth_schema_1.phoneSchema,
    whatsappTemplate: zod_1.z.string().trim().min(1, "Template cannot be empty").max(2000),
    gstEnabledDefault: zod_1.z.boolean(),
    cgstPercent: zod_1.z.coerce.number().min(0).max(100),
    sgstPercent: zod_1.z.coerce.number().min(0).max(100),
    ewayThreshold: zod_1.z.coerce.number().positive(),
    reminderDayOfMonth: zod_1.z.coerce.number().int().min(1).max(28),
    // §1.2 — e-Way Bill business defaults
    businessPincode: customer_schema_1.pincodeSchema.optional().or(zod_1.z.literal("")),
    businessStateCode: customer_schema_1.stateCodeSchema.optional().or(zod_1.z.literal("")),
    businessAddressLine1: zod_1.z.string().trim().max(200).optional().or(zod_1.z.literal("")),
    businessAddressLine2: zod_1.z.string().trim().max(200).optional().or(zod_1.z.literal("")),
    businessPlace: zod_1.z.string().trim().max(100).optional().or(zod_1.z.literal("")),
    turnoverAboveFiveCr: zod_1.z.boolean().default(false),
    defaultTransportMode: order_schema_1.transportModeEnum.default("ROAD"),
    defaultTransportationReason: order_schema_1.transportationReasonEnum.default("SUPPLY"),
    ewayThresholdIntrastate: zod_1.z.coerce.number().positive().default(100000),
    ewayThresholdInterstate: zod_1.z.coerce.number().positive().default(50000),
    // §2 — numbering mode
    numberingMode: exports.numberingModeEnum.default("AUTO"),
    // §7.9 — financial year start month (1-12, India default April = 4)
    financialYearStartMonth: zod_1.z.coerce.number().int().min(1).max(12).default(4),
});
//# sourceMappingURL=settings.schema.js.map