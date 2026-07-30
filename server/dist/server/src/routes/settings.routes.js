"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_schema_1 = require("@bardan/shared/validation/settings.schema");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma_1 = require("../prisma");
const khata_service_1 = require("../services/khata.service");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get("/", (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const settings = await prisma_1.prisma.businessSettings.findUniqueOrThrow({ where: { id: "singleton" } });
    res.json({ success: true, data: settings });
}));
router.put("/", auth_1.requireAdmin, (0, validate_1.validateBody)(settings_schema_1.settingsUpdateSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const b = req.body;
    const settings = await prisma_1.prisma.businessSettings.update({
        where: { id: "singleton" },
        data: {
            businessName: b.businessName,
            businessGstin: b.businessGstin || null,
            businessAddress: b.businessAddress,
            businessPhone: b.businessPhone,
            whatsappTemplate: b.whatsappTemplate,
            gstEnabledDefault: b.gstEnabledDefault,
            cgstPercent: b.cgstPercent,
            sgstPercent: b.sgstPercent,
            ewayThreshold: b.ewayThreshold,
            reminderDayOfMonth: b.reminderDayOfMonth,
            businessPincode: b.businessPincode || null,
            businessStateCode: b.businessStateCode || null,
            businessAddressLine1: b.businessAddressLine1 || null,
            businessAddressLine2: b.businessAddressLine2 || null,
            businessPlace: b.businessPlace || null,
            turnoverAboveFiveCr: b.turnoverAboveFiveCr,
            defaultTransportMode: b.defaultTransportMode,
            defaultTransportationReason: b.defaultTransportationReason,
            ewayThresholdIntrastate: b.ewayThresholdIntrastate,
            ewayThresholdInterstate: b.ewayThresholdInterstate,
            numberingMode: b.numberingMode,
            financialYearStartMonth: b.financialYearStartMonth,
        },
    });
    res.json({ success: true, data: settings });
}));
router.post("/recalculate-balances", auth_1.requireAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, khata_service_1.recalculateAllBalances)();
    res.json({ success: true, data: result });
}));
// §7.10 — full database backup/export, ADMIN only
router.get("/backup", auth_1.requireAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const [customers, bags, transports, orders, orderItems, ledger, stockLogs, settings, reminders] = await Promise.all([
        prisma_1.prisma.customer.findMany(),
        prisma_1.prisma.bagMaster.findMany(),
        prisma_1.prisma.transport.findMany(),
        prisma_1.prisma.order.findMany(),
        prisma_1.prisma.orderItem.findMany(),
        prisma_1.prisma.khataLedger.findMany(),
        prisma_1.prisma.stockAuditLog.findMany(),
        prisma_1.prisma.businessSettings.findMany(),
        prisma_1.prisma.reminderLog.findMany(),
    ]);
    const backup = {
        exportedAt: new Date().toISOString(),
        customers,
        bags,
        transports,
        orders,
        orderItems,
        ledger,
        stockLogs,
        settings,
        reminders,
    };
    const filename = `bardan-erp-backup-${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(backup, null, 2));
}));
exports.default = router;
//# sourceMappingURL=settings.routes.js.map