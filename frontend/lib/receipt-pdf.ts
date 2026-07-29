"use client";

import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

export type ReceiptKind = "invoice" | "receipt";

export interface ReceiptLineItem {
  description: string;
  quantity?: number;
  unitPrice: number;
  amount: number;
}

export interface ReceiptPdfData {
  /** Invoice = pre-payment (UNPAID). Receipt = post-payment (PAID). Defaults to receipt. */
  kind?: ReceiptKind;
  /** Internal order identifier (e.g., full MongoDB ObjectId) */
  orderId?: string;
  /** Order number used for invoice generation (short code) */
  orderNumber: string;
  /** Optional explicit invoice number (overrides default INV- prefix) */
  invoiceNumber?: string;
  service: string;
  status: string;
  escrowStatus: string;
  /** Total amount in NPR (inclusive of tax). */
  amount: number;
  scheduledAt: string;
  address: string;
  customer: string;
  customerEmail?: string;
  customerPhone?: string;
  professional: string;
  notes?: string;
  /** Optional itemised breakdown. If omitted, a default FixHub breakdown is derived. */
  lineItems?: ReceiptLineItem[];
  /** VAT rate used to derive the default breakdown, e.g. 0.13. Defaults to 0.13. */
  taxRate?: number;
  /** Date of issue; defaults to now. */
  issuedAt?: string;
  /** Optional payment provider label (eSewa / Khalti) shown on receipts. */
  paymentProvider?: string;
}

// ── Brand palette (matches the FixHub logo + dashboard) ────────────────────────
const NAVY: [number, number, number] = [30, 41, 59]; // #1E293B  (logo icon / primary text)
const BLUE: [number, number, number] = [37, 99, 235]; // #2563EB  (logo wordmark / accent)
const INK: [number, number, number] = [51, 65, 85]; // #334155
const MUTED: [number, number, number] = [148, 163, 184]; // #94A3B8
const LINE: [number, number, number] = [226, 232, 240]; // #E2E8F0
const ZEBRA: [number, number, number] = [248, 250, 252]; // #F8FAFC
const EMERALD: [number, number, number] = [16, 185, 129]; // PAID
const AMBER: [number, number, number] = [217, 119, 6]; // UNPAID

const PAGE_MARGIN = 40;
const CURRENCY = "NPR";

function safeString(value: unknown, fallback = "N/A"): string {
  if (value === null || value === undefined) return fallback;
  return String(value).trim() || fallback;
}

function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function safeDate(value: unknown): string {
  if (!value) return "N/A";
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return safeString(value);
  return d.toLocaleString();
}

