"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordPayment = recordPayment;
const prisma_1 = require("../prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const khata_service_1 = require("./khata.service");
/**
 * Records a CREDIT ledger entry. Per §6.6: amount validated > 0 upstream,
 * newRunningBalance can go negative (customer advance/credit — shown in
 * UI as green "Advance ₹X"). No stock or order impact.
 */
async function recordPayment(input, createdById) {
    return prisma_1.prisma.$transaction(async (tx) => {
        const customer = await tx.customer.findUnique({ where: { id: input.customerId } });
        if (!customer || !customer.isActive) {
            throw new errorHandler_1.ApiError(422, "Customer not found or inactive");
        }
        const lastBalance = await (0, khata_service_1.getLatestRunningBalance)(customer.id, tx);
        const newRunningBalance = lastBalance - input.amount;
        return tx.khataLedger.create({
            data: {
                customerId: customer.id,
                type: "CREDIT",
                amount: input.amount,
                paymentMode: input.paymentMode,
                referenceNo: input.referenceNo || null,
                notes: input.notes || null,
                runningBalance: newRunningBalance,
                date: new Date(input.paymentDate),
                createdById,
            },
        });
    });
}
//# sourceMappingURL=payment.service.js.map