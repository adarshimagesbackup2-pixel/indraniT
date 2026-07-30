"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkStockAddSchema = exports.stockAddSchema = exports.stockEntryTypeEnum = void 0;
const zod_1 = require("zod");
exports.stockEntryTypeEnum = zod_1.z.enum(["MANUFACTURING_ADDITION", "PURCHASE_ADDITION"]);
exports.stockAddSchema = zod_1.z.object({
    bagTypeId: zod_1.z.string().uuid("Select a bag type"),
    entryType: exports.stockEntryTypeEnum,
    quantityAdded: zod_1.z.coerce
        .number()
        .int("Quantity must be a whole number")
        .positive("Quantity must be greater than 0"),
    notes: zod_1.z.string().trim().max(500).optional().or(zod_1.z.literal("")),
});
// §7.6 — multi-select bulk stock adjustment (physical stock-take correction)
exports.bulkStockAddSchema = zod_1.z.object({
    entries: zod_1.z
        .array(zod_1.z.object({
        bagTypeId: zod_1.z.string().uuid("Select a bag type"),
        entryType: exports.stockEntryTypeEnum,
        quantityAdded: zod_1.z.coerce.number().int("Quantity must be a whole number").positive("Quantity must be greater than 0"),
        notes: zod_1.z.string().trim().max(500).optional().or(zod_1.z.literal("")),
    }))
        .min(1, "Add at least one bag type"),
});
//# sourceMappingURL=stock.schema.js.map