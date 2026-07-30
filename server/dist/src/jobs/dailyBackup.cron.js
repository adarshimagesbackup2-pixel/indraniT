"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeEmergencyBackupSnapshot = writeEmergencyBackupSnapshot;
exports.startDailyBackupCron = startDailyBackupCron;
exports.stopDailyBackupCron = stopDailyBackupCron;
const node_cron_1 = __importDefault(require("node-cron"));
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const backup_service_1 = require("../services/backup.service");
const logger_1 = require("../utils/logger");
let dailyBackupTask = null;
let lastBackupDate = null;
function getBackupDirectory() {
    return node_path_1.default.resolve(__dirname, "../../backups");
}
async function writeEmergencyBackupSnapshot() {
    const todayKey = new Date().toISOString().slice(0, 10);
    const backupDirectory = getBackupDirectory();
    await promises_1.default.mkdir(backupDirectory, { recursive: true });
    const backup = await (0, backup_service_1.exportFullBackup)();
    const fileName = `bardan-erp-emergency-backup-${todayKey}.json`;
    const filePath = node_path_1.default.join(backupDirectory, fileName);
    await promises_1.default.writeFile(filePath, JSON.stringify(backup, (_key, value) => (value?.constructor?.name === "Decimal" ? Number(value) : value), 2), "utf8");
    lastBackupDate = todayKey;
    logger_1.logger.info(`Emergency backup snapshot written to ${filePath}`);
}
async function writeDailyBackupSnapshot() {
    const todayKey = new Date().toISOString().slice(0, 10);
    if (lastBackupDate === todayKey) {
        return;
    }
    const backupDirectory = getBackupDirectory();
    await promises_1.default.mkdir(backupDirectory, { recursive: true });
    const backup = await (0, backup_service_1.exportFullBackup)();
    const fileName = `bardan-erp-backup-${todayKey}.json`;
    const filePath = node_path_1.default.join(backupDirectory, fileName);
    await promises_1.default.writeFile(filePath, JSON.stringify(backup, (_key, value) => (value?.constructor?.name === "Decimal" ? Number(value) : value), 2), "utf8");
    lastBackupDate = todayKey;
    logger_1.logger.info(`Daily backup snapshot written to ${filePath}`);
}
function startDailyBackupCron() {
    if (dailyBackupTask)
        return;
    void writeDailyBackupSnapshot().catch((err) => {
        logger_1.logger.error("Initial daily backup run failed", err);
    });
    dailyBackupTask = node_cron_1.default.schedule("0 0 * * *", async () => {
        try {
            await writeDailyBackupSnapshot();
        }
        catch (err) {
            logger_1.logger.error("Daily backup cron failed", err);
        }
    });
    logger_1.logger.info("Daily backup cron scheduled (runs immediately on startup and at midnight server time)");
}
function stopDailyBackupCron() {
    dailyBackupTask?.stop();
    dailyBackupTask = null;
}
//# sourceMappingURL=dailyBackup.cron.js.map