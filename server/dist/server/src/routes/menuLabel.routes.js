"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const menuLabel_schema_1 = require("@bardan/shared/validation/menuLabel.schema");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma_1 = require("../prisma");
const DEFAULT_KEYS = ["dashboard", "orders", "khata", "stock", "challans", "reminders", "masters"];
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get("/", (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existing = await prisma_1.prisma.menuLabel.findMany();
    const existingKeys = new Set(existing.map((e) => e.key));
    const missing = DEFAULT_KEYS.filter((k) => !existingKeys.has(k));
    if (missing.length > 0) {
        await prisma_1.prisma.menuLabel.createMany({
            data: missing.map((key) => ({ key, customLabel: null })),
            skipDuplicates: true,
        });
    }
    const labels = await prisma_1.prisma.menuLabel.findMany();
    res.json({ success: true, data: labels });
}));
router.put("/", auth_1.requireAdmin, (0, validate_1.validateBody)(menuLabel_schema_1.menuLabelUpdateSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    for (const { key, customLabel } of req.body.labels) {
        await prisma_1.prisma.menuLabel.upsert({
            where: { key },
            update: { customLabel: customLabel || null },
            create: { key, customLabel: customLabel || null },
        });
    }
    const labels = await prisma_1.prisma.menuLabel.findMany();
    res.json({ success: true, data: labels });
}));
exports.default = router;
//# sourceMappingURL=menuLabel.routes.js.map