"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma_1 = require("../prisma");
const khata_service_1 = require("../services/khata.service");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get("/summary", (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const customers = await prisma_1.prisma.customer.findMany({ where: { isActive: true } });
    const balances = await Promise.all(customers.map((c) => (0, khata_service_1.getLatestRunningBalance)(c.id)));
    const totalOutstanding = balances.reduce((sum, b) => sum + Math.max(b, 0), 0);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const [todaysOrders, monthCollections, bags, recentOrders, recentPayments, recentStock] = await Promise.all([
        prisma_1.prisma.order.findMany({ where: { createdAt: { gte: startOfToday, lte: endOfToday } } }),
        prisma_1.prisma.khataLedger.aggregate({
            where: {
                type: "CREDIT",
                date: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
            _sum: { amount: true },
        }),
        prisma_1.prisma.bagMaster.findMany({ where: { isActive: true } }),
        prisma_1.prisma.order.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { customer: true },
        }),
        prisma_1.prisma.khataLedger.findMany({
            where: { type: "CREDIT" },
            orderBy: { date: "desc" },
            take: 10,
            include: { customer: true },
        }),
        prisma_1.prisma.stockAuditLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { bagType: true },
        }),
    ]);
    const lowStockBags = bags.filter((b) => b.currentStock <= b.lowStockThreshold);
    // last-30-days orders value, for the line chart
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrdersForChart = await prisma_1.prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, totalAmount: true },
    });
    // top 5 customers by outstanding, for the bar chart
    const topCustomers = customers
        .map((c, i) => ({ id: c.id, name: c.name, balance: balances[i] }))
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 5);
    res.json({
        success: true,
        data: {
            totalOutstanding,
            todaysOrdersCount: todaysOrders.length,
            todaysOrdersValue: todaysOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
            monthCollections: Number(monthCollections._sum.amount ?? 0),
            lowStockCount: lowStockBags.length,
            lowStockBags: lowStockBags.map((b) => ({ id: b.id, bagType: b.bagType, currentStock: b.currentStock })),
            last30DaysOrders: recentOrdersForChart,
            topCustomersByOutstanding: topCustomers,
            recentActivity: {
                orders: recentOrders,
                payments: recentPayments,
                stock: recentStock,
            },
        },
    });
}));
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map