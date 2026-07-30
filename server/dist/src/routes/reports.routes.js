"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const pdf_service_1 = require("../services/pdf.service");
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get("/khata/:customerId/pdf", (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { customerId } = req.params;
    const { from, to } = req.query;
    const customer = await prisma_1.prisma.customer.findUnique({ where: { id: customerId } });
    const pdfBuffer = await (0, pdf_service_1.generateStatementPdf)({
        customerId,
        from: from,
        to: to,
    });
    const safeName = (customer?.trademarkName ?? customer?.name ?? "Customer").replace(/[^a-zA-Z0-9]+/g, "_");
    const fromLabel = from ?? "start";
    const toLabel = to ?? "today";
    const filename = `${safeName}_Statement_${fromLabel}_${toLabel}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
}));
exports.default = router;
//# sourceMappingURL=reports.routes.js.map