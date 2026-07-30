"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMonthlyReminderCron = startMonthlyReminderCron;
exports.stopMonthlyReminderCron = stopMonthlyReminderCron;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../prisma");
const reminder_service_1 = require("../services/reminder.service");
const currency_1 = require("../utils/currency");
const logger_1 = require("../utils/logger");
let scheduledTask = null;
let lastRunDayOfMonth = null;
/**
 * Tier 1 automation (§11): runs every day at 9:00 AM server time, but only
 * *acts* on BusinessSettings.reminderDayOfMonth (checked dynamically since
 * settings can change). It does NOT send messages — that's impossible for
 * free without WhatsApp Business API — instead it computes the pending
 * list and logs a summary so staff sees "reminders ready" on the Reminders
 * page. A real deployment would push this to an admin notification channel
 * (email/push); here it's surfaced via the pending-balance count itself,
 * which the Reminders page already polls live.
 */
function startMonthlyReminderCron() {
    scheduledTask = node_cron_1.default.schedule("0 9 * * *", async () => {
        try {
            const settings = await prisma_1.prisma.businessSettings.findUnique({ where: { id: "singleton" } });
            if (!settings)
                return;
            const today = new Date().getDate();
            if (today !== settings.reminderDayOfMonth)
                return;
            // Avoid re-running twice on the same day if the process restarts.
            if (lastRunDayOfMonth === today)
                return;
            lastRunDayOfMonth = today;
            const candidates = await (0, reminder_service_1.listReminderCandidates)("balance");
            const totalDue = candidates.reduce((sum, c) => sum + c.balance, 0);
            logger_1.logger.info(`Monthly reminder prep: ${candidates.length} customers have outstanding balances totaling ${(0, currency_1.formatIndianCurrency)(totalDue)}. Open Reminders to send WhatsApp messages.`);
        }
        catch (err) {
            logger_1.logger.error("Monthly reminder cron failed", err);
        }
    });
    logger_1.logger.info("Monthly reminder cron scheduled (checks daily at 9:00 AM server time)");
}
function stopMonthlyReminderCron() {
    scheduledTask?.stop();
}
//# sourceMappingURL=monthlyReminder.cron.js.map