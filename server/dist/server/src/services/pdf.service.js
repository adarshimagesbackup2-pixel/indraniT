"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStatementPdf = generateStatementPdf;
const puppeteer_1 = __importDefault(require("puppeteer"));
const prisma_1 = require("../prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const currency_1 = require("../utils/currency");
/**
 * Shared print CSS — the same rules used for on-screen print preview
 * (§7.6), so this PDF is pixel-identical to what "Print" produces in the
 * browser for the customer ledger statement.
 */
const PRINT_CSS = `
  @page { size: A4; margin: 15mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Inter', Arial, sans-serif; color: #334155; font-size: 12px; }
  .mono { font-family: 'Roboto Mono', monospace; }
  h1 { font-size: 18px; margin-bottom: 2px; }
  .header { border-bottom: 2px solid #1F6F3A; padding-bottom: 10px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { border: 1px solid #CBD5E1; padding: 6px 8px; text-align: left; font-size: 11px; }
  th { background: #F1F5F9; }
  .right { text-align: right; }
  .debit { color: #DC2626; }
  .credit { color: #16A34A; }
  .summary { display: flex; gap: 24px; margin-top: 16px; margin-bottom: 8px; }
  .summary div { flex: 1; }
`;
function buildStatementHtml(business, customer, entries, range) {
    const rows = entries
        .map((e) => `
      <tr>
        <td>${new Intl.DateTimeFormat("en-GB").format(e.date)}</td>
        <td class="${e.type === "DEBIT" ? "debit" : "credit"}">${e.type}</td>
        <td>${e.reference}</td>
        <td class="right mono">${e.debit ? (0, currency_1.formatIndianCurrency)(e.debit) : "-"}</td>
        <td class="right mono">${e.credit ? (0, currency_1.formatIndianCurrency)(e.credit) : "-"}</td>
        <td class="right mono">${(0, currency_1.formatIndianCurrency)(e.runningBalance)}</td>
      </tr>`)
        .join("");
    const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);
    const finalBalance = entries.length ? entries[entries.length - 1].runningBalance : 0;
    return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /><style>${PRINT_CSS}</style></head>
      <body>
        <div class="header">
          <h1>${business.businessName}</h1>
          <div>${business.businessAddress}</div>
          <div>Phone: ${business.businessPhone}${business.businessGstin ? ` &nbsp;|&nbsp; GSTIN: ${business.businessGstin}` : ""}</div>
        </div>
        <h2>Customer Ledger Statement</h2>
        <div><strong>${customer.name}</strong> &nbsp;|&nbsp; ${customer.phone}</div>
        <div>${customer.address}${customer.gstin ? ` &nbsp;|&nbsp; GSTIN: ${customer.gstin}` : ""}</div>
        <div>Period: ${range.from ?? "Beginning"} to ${range.to ?? "Today"}</div>
        <table>
          <thead>
            <tr><th>Date</th><th>Type</th><th>Reference</th><th class="right">Debit</th><th class="right">Credit</th><th class="right">Balance</th></tr>
          </thead>
          <tbody>
            ${rows}
            <tr>
              <td colspan="3" class="right"><strong>Total</strong></td>
              <td class="right mono"><strong>${(0, currency_1.formatIndianCurrency)(totalDebit)}</strong></td>
              <td class="right mono"><strong>${(0, currency_1.formatIndianCurrency)(totalCredit)}</strong></td>
              <td class="right mono"><strong>${(0, currency_1.formatIndianCurrency)(finalBalance)}</strong></td>
            </tr>
          </tbody>
        </table>
        <div class="summary">
          <div><strong>Total Debit:</strong> <span class="mono">${(0, currency_1.formatIndianCurrency)(totalDebit)}</span></div>
          <div><strong>Total Credit:</strong> <span class="mono">${(0, currency_1.formatIndianCurrency)(totalCredit)}</span></div>
          <div><strong>Closing Balance:</strong> <span class="mono">${(0, currency_1.formatIndianCurrency)(finalBalance)}</span></div>
        </div>
      </body>
    </html>`;
}
async function generateStatementPdf({ customerId, from, to }) {
    const customer = await prisma_1.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer)
        throw new errorHandler_1.ApiError(404, "Customer not found");
    const business = await prisma_1.prisma.businessSettings.findUniqueOrThrow({ where: { id: "singleton" } });
    const where = { customerId };
    if (from || to) {
        where.date = {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
        };
    }
    const ledgerRows = await prisma_1.prisma.khataLedger.findMany({
        where,
        include: { order: true },
        orderBy: [{ date: "asc" }],
    });
    const entries = ledgerRows.map((row) => ({
        date: row.date,
        type: row.type,
        reference: row.order?.challanNo ?? row.referenceNo ?? "-",
        debit: row.type === "DEBIT" ? Number(row.amount) : 0,
        credit: row.type === "CREDIT" ? Number(row.amount) : 0,
        runningBalance: Number(row.runningBalance),
    }));
    const html = buildStatementHtml(business, customer, entries, { from, to });
    const browser = await puppeteer_1.default.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
        return Buffer.from(pdfBuffer);
    }
    finally {
        await browser.close();
    }
}
//# sourceMappingURL=pdf.service.js.map