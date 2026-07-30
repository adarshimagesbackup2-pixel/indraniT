"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBags = listBags;
exports.createBag = createBag;
exports.updateBag = updateBag;
exports.suggestReorderQuantity = suggestReorderQuantity;
const prisma_1 = require("../prisma");
const errorHandler_1 = require("../middleware/errorHandler");
async function listBags() {
    const bags = await prisma_1.prisma.bagMaster.findMany({ where: { isActive: true }, orderBy: { bagType: "asc" } });
    return bags.map((b) => ({
        ...b,
        stockHealth: b.currentStock <= b.lowStockThreshold ? "LOW" : b.currentStock <= b.lowStockThreshold * 1.2 ? "NEAR" : "OK",
    }));
}
async function createBag(input) {
    const existing = await prisma_1.prisma.bagMaster.findUnique({ where: { bagType: input.bagType } });
    if (existing)
        throw new errorHandler_1.ApiError(422, "A bag type with this name already exists");
    return prisma_1.prisma.bagMaster.create({
        data: {
            bagType: input.bagType,
            defaultRate: input.defaultRate,
            currentStock: input.currentStock,
            lowStockThreshold: input.lowStockThreshold,
            hsnCode: input.hsnCode,
            gstRate: input.gstRate,
            unitOfMeasure: input.unitOfMeasure,
        },
    });
}
async function updateBag(id, input) {
    const existing = await prisma_1.prisma.bagMaster.findUnique({ where: { id } });
    if (!existing)
        throw new errorHandler_1.ApiError(404, "Bag type not found");
    return prisma_1.prisma.bagMaster.update({
        where: { id },
        data: {
            ...(input.bagType !== undefined ? { bagType: input.bagType } : {}),
            ...(input.defaultRate !== undefined ? { defaultRate: input.defaultRate } : {}),
            ...(input.lowStockThreshold !== undefined ? { lowStockThreshold: input.lowStockThreshold } : {}),
            ...(input.hsnCode !== undefined ? { hsnCode: input.hsnCode } : {}),
            ...(input.gstRate !== undefined ? { gstRate: input.gstRate } : {}),
            ...(input.unitOfMeasure !== undefined ? { unitOfMeasure: input.unitOfMeasure } : {}),
        },
    });
}
/**
 * §7.4 — suggests a reorder quantity based on the average of the last 30
 * days' ORDER_DEDUCTION logs for a bag type (average daily consumption × 14
 * days, as a simple reorder-point heuristic).
 */
async function suggestReorderQuantity(bagTypeId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const logs = await prisma_1.prisma.stockAuditLog.findMany({
        where: { bagTypeId, type: "ORDER_DEDUCTION", createdAt: { gte: thirtyDaysAgo } },
    });
    const totalConsumed = logs.reduce((sum, l) => sum + Math.abs(l.quantity), 0);
    const avgDaily = totalConsumed / 30;
    return Math.ceil(avgDaily * 14);
}
//# sourceMappingURL=bag.service.js.map