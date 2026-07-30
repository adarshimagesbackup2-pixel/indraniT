"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_schema_1 = require("@bardan/shared/validation/order.schema");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const orderService = __importStar(require("../services/order.service"));
const ewaybillService = __importStar(require("../services/ewaybill.service"));
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.post("/", (0, validate_1.validateBody)(order_schema_1.orderCreateSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const order = await orderService.createOrder({
        input: req.body,
        createdById: req.user.userId,
        isAdmin: req.user.role === "ADMIN",
    });
    res.status(201).json({ success: true, data: order });
}));
router.get("/", (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page, pageSize, search, customerId, ewayStatus, vehicleId, from, to, sortBy, sortDir } = req.query;
    const result = await orderService.listOrders({
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        search: search,
        customerId: customerId,
        ewayStatus: ewayStatus,
        vehicleId: vehicleId,
        from: from,
        to: to,
        sortBy: sortBy,
        sortDir: sortDir,
    });
    res.json({ success: true, data: result });
}));
router.get("/:id", (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id);
    res.json({ success: true, data: order });
}));
router.get("/:id/json", (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const payload = await ewaybillService.buildEwayBillJson(req.params.id);
    const order = await orderService.getOrderById(req.params.id);
    res.setHeader("Content-Disposition", `attachment; filename="EWB_${order.challanNo}.json"`);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(payload, null, 2));
}));
router.put("/:id/ewaybill", (0, validate_1.validateBody)(order_schema_1.ewayBillNoSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const order = await orderService.setEwayBillNumber(req.params.id, req.body.ewayBillNo);
    res.json({ success: true, data: order });
}));
// §3 — ADMIN-only edit, with full transactional stock/ledger reversal
router.put("/:id", auth_1.requireAdmin, (0, validate_1.validateBody)(order_schema_1.orderEditSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const order = await orderService.editOrder(req.params.id, req.body, req.user.userId);
    res.json({ success: true, data: order });
}));
// §3 — ADMIN-only cancel, alternative to editing when an e-way bill is already GENERATED
router.post("/:id/cancel", auth_1.requireAdmin, (0, validate_1.validateBody)(order_schema_1.orderCancelSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const order = await orderService.cancelOrder(req.params.id, req.body.cancelReason, req.user.userId);
    res.json({ success: true, data: order });
}));
exports.default = router;
//# sourceMappingURL=order.routes.js.map