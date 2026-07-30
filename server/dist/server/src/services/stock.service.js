"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addStock = addStock;
exports.bulkAddStock = bulkAddStock;
exports.listStockAudit = listStockAudit;
const prisma_1 = require("../prisma");
const errorHandler_1 = require("../middleware/errorHandler");
async function addStock(input, createdById) {
    return prisma_1.prisma.$transaction(async (tx) => {
        const bag = await tx.bagMaster.findUnique({ where: { id: input.bagTypeId } });
        if (!bag || !bag.isActive)
            throw new errorHandler_1.ApiError(404, "Bag type not found");
        const balanceAfter = bag.currentStock + input.quantityAdded;
        await tx.bagMaster.update({ where: { id: bag.id }, data: { currentStock: balanceAfter } });
        return tx.stockAuditLog.create({
            data: {
                bagTypeId: bag.id,
                type: input.entryType,
                quantity: input.quantityAdded,
                balanceAfter,
                notes: input.notes || null,
                createdById,
            },
        });
    });
}
/** §7.6 — bulk stock adjustment: multiple bag types corrected in one modal/transaction. */
async function bulkAddStock(input, createdById) {
    return prisma_1.prisma.$transaction(async (tx) => {
        const results = [];
        for (const entry of input.entries) {
            const bag = await tx.bagMaster.findUnique({ where: { id: entry.bagTypeId } });
            if (!bag || !bag.isActive)
                throw new errorHandler_1.ApiError(404, `Bag type not found: ${entry.bagTypeId}`);
            const balanceAfter = bag.currentStock + entry.quantityAdded;
            await tx.bagMaster.update({ where: { id: bag.id }, data: { currentStock: balanceAfter } });
            const log = await tx.stockAuditLog.create({
                data: {
                    bagTypeId: bag.id,
                    type: entry.entryType,
                    quantity: entry.quantityAdded,
                    balanceAfter,
                    notes: entry.notes || null,
                    createdById,
                },
            });
            results.push(log);
        }
        return results;
    });
}
async function listStockAudit(filters) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 50;
    const where = {};
    if (filters.bagTypeId)
        where.bagTypeId = filters.bagTypeId;
    if (filters.from || filters.to) {
        where.createdAt = {
            ...(filters.from ? { gte: new Date(filters.from) } : {}),
            ...(filters.to ? { lte: new Date(filters.to) } : {}),
        };
    }
    const [total, logs] = await Promise.all([
        prisma_1.prisma.stockAuditLog.count({ where }),
        prisma_1.prisma.stockAuditLog.findMany({
            where,
            include: { bagType: true },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
    ]);
    return { data: logs, total, page, pageSize };
}
//# sourceMappingURL=stock.service.js.map