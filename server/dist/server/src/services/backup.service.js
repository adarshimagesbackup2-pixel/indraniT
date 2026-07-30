"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportFullBackup = exportFullBackup;
const prisma_1 = require("../prisma");
function parseDateInput(value) {
    if (!value)
        return undefined;
    const trimmed = value.trim();
    if (!trimmed)
        return undefined;
    const match = /^\d{4}-\d{2}-\d{2}$/.exec(trimmed);
    if (match) {
        const [year, month, day] = trimmed.split("-").map(Number);
        return new Date(year, month - 1, day);
    }
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
        throw new Error(`Invalid date provided: ${value}`);
    }
    return parsed;
}
function buildDateRange(from, to) {
    const start = parseDateInput(from);
    const end = parseDateInput(to);
    if (start && end && end < start) {
        throw new Error("The end date must be on or after the start date.");
    }
    return {
        gte: start,
        lte: end ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999) : undefined,
    };
}
/**
 * §7.10 — full data export so the business always has an offline copy
 * independent of hosting. Includes every table that holds business data
 * (not Users/passwords, for security — that's operational config, not
 * business data worth backing up this way).
 */
async function exportFullBackup(options = {}) {
    const range = buildDateRange(options.from, options.to);
    const hasDateRange = Boolean(range.gte || range.lte);
    const [customers, bags, transports, orders, orderItems, ledger, stockLogs, reminders, settings] = await Promise.all([
        prisma_1.prisma.customer.findMany(hasDateRange ? { where: { createdAt: range } } : undefined),
        prisma_1.prisma.bagMaster.findMany(hasDateRange ? { where: { createdAt: range } } : undefined),
        prisma_1.prisma.transport.findMany(hasDateRange ? { where: { createdAt: range } } : undefined),
        prisma_1.prisma.order.findMany(hasDateRange ? { where: { createdAt: range } } : undefined),
        prisma_1.prisma.orderItem.findMany(hasDateRange
            ? {
                where: {
                    order: {
                        createdAt: range,
                    },
                },
            }
            : undefined),
        prisma_1.prisma.khataLedger.findMany(hasDateRange ? { where: { date: range } } : undefined),
        prisma_1.prisma.stockAuditLog.findMany(hasDateRange ? { where: { createdAt: range } } : undefined),
        prisma_1.prisma.reminderLog.findMany(hasDateRange ? { where: { sentAt: range } } : undefined),
        prisma_1.prisma.businessSettings.findUnique({ where: { id: "singleton" } }),
    ]);
    return {
        exportedAt: new Date().toISOString(),
        exportScope: {
            from: options.from ?? null,
            to: options.to ?? null,
        },
        customers,
        bags,
        transports,
        orders,
        orderItems,
        ledger,
        stockLogs,
        reminders,
        settings,
    };
}
//# sourceMappingURL=backup.service.js.map