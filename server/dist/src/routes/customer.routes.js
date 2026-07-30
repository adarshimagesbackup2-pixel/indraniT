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
const customer_schema_1 = require("@bardan/shared/validation/customer.schema");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const customerService = __importStar(require("../services/customer.service"));
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get("/", (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page, pageSize, search, sortBy, sortDir, blacklistedOnly } = req.query;
    const result = await customerService.listCustomers({
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        search: search,
        sortBy: sortBy,
        sortDir: sortDir,
        blacklistedOnly: blacklistedOnly === "true",
    });
    res.json({ success: true, data: result });
}));
router.get("/:id", (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const customer = await customerService.getCustomerById(req.params.id);
    res.json({ success: true, data: customer });
}));
router.post("/", (0, validate_1.validateBody)(customer_schema_1.customerSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const customer = await customerService.createCustomer(req.body, req.user?.userId);
    res.status(201).json({ success: true, data: customer });
}));
router.put("/:id", (0, validate_1.validateBody)(customer_schema_1.customerUpdateSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (req.body.creditLimit !== undefined && req.user?.role !== "ADMIN") {
        throw new errorHandler_1.ApiError(403, "Only an ADMIN can change a customer's credit limit");
    }
    const customer = await customerService.updateCustomer(req.params.id, req.body, req.user?.userId);
    res.json({ success: true, data: customer });
}));
// §4 — ADMIN-only blacklist toggle
router.put("/:id/blacklist", auth_1.requireAdmin, (0, validate_1.validateBody)(customer_schema_1.blacklistToggleSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const customer = await customerService.setBlacklist(req.params.id, req.body, req.user.userId);
    res.json({ success: true, data: customer });
}));
router.delete("/:id", auth_1.requireAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    await customerService.deleteCustomer(req.params.id);
    res.json({ success: true, data: null });
}));
exports.default = router;
//# sourceMappingURL=customer.routes.js.map