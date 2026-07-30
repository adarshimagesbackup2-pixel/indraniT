"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCustomers = listCustomers;
exports.getCustomerById = getCustomerById;
exports.createCustomer = createCustomer;
exports.updateCustomer = updateCustomer;
exports.deleteCustomer = deleteCustomer;
exports.setBlacklist = setBlacklist;
const prisma_1 = require("../prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const khata_service_1 = require("./khata.service");
const audit_service_1 = require("./audit.service");
async function listCustomers(filters) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 25;
    const where = { isActive: true };
    if (filters.blacklistedOnly)
        where.isBlacklisted = true;
    if (filters.search) {
        where.OR = [
            { name: { contains: filters.search, mode: "insensitive" } },
            { phone: { contains: filters.search } },
        ];
    }
    const [total, customers] = await Promise.all([
        prisma_1.prisma.customer.count({ where }),
        prisma_1.prisma.customer.findMany({
            where,
            orderBy: { [filters.sortBy ?? "name"]: filters.sortDir ?? "asc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
    ]);
    const withBalances = await Promise.all(customers.map(async (c) => ({ ...c, outstandingBalance: await (0, khata_service_1.getLatestRunningBalance)(c.id) })));
    return { data: withBalances, total, page, pageSize };
}
async function getCustomerById(id) {
    const customer = await prisma_1.prisma.customer.findUnique({ where: { id } });
    if (!customer)
        throw new errorHandler_1.ApiError(404, "Customer not found");
    const outstandingBalance = await (0, khata_service_1.getLatestRunningBalance)(id);
    return {
        ...customer,
        outstandingBalance,
        creditRemaining: Number(customer.creditLimit) > 0 ? Number(customer.creditLimit) - outstandingBalance : null,
    };
}
async function createCustomer(input, createdById) {
    const customer = await prisma_1.prisma.customer.create({
        data: {
            name: input.name,
            phone: input.phone,
            address: input.address,
            gstin: input.gstin || null,
            trademarkName: input.trademarkName || null,
            openingBalance: input.openingBalance,
            openingBalanceType: input.openingBalanceType,
            creditLimit: input.creditLimit,
            stateCode: input.stateCode,
            pincode: input.pincode,
            shipToAddress: input.shipToAddress || null,
            shipToGstin: input.shipToGstin || null,
            shipToPincode: input.shipToPincode || null,
            shipToStateCode: input.shipToStateCode || null,
        },
    });
    if (Number(input.openingBalance) > 0) {
        const openingBalance = Number(input.openingBalance);
        const currentBalance = await (0, khata_service_1.getLatestRunningBalance)(customer.id);
        const newRunningBalance = input.openingBalanceType === "DEBIT" ? currentBalance + openingBalance : currentBalance - openingBalance;
        await prisma_1.prisma.khataLedger.create({
            data: {
                customerId: customer.id,
                type: input.openingBalanceType,
                amount: openingBalance,
                runningBalance: newRunningBalance,
                notes: "Opening khata balance",
                createdById: createdById ?? customer.id,
            },
        });
    }
    return customer;
}
async function updateCustomer(id, input, updatedById) {
    const existing = await prisma_1.prisma.customer.findUnique({ where: { id } });
    if (!existing)
        throw new errorHandler_1.ApiError(404, "Customer not found");
    return prisma_1.prisma.customer.update({
        where: { id },
        data: {
            ...(input.name !== undefined ? { name: input.name } : {}),
            ...(input.phone !== undefined ? { phone: input.phone } : {}),
            ...(input.address !== undefined ? { address: input.address } : {}),
            ...(input.gstin !== undefined ? { gstin: input.gstin || null } : {}),
            ...(input.trademarkName !== undefined ? { trademarkName: input.trademarkName || null } : {}),
            ...(input.openingBalance !== undefined ? { openingBalance: input.openingBalance } : {}),
            ...(input.openingBalanceType !== undefined ? { openingBalanceType: input.openingBalanceType } : {}),
            ...(input.creditLimit !== undefined ? { creditLimit: input.creditLimit } : {}),
            ...(input.stateCode !== undefined ? { stateCode: input.stateCode } : {}),
            ...(input.pincode !== undefined ? { pincode: input.pincode } : {}),
            ...(input.shipToAddress !== undefined ? { shipToAddress: input.shipToAddress || null } : {}),
            ...(input.shipToGstin !== undefined ? { shipToGstin: input.shipToGstin || null } : {}),
            ...(input.shipToPincode !== undefined ? { shipToPincode: input.shipToPincode || null } : {}),
            ...(input.shipToStateCode !== undefined ? { shipToStateCode: input.shipToStateCode || null } : {}),
        },
    });
}
async function deleteCustomer(id) {
    const existing = await prisma_1.prisma.customer.findUnique({ where: { id } });
    if (!existing)
        throw new errorHandler_1.ApiError(404, "Customer not found");
    const ledgerCount = await prisma_1.prisma.khataLedger.count({ where: { customerId: id } });
    if (ledgerCount > 0) {
        throw new errorHandler_1.ApiError(422, "This customer has ledger history and cannot be deleted. They have been archived instead.");
    }
    return prisma_1.prisma.customer.update({ where: { id }, data: { isActive: false } });
}
/** §4 — ADMIN-only blacklist toggle. Reason required when blacklisting; cleared when un-blacklisting. */
async function setBlacklist(id, input, performedById) {
    const existing = await prisma_1.prisma.customer.findUnique({ where: { id } });
    if (!existing)
        throw new errorHandler_1.ApiError(404, "Customer not found");
    const updated = await prisma_1.prisma.customer.update({
        where: { id },
        data: input.isBlacklisted
            ? {
                isBlacklisted: true,
                blacklistReason: input.blacklistReason,
                blacklistedAt: new Date(),
                blacklistedById: performedById,
            }
            : {
                isBlacklisted: false,
                blacklistReason: null,
                blacklistedAt: null,
                blacklistedById: null,
            },
    });
    await (0, audit_service_1.writeAuditLog)(prisma_1.prisma, {
        action: input.isBlacklisted ? "CUSTOMER_BLACKLISTED" : "CUSTOMER_UNBLACKLISTED",
        entityType: "Customer",
        entityId: id,
        performedById,
        details: { reason: input.blacklistReason },
    });
    return updated;
}
//# sourceMappingURL=customer.service.js.map