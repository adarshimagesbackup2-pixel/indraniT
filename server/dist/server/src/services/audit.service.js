"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAuditLog = writeAuditLog;
exports.listAuditLogs = listAuditLogs;
const prisma_1 = require("../prisma");
/** Writes one audit log row. Accepts either the main client or a transaction client. */
async function writeAuditLog(tx, input) {
    await tx.auditLog.create({
        data: {
            action: input.action,
            entityType: input.entityType,
            entityId: input.entityId,
            performedById: input.performedById,
            details: input.details ? JSON.stringify(input.details) : null,
        },
    });
}
async function listAuditLogs(filters) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 50;
    const where = {};
    if (filters.entityType)
        where.entityType = filters.entityType;
    if (filters.search) {
        where.OR = [
            { action: { contains: filters.search, mode: "insensitive" } },
            { entityId: { contains: filters.search, mode: "insensitive" } },
        ];
    }
    if (filters.from || filters.to) {
        where.performedAt = {
            ...(filters.from ? { gte: new Date(filters.from) } : {}),
            ...(filters.to ? { lte: new Date(filters.to) } : {}),
        };
    }
    const [total, logs] = await Promise.all([
        prisma_1.prisma.auditLog.count({ where }),
        prisma_1.prisma.auditLog.findMany({
            where,
            orderBy: { performedAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
    ]);
    return { data: logs, total, page, pageSize };
}
//# sourceMappingURL=audit.service.js.map