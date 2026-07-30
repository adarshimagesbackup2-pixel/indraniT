"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorHandler_1 = require("./middleware/errorHandler");
const monthlyReminder_cron_1 = require("./jobs/monthlyReminder.cron");
const dailyBackup_cron_1 = require("./jobs/dailyBackup.cron");
const logger_1 = require("./utils/logger");
const dailyBackup_cron_2 = require("./jobs/dailyBackup.cron");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const bag_routes_1 = __importDefault(require("./routes/bag.routes"));
const transport_routes_1 = __importDefault(require("./routes/transport.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const khata_routes_1 = __importDefault(require("./routes/khata.routes"));
const stock_routes_1 = __importDefault(require("./routes/stock.routes"));
const reminder_routes_1 = __importDefault(require("./routes/reminder.routes"));
const reports_routes_1 = __importDefault(require("./routes/reports.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const menuLabel_routes_1 = __importDefault(require("./routes/menuLabel.routes"));
const auditLog_routes_1 = __importDefault(require("./routes/auditLog.routes"));
const backup_routes_1 = __importDefault(require("./routes/backup.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 4000;
// §13 Security checklist
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Basic trim/control-character sanitization on all string body fields (§13).
app.use((req, _res, next) => {
    if (req.body && typeof req.body === "object") {
        for (const key of Object.keys(req.body)) {
            const value = req.body[key];
            if (typeof value === "string") {
                // eslint-disable-next-line no-control-regex
                req.body[key] = value.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
            }
        }
    }
    next();
});
app.get("/api/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));
app.use("/api/auth", auth_routes_1.default);
app.use("/api/customers", customer_routes_1.default);
app.use("/api/bags", bag_routes_1.default);
app.use("/api/transports", transport_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api/payments", payment_routes_1.default);
app.use("/api/khata", khata_routes_1.default);
app.use("/api/stock", stock_routes_1.default);
app.use("/api/reminders", reminder_routes_1.default);
app.use("/api/reports", reports_routes_1.default);
app.use("/api/settings", settings_routes_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
app.use("/api/menu-labels", menuLabel_routes_1.default);
app.use("/api/audit-log", auditLog_routes_1.default);
app.use("/api/backup", backup_routes_1.default);
app.use(errorHandler_1.errorHandler);
const server = app.listen(PORT, () => {
    logger_1.logger.info(`Bardan ERP server listening on port ${PORT}`);
    (0, monthlyReminder_cron_1.startMonthlyReminderCron)();
    (0, dailyBackup_cron_1.startDailyBackupCron)();
    void (0, dailyBackup_cron_2.writeEmergencyBackupSnapshot)().catch((err) => {
        logger_1.logger.error("Initial emergency backup failed", err);
    });
});
const shutdown = async () => {
    logger_1.logger.info("Shutting down server, writing emergency backup snapshot...");
    try {
        await (0, dailyBackup_cron_2.writeEmergencyBackupSnapshot)();
    }
    catch (err) {
        logger_1.logger.error("Emergency backup on shutdown failed", err);
    }
    server.close(() => process.exit(0));
};
process.on("SIGINT", () => {
    void shutdown();
});
process.on("SIGTERM", () => {
    void shutdown();
});
process.on("uncaughtException", async (err) => {
    logger_1.logger.error("Unhandled exception, writing emergency backup", err);
    try {
        await (0, dailyBackup_cron_2.writeEmergencyBackupSnapshot)();
    }
    catch (backupErr) {
        logger_1.logger.error("Emergency backup after uncaught exception failed", backupErr);
    }
    process.exit(1);
});
process.on("unhandledRejection", async (reason) => {
    logger_1.logger.error("Unhandled rejection, writing emergency backup", reason);
    try {
        await (0, dailyBackup_cron_2.writeEmergencyBackupSnapshot)();
    }
    catch (backupErr) {
        logger_1.logger.error("Emergency backup after unhandled rejection failed", backupErr);
    }
    process.exit(1);
});
//# sourceMappingURL=index.js.map