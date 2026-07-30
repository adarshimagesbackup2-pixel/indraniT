"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const backup_service_1 = require("../services/backup.service");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth, auth_1.requireAdmin);
router.get("/export", (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { from, to } = req.query;
    const backup = await (0, backup_service_1.exportFullBackup)({ from, to });
    const dateStamp = new Date().toISOString().slice(0, 10);
    const suffix = from || to ? `-${[from ?? "all", to ?? "all"].join("-to-")}` : "";
    res.setHeader("Content-Disposition", `attachment; filename="bardan-erp-backup-${dateStamp}${suffix}.json"`);
    res.setHeader("Content-Type", "application/json");
    // JSON.stringify with a replacer so Prisma Decimal objects serialize as plain numbers.
    res.send(JSON.stringify(backup, (_key, value) => (value?.constructor?.name === "Decimal" ? Number(value) : value), 2));
}));
exports.default = router;
//# sourceMappingURL=backup.routes.js.map