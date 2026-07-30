"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReminderCandidates = listReminderCandidates;
exports.buildReminderMessage = buildReminderMessage;
exports.logReminderSent = logReminderSent;
const prisma_1 = require("../prisma");
const khata_service_1 = require("./khata.service");
const currency_1 = require("../utils/currency");
/**
 * Every customer with netBalance > 0, per §8.6. Sort options: Highest
 * Balance (default) / Name / Last Payment Date (oldest first — surfaces
 * the most overdue).
 */
async function listReminderCandidates(sortBy = "balance") {
    const customers = await prisma_1.prisma.customer.findMany({ where: { isActive: true } });
    const candidates = [];
    for (const customer of customers) {
        const balance = await (0, khata_service_1.getLatestRunningBalance)(customer.id);
        if (balance <= 0)
            continue;
        const lastReminder = await prisma_1.prisma.reminderLog.findFirst({
            where: { customerId: customer.id },
            orderBy: { sentAt: "desc" },
        });
        const lastPayment = await prisma_1.prisma.khataLedger.findFirst({
            where: { customerId: customer.id, type: "CREDIT" },
            orderBy: { date: "desc" },
        });
        candidates.push({
            customerId: customer.id,
            name: customer.name,
            phone: customer.phone,
            balance,
            lastReminderSentAt: lastReminder?.sentAt ?? null,
            lastPaymentDate: lastPayment?.date ?? null,
        });
    }
    if (sortBy === "name") {
        candidates.sort((a, b) => a.name.localeCompare(b.name));
    }
    else if (sortBy === "lastPayment") {
        candidates.sort((a, b) => {
            const aTime = a.lastPaymentDate?.getTime() ?? 0;
            const bTime = b.lastPaymentDate?.getTime() ?? 0;
            return aTime - bTime; // oldest first — most overdue
        });
    }
    else {
        candidates.sort((a, b) => b.balance - a.balance);
    }
    return candidates;
}
/** Substitutes the 4 template variables per §8.6 / §11. */
function buildReminderMessage(template, vars) {
    const currentDate = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date());
    return template
        .replaceAll("{customer_name}", vars.customerName)
        .replaceAll("{current_date}", currentDate)
        .replaceAll("{balance_amount}", (0, currency_1.formatIndianCurrency)(vars.balanceAmount).replace("₹", ""))
        .replaceAll("{business_name}", vars.businessName);
}
async function logReminderSent(customerId, balanceAtSend) {
    return prisma_1.prisma.reminderLog.create({
        data: { customerId, balanceAtSend, channel: "whatsapp" },
    });
}
//# sourceMappingURL=reminder.service.js.map