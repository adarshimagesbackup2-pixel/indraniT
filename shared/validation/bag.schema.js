"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bagUpdateSchema = exports.bagCreateSchema = exports.unitOfMeasureEnum = void 0;
const zod_1 = require("zod");
exports.unitOfMeasureEnum = zod_1.z.enum(["BAG", "PCS", "KG", "NOS"]);
exports.bagCreateSchema = zod_1.z.object({
    bagType: zod_1.z.string().trim().min(1, "Bag type name is required").max(200),
    defaultRate: zod_1.z.coerce
        .number()
        .positive("Rate must be positive")
        .max(9999999.99, "Rate is too large")
        .refine((v) => Number(v.toFixed(2)) === v, "Max 2 decimal places"),
    currentStock: zod_1.z.coerce
        .number()
        .int("Stock must be a whole number")
        .min(0, "Initial stock cannot be negative"),
    lowStockThreshold: zod_1.z.coerce.number().int().min(0, "Threshold cannot be negative").default(2000),
    hsnCode: zod_1.z.string().trim().max(20).default("6305"),
    // §1.1 — per-product GST + unit of measure
    gstRate: zod_1.z.coerce
        .number()
        .min(0, "GST rate cannot be negative")
        .max(100, "GST rate cannot exceed 100%")
        .default(5),
    unitOfMeasure: exports.unitOfMeasureEnum.default("BAG"),
});
// Stock is NOT editable after creation (only via /api/stock/add)
exports.bagUpdateSchema = exports.bagCreateSchema.omit({ currentStock: true }).partial();
//# sourceMappingURL=bag.schema.js.map