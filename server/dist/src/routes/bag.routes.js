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
const bag_schema_1 = require("@bardan/shared/validation/bag.schema");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const bagService = __importStar(require("../services/bag.service"));
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get("/", (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const bags = await bagService.listBags();
    res.json({ success: true, data: bags });
}));
router.post("/", (0, validate_1.validateBody)(bag_schema_1.bagCreateSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const bag = await bagService.createBag(req.body);
    res.status(201).json({ success: true, data: bag });
}));
router.put("/:id", (0, validate_1.validateBody)(bag_schema_1.bagUpdateSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const bag = await bagService.updateBag(req.params.id, req.body);
    res.json({ success: true, data: bag });
}));
// §7.4 — low stock reorder suggestion based on last 30 days' consumption
router.get("/:id/reorder-suggestion", (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const suggestedQuantity = await bagService.suggestReorderQuantity(req.params.id);
    res.json({ success: true, data: { suggestedQuantity } });
}));
exports.default = router;
//# sourceMappingURL=bag.routes.js.map