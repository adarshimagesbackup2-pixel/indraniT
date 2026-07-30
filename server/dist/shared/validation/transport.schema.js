"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transportUpdateSchema = exports.transportSchema = void 0;
const zod_1 = require("zod");
const auth_schema_1 = require("./auth.schema");
exports.transportSchema = zod_1.z.object({
    vehicleNo: zod_1.z.string().trim().min(1, "Vehicle number is required").max(20),
    driverName: zod_1.z.string().trim().min(1, "Driver name is required").max(200),
    driverPhone: auth_schema_1.phoneSchema,
});
exports.transportUpdateSchema = exports.transportSchema.partial();
//# sourceMappingURL=transport.schema.js.map