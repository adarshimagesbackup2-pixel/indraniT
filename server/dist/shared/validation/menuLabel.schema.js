"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuLabelUpdateSchema = void 0;
const zod_1 = require("zod");
exports.menuLabelUpdateSchema = zod_1.z.object({
    labels: zod_1.z.array(zod_1.z.object({
        key: zod_1.z.string().min(1),
        customLabel: zod_1.z.string().trim().max(50).optional().or(zod_1.z.literal("")),
    })),
});
//# sourceMappingURL=menuLabel.schema.js.map