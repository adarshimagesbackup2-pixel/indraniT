"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransports = listTransports;
exports.createTransport = createTransport;
exports.updateTransport = updateTransport;
exports.deactivateTransport = deactivateTransport;
const prisma_1 = require("../prisma");
const errorHandler_1 = require("../middleware/errorHandler");
async function listTransports() {
    return prisma_1.prisma.transport.findMany({
        where: { isActive: true },
        orderBy: { vehicleNo: "asc" },
    });
}
async function createTransport(input) {
    return prisma_1.prisma.transport.create({ data: input });
}
async function updateTransport(id, input) {
    const existing = await prisma_1.prisma.transport.findUnique({ where: { id } });
    if (!existing)
        throw new errorHandler_1.ApiError(404, "Vehicle not found");
    return prisma_1.prisma.transport.update({ where: { id }, data: input });
}
async function deactivateTransport(id) {
    const existing = await prisma_1.prisma.transport.findUnique({ where: { id } });
    if (!existing)
        throw new errorHandler_1.ApiError(404, "Vehicle not found");
    return prisma_1.prisma.transport.update({ where: { id }, data: { isActive: false } });
}
//# sourceMappingURL=transport.service.js.map