"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma_1 = require("../prisma");
const khata_service_1 = require("../services/khata.service");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
/** Overview register: all customers + balances, per §8.3. */
router.get("/", (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const customers = await prisma_1.prisma.customer.findMany({ where: { isActive: true } });
    const rows = await Promise.all(customers.map(async (c) => {
        const [totalBilled, totalPaid, lastPayment] = await Promise.all([
            prisma_1.prisma.khataLedger.aggregate({
                where: { customerId: c.id, type: "DEBIT" },
                _sum: { amount: true },
            }),
            prisma_1.prisma.khataLedger.aggregate({
                where: { customerId: c.id, type: "CREDIT" },
                _sum: { amount: true },
            }),
            prisma_1.prisma.khataLedger.findFirst({
                where: { customerId: c.id, type: "CREDIT" },
                orderBy: { date: "desc" },
            }),
        ]);
        const netOutstanding = await (0, khata_service_1.getLatestRunningBalance)(c.id);
        return {
            customerId: c.id,
            name: c.name,
            phone: c.phone,
            totalBilled: Number(totalBilled._sum.amount ?? 0),
            totalPaid: Number(totalPaid._sum.amount ?? 0),
            netOutstanding,
            status: netOutstanding <= 0 ? "Clear" : "Pending",
            lastPaymentDate: lastPayment?.date ?? null,
        };
    }));
    res.json({ success: true, data: rows });
}));
/** Full transaction history + summary for one customer, per §8.3. */
router.get("/:customerId", (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { customerId } = req.params;
    const { from, to } = req.query;
    const customer = await prisma_1.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer)
        throw new errorHandler_1.ApiError(404, "Customer not found");
    const where = { customerId };
    if (from || to) {
        where.date = {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
        };
    }
    const entries = await prisma_1.prisma.khataLedger.findMany({
        where,
        include: { order: true },
        orderBy: [{ date: "asc" }],
    });
    const outstandingBalance = await (0, khata_service_1.getLatestRunningBalance)(customerId);
    const lastPayment = await prisma_1.prisma.khataLedger.findFirst({
        where: { customerId, type: "CREDIT" },
        orderBy: { date: "desc" },
    });
    res.json({
        success: true,
        data: {
            customer,
            outstandingBalance,
            creditRemaining: Number(customer.creditLimit) > 0
                ? Number(customer.creditLimit) - outstandingBalance
                : null,
            lastPaymentDate: lastPayment?.date ?? null,
            lastPaymentAmount: lastPayment ? Number(lastPayment.amount) : null,
            entries,
        },
    });
}));
exports.default = router;
//# sourceMappingURL=khata.routes.js.map