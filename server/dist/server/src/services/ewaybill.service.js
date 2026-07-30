"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEwayBillJson = buildEwayBillJson;
const prisma_1 = require("../prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const TRANSPORT_MODE_CODE = { ROAD: "1", RAIL: "2", AIR: "3", SHIP: "4" };
function formatDocDate(date) {
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}
/**
 * Builds the NIC e-Way Bill bulk-upload JSON payload (§1.5) — every field
 * populated from real data now, no blank placeholders. transactionType is
 * always "1" (Regular) since this app doesn't yet support Bill-To-Ship-To
 * or Bill-From-Dispatch-From scenarios.
 */
async function buildEwayBillJson(orderId) {
    const order = await prisma_1.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { bagType: true } }, customer: true, transport: true },
    });
    if (!order)
        throw new errorHandler_1.ApiError(404, "Order not found");
    const settings = await prisma_1.prisma.businessSettings.findUniqueOrThrow({ where: { id: "singleton" } });
    const customer = order.customer;
    return {
        supplyType: "O",
        subSupplyType: "1",
        docType: "INV",
        docNo: order.customerBillNo || order.challanNo,
        docDate: formatDocDate(order.createdAt),
        transactionType: 1,
        fromGstin: settings.businessGstin ?? "",
        fromTrdName: settings.businessName,
        fromAddr1: settings.businessAddressLine1 ?? settings.businessAddress,
        fromAddr2: settings.businessAddressLine2 ?? "",
        fromPlace: settings.businessPlace ?? "",
        fromPincode: settings.businessPincode ?? "",
        fromStateCode: settings.businessStateCode ?? "",
        actFromStateCode: settings.businessStateCode ?? "",
        toGstin: customer.gstin || "URP",
        toTrdName: customer.name,
        toAddr1: customer.address,
        toPlace: customer.address,
        toPincode: customer.pincode ?? "",
        toStateCode: customer.stateCode ?? "",
        actToStateCode: customer.stateCode ?? "",
        shipToGstin: customer.shipToGstin || customer.gstin || "URP",
        shipToAddr1: customer.shipToAddress || customer.address,
        shipToPincode: customer.shipToPincode || customer.pincode || "",
        shipToStateCode: customer.shipToStateCode || customer.stateCode || "",
        totalValue: Number(order.subtotal),
        cgstValue: Number(order.cgstAmount),
        sgstValue: Number(order.sgstAmount),
        igstValue: Number(order.igstAmount),
        totInvValue: Number(order.totalAmount),
        transDistance: order.transDistanceKm ?? 0,
        transMode: TRANSPORT_MODE_CODE[order.transportMode] ?? "1",
        transDocNo: order.transportMode === "ROAD" ? "" : order.transportDocNo ?? "",
        transDocDate: order.transportDocDate ? formatDocDate(order.transportDocDate) : "",
        vehicleNo: order.transport.vehicleNo,
        vehicleType: "R",
        transporterName: order.transport.driverName,
        itemList: order.items.map((item) => ({
            productName: item.bagType.bagType,
            productDesc: item.bagType.bagType,
            hsnCode: item.bagType.hsnCode ?? "6305",
            quantity: item.quantity,
            qtyUnit: item.bagType.unitOfMeasure,
            taxableAmount: Number(item.lineTotal),
            cgstRate: Number(item.gstRate) && Number(item.cgstAmount) > 0 ? Number(item.gstRate) / 2 : 0,
            sgstRate: Number(item.gstRate) && Number(item.sgstAmount) > 0 ? Number(item.gstRate) / 2 : 0,
            igstRate: Number(item.igstAmount) > 0 ? Number(item.gstRate) : 0,
        })),
    };
}
//# sourceMappingURL=ewaybill.service.js.map