function money(n: number): string {
  return `${CURRENCY} ${safeNumber(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Derives the same itemised breakdown the customer sees on the checkout screen
 * (base fee + component parts + asset surcharge + VAT). Used when no explicit
 * lineItems are supplied so every receipt/invoice looks consistent.
 *
 * Mirrors frontend/app/dashboard/services/[slug]/page.tsx invoice math.
 */
export function deriveLineItems(total: number, taxRate = 0.13, serviceTitle?: string): ReceiptLineItem[] {
  const totalAmount = safeNumber(total);
  const subtotal = round2(totalAmount / (1 + taxRate));
  const surcharge = round2(Math.min(150, subtotal * 0.08));
  const componentParts = round2(subtotal * 0.22);
  const baseServiceFee = round2(subtotal - surcharge - componentParts);
  const title = serviceTitle ? safeString(serviceTitle) : "Service Fee";

  return [
    { description: `${title} (Base Fee)`, quantity: 1, unitPrice: baseServiceFee, amount: baseServiceFee },
    { description: "Component Parts & Materials", quantity: 1, unitPrice: componentParts, amount: componentParts },
    { description: "Asset & Logistics Surcharge", quantity: 1, unitPrice: surcharge, amount: surcharge },
  ];
}

// ── Logo loading (cached, graceful fallback) ───────────────────────────────────
let logoDataUrlPromise: Promise<string | null> | null = null;

async function loadLogoDataUrl(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = (async () => {
      try {
        const res = await fetch("/images/fixhub.png", { cache: "force-cache" });
        if (!res.ok) return null;
        const blob = await res.blob();
        return await new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    })();
  }
  return logoDataUrlPromise;
}

// Fallback: render the FixHub wordmark in vector text when the logo asset fails to load.
function drawWordmark(doc: jsPDF, x: number, y: number, height: number): number {
  const fontSize = height * 1.15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);
  // Geometric mark: small rounded square in blue with a white "F".
  const mark = fontSize * 0.9;
  doc.setFillColor(...BLUE);
  doc.roundedRect(x, y - mark * 0.78, mark, mark, mark * 0.18, mark * 0.18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(mark * 0.62);
  const fTextY = (y - mark * 0.18) + (mark * 0.62 * 0.35);
  doc.text("F", x + mark * 0.5, fTextY, { align: "center" });
  // Wordmark text.
  const textX = x + mark + mark * 0.22;
  doc.setFontSize(fontSize);
  doc.setTextColor(...NAVY);
  const wFix = doc.getTextWidth("Fix");
  const textY = y + (fontSize * 0.35);
  doc.text("Fix", textX, textY);
  doc.setTextColor(...BLUE);
  doc.text("Hub", textX + wFix, textY);
  return textX + wFix + doc.getTextWidth("Hub");
}

export async function buildReceiptPdf(data: ReceiptPdfData): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const contentW = pageW - PAGE_MARGIN * 2;

  const kind: ReceiptKind = data.kind === "invoice" ? "invoice" : "receipt";
  const isInvoice = kind === "invoice";

  const orderNumber = safeString(data.orderNumber, "UNKNOWN");
  const orderId = data.orderId ? safeString(data.orderId) : undefined;
  const invoiceNumber = data.invoiceNumber ? safeString(data.invoiceNumber) : (isInvoice ? `INV-${orderNumber}` : `Fixhub-${orderNumber}`);
  const docNumber = invoiceNumber;
  const issuedAt = data.issuedAt ? safeDate(data.issuedAt) : new Date().toLocaleString();
  const scheduledAt = safeDate(data.scheduledAt);
  const totalAmount = safeNumber(data.amount);
  const taxRate = safeNumber(data.taxRate, 0.13) || 0.13;
  const service = safeString(data.service);
  const status = safeString(data.status).replace(/_/g, " ");
  const escrow = safeString(data.escrowStatus).replace(/_/g, " ");
  const customer = safeString(data.customer);
  const customerEmail = data.customerEmail ? safeString(data.customerEmail) : undefined;
  const customerPhone = data.customerPhone ? safeString(data.customerPhone) : undefined;
  const professional = safeString(data.professional);
  const address = safeString(data.address);
  const notes = data.notes ? safeString(data.notes) : undefined;

  const rawLineItems = (data.lineItems && data.lineItems.length > 0
    ? data.lineItems
    : deriveLineItems(totalAmount, taxRate, service)
  ).map((li) => ({
    description: safeString(li.description),
    quantity: li.quantity && li.quantity > 0 ? li.quantity : 1,
    unitPrice: safeNumber(li.unitPrice),
    amount: safeNumber(li.amount),
  }));

  // Filter out any VAT item from table body so VAT is only shown in the totals section below
  const tableLineItems = rawLineItems.filter((li) => !/tax|vat/i.test(li.description));
  const subtotal = round2(tableLineItems.reduce((sum, li) => sum + li.amount, 0));
  const vatAmount = round2(totalAmount - subtotal);

  // ── HEADER: logo (left) + document meta (right) ─────────────────────────────
  const logoTop = 48;
  const logoHeight = 34;
  let logoRight = PAGE_MARGIN;
  const logoDataUrl = await loadLogoDataUrl();
  if (logoDataUrl) {
    try {
      const logoWidth = logoHeight * 3.07;
      doc.addImage(logoDataUrl, "PNG", PAGE_MARGIN, logoTop - logoHeight * 0.5, logoWidth, logoHeight, undefined, "FAST");
      logoRight = PAGE_MARGIN + logoWidth;
    } catch {
      logoRight = drawWordmark(doc, PAGE_MARGIN, logoTop, logoHeight) + 8;
    }
  } else {
    logoRight = drawWordmark(doc, PAGE_MARGIN, logoTop, logoHeight) + 8;
  }

  // Company tagline under the wordmark.
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("Instant Home Services · Kathmandu, Nepal", PAGE_MARGIN, logoTop + logoHeight * 0.5 + 8);

  // Right-aligned document title + meta.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...NAVY);
  doc.text(isInvoice ? "INVOICE" : "RECEIPT", pageW - PAGE_MARGIN, logoTop + 4, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  const meta = [
    `Number: ${docNumber}`,
    `Date of issue: ${issuedAt}`,
    ...(orderId ? [`Order ID: ${orderId}`] : []),
  ];
  if (!isInvoice && data.paymentProvider) {
    meta.push(`Paid via: ${safeString(data.paymentProvider)}`);
  }
  meta.forEach((line, i) =>
    doc.text(line, pageW - PAGE_MARGIN, logoTop + 20 + i * 13, { align: "right" })
  );

  // Divider under header.
  let y = Math.max(logoTop + logoHeight * 0.5 + 22, logoTop + 20 + meta.length * 13 + 8);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.line(PAGE_MARGIN, y, pageW - PAGE_MARGIN, y);
  y += 24;

  // ── BILL TO / SERVICE-FOR + status stamp ────────────────────────────────────
  const stampText = isInvoice ? "UNPAID" : "PAID";
  const stampColor = isInvoice ? AMBER : EMERALD;
  const stampWidth = 84;
  const stampHeight = 22;
  const stampX = pageW - PAGE_MARGIN - stampWidth;
  const stampY = y - 2;

  // Status stamp (top-right of this block) with exact vertical centering.
  doc.setFillColor(...stampColor);
  doc.roundedRect(stampX, stampY, stampWidth, stampHeight, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  const stampFontSize = 10;
  doc.setFontSize(stampFontSize);
  doc.setTextColor(255, 255, 255);
  const stampTextY = stampY + (stampHeight / 2) + (stampFontSize * 0.35);
  doc.text(stampText, stampX + stampWidth / 2, stampTextY, { align: "center" });

  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("BILL TO", PAGE_MARGIN, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...NAVY);
  doc.text(customer, PAGE_MARGIN, y + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  let by = y + 30;
  if (customerEmail) {
    doc.text(customerEmail, PAGE_MARGIN, by);
    by += 13;
  }
  if (customerPhone) {
    doc.text(customerPhone, PAGE_MARGIN, by);
    by += 13;
  }
  doc.text(address, PAGE_MARGIN, by);
  by += 13;

  y = Math.max(by, y + 24) + 18;

  // ── SERVICE BRIEF (two-column key facts) ────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("SERVICE DETAILS", PAGE_MARGIN, y);
  y += 6;

  const serviceRows: [string, string][] = [
    ["Service Name", service],
    ["Scheduled Date", scheduledAt],
    ["Assigned Professional", professional],
    ["Booking Status", status],
    ["Escrow Protection", escrow],
  ];
  autoTable(doc, {
    startY: y,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    theme: "plain",
    styles: { cellPadding: { top: 3, bottom: 3, left: 0, right: 4 }, fontSize: 9, lineColor: LINE, lineWidth: { bottom: 0.5 } },
    columnStyles: {
      0: { textColor: MUTED, fontStyle: "bold", cellWidth: 130 },
      1: { textColor: INK, cellWidth: contentW - 130 },
    },
    body: serviceRows,
  });
  // @ts-expect-error lastAutoTable is injected by the plugin at runtime
  y = (doc.lastAutoTable?.finalY ?? y) + 24;

  // ── LINE ITEMS TABLE ────────────────────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    head: [["Description", "Qty", "Unit Price", "Amount"]],
    body: tableLineItems.map((li) => [
      li.description,
      String(li.quantity),
      money(li.unitPrice),
      money(li.amount),
    ]),
    theme: "striped",
    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: 6,
    },
    alternateRowStyles: { fillColor: ZEBRA },
    bodyStyles: { textColor: INK, fontSize: 9, cellPadding: 6 },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 50, halign: "center" },
      2: { cellWidth: 90, halign: "right" },
      3: { cellWidth: 100, halign: "right", fontStyle: "bold" },
    },
  });
  // @ts-expect-error lastAutoTable is injected by the plugin at runtime
  y = doc.lastAutoTable.finalY + 16;

  // ── TOTALS (right-aligned block) ────────────────────────────────────────────
  const totalsW = 240;
  const totalsX = pageW - PAGE_MARGIN - totalsW;
  const totals: [string, string, boolean][] = [];

  if (vatAmount > 0) {
    totals.push(["Subtotal (Excl. VAT)", money(subtotal), false]);
    totals.push(["Government VAT (13%)", money(vatAmount), false]);
  } else {
    totals.push(["Subtotal", money(totalAmount), false]);
  }
  totals.push([isInvoice ? "Total Amount Due" : "Total Amount Paid", money(totalAmount), true]);

  let ty = y;
  for (const [label, value, isTotal] of totals) {
    if (isTotal) {
      const boxHeight = 30;
      const boxY = ty;
      doc.setFillColor(...BLUE);
      doc.roundedRect(totalsX, boxY, totalsW, boxHeight, 5, 5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      const totalFontSize = 11;
      doc.setFontSize(totalFontSize);
      const textY = boxY + (boxHeight / 2) + (totalFontSize * 0.35);
      doc.text(label, totalsX + 12, textY);
      doc.text(value, totalsX + totalsW - 12, textY, { align: "right" });
      ty += boxHeight + 10;
    } else {
      doc.setTextColor(...INK);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(label, totalsX + 12, ty + 10);
      doc.text(value, totalsX + totalsW - 12, ty + 10, { align: "right" });
      ty += 18;
    }
  }
  y = ty + 8;

  // ── NOTES ───────────────────────────────────────────────────────────────────
  if (notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("NOTES", PAGE_MARGIN, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    const wrapped = doc.splitTextToSize(notes, contentW);
    doc.text(wrapped, PAGE_MARGIN, y);
    y += wrapped.length * 12 + 8;
  }

  // ── FOOTER ──────────────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  const footerY = pageH - 44;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.line(PAGE_MARGIN, footerY - 12, pageW - PAGE_MARGIN, footerY - 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    isInvoice
      ? "This is a pro-forma invoice. Payment is due to confirm your booking. Escrow is held until service completion."
      : "Thank you for booking with FixHub. This receipt was issued electronically and is valid without signature.",
    PAGE_MARGIN,
    footerY
  );
  doc.text("support@fixhub.com  ·  fixhub.com", pageW - PAGE_MARGIN, footerY, { align: "right" });

  // Metadata
  doc.setProperties({
    title: `${isInvoice ? "Invoice" : "Receipt"} ${docNumber}`,
    subject: `${service} — FixHub`,
    author: "FixHub",
    creator: "FixHub",
  });

  return doc;
}

export async function downloadReceiptPdf(data: ReceiptPdfData): Promise<void> {
  try {
    const doc = await buildReceiptPdf(data);
    const orderNumber = safeString(data.orderNumber, "UNKNOWN");
    const prefix = data.kind === "invoice" ? "Invoice" : "Fixhub";
    const filename = `${prefix}-${orderNumber}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error("Failed to generate receipt PDF:", err);
    alert("Failed to download receipt. Please try again.");
  }
}

// ── Jobs Report PDF ──────────────────────────────────────────────────────────

export interface JobReportEntry {
  jobId: string;
  serviceTitle: string;
  customerName: string;
  status: string;
  amount: number;
  scheduledAt: string;
  address: string;
  escrowStatus: string;
}

export async function downloadJobsReportPdf(
  professionalName: string,
  jobs: JobReportEntry[]
): Promise<void> {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const logoTop = 52;
    const logoHeight = 34;
    const logoDataUrl = await loadLogoDataUrl();

    if (logoDataUrl) {
      try {
        const logoWidth = logoHeight * 3.07;
        doc.addImage(logoDataUrl, "PNG", PAGE_MARGIN, logoTop - logoHeight * 0.5, logoWidth, logoHeight, undefined, "FAST");
      } catch {
        drawWordmark(doc, PAGE_MARGIN, logoTop, logoHeight);
      }
    } else {
      drawWordmark(doc, PAGE_MARGIN, logoTop, logoHeight);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Instant Home Services · Kathmandu, Nepal", PAGE_MARGIN, logoTop + logoHeight * 0.5 + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...NAVY);
    doc.text("JOBS REPORT", pageW - PAGE_MARGIN, logoTop + 4, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(`Professional: ${professionalName}`, pageW - PAGE_MARGIN, logoTop + 20, { align: "right" });
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageW - PAGE_MARGIN, logoTop + 33, { align: "right" });

    let y = Math.max(logoTop + logoHeight * 0.5 + 22, logoTop + 33 + 14);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(1);
    doc.line(PAGE_MARGIN, y, pageW - PAGE_MARGIN, y);
    y += 18;

    const completed = jobs.filter(j => j.status.toLowerCase() === "completed");
    const totalEarnings = completed.reduce((sum, j) => sum + j.amount, 0);
    const active = jobs.filter(j => j.status.toLowerCase() === "in_progress" || j.status.toLowerCase() === "confirmed");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    doc.text(
      `Total Jobs: ${jobs.length}   ·   Completed: ${completed.length}   ·   Active: ${active.length}   ·   Total Earnings: NPR ${totalEarnings.toLocaleString()}`,
      PAGE_MARGIN, y
    );
    y += 20;

    autoTable(doc, {
      startY: y,
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      head: [["Job ID", "Service", "Customer", "Date", "Status", "Amount (NPR)"]],
      body: jobs.map(j => [
        `#${j.jobId.slice(-8).toUpperCase()}`,
        j.serviceTitle,
        j.customerName,
        new Date(j.scheduledAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        j.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        j.amount.toLocaleString(),
      ]),
      headStyles: {
        fillColor: NAVY as [number, number, number],
        textColor: [255, 255, 255] as [number, number, number],
        fontStyle: "bold",
        fontSize: 8,
        cellPadding: 6,
      },
      bodyStyles: { fontSize: 8, textColor: INK as [number, number, number], cellPadding: 5 },
      alternateRowStyles: { fillColor: ZEBRA as [number, number, number] },
      columnStyles: {
        0: { cellWidth: 75, fontStyle: "bold", textColor: BLUE as [number, number, number] },
        5: { halign: "right", fontStyle: "bold" },
      },
    });

    const footerY = pageH - 28;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.line(PAGE_MARGIN, footerY - 12, pageW - PAGE_MARGIN, footerY - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text("FixHub · Instant Home Services · Kathmandu, Nepal", PAGE_MARGIN, footerY);
    doc.text("support@fixhub.com  ·  fixhub.com", pageW - PAGE_MARGIN, footerY, { align: "right" });

    doc.save(`FixHub-Jobs-Report-${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (err) {
    console.error("Failed to generate jobs report PDF:", err);
    alert("Failed to download report. Please try again.");
  }
}
