// generateReceiptPDF.js
// Uses jsPDF loaded from CDN.
// Order shape from orderController listOrders / verifyOrder:
//   order._id, order.orderNumber, order.date, order.tableNo, order.tableNumber
//   order.status, order.payment, order.paymentMethod
//   order.amount, order.promoCode, order.promoDiscount
//   order.items[] → { name, price, quantity, status, paidBy[], specialInstructions }

const loadJsPDF = () =>
  new Promise((resolve, reject) => {
    if (window.jspdf) return resolve(window.jspdf.jsPDF);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => resolve(window.jspdf.jsPDF);
    s.onerror = reject;
    document.head.appendChild(s);
  });

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};
const fmtTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};
const fmtDT = (d) => (d ? `${fmtDate(d)}, ${fmtTime(d)}` : "—");

/** Mirrors isItemFullyPaid from MyOrders / orderController */
const itemIsPaid = (item) => {
  if (!item) return false;
  if (item.status === "fully_paid") return true;
  if (item.paidBy && item.paidBy.length > 0) {
    const paid  = item.paidBy.reduce((s, p) => s + (p.amount || 0), 0);
    const total = (item.price || 0) * (item.quantity || 1);
    return paid >= total - 0.01;
  }
  return false;
};

/**
 * @param {Object} params
 * @param {Array}  params.orders          - One or more order objects (already fetched, items populated)
 * @param {string} [params.tableNumber]
 * @param {string} [params.restaurantName]
 */
export const generateReceiptPDF = async ({
  orders = [],
  tableNumber = "",
  restaurantName = "Orderly",
}) => {
  if (!orders.length) {
    console.error("[generateReceiptPDF] No orders passed – aborting");
    return;
  }

  const JsPDF = await loadJsPDF();
  const doc   = new JsPDF({ unit: "mm", format: "a4" });

  // ── palette ──────────────────────────────────────────────
  const ORANGE  = [230, 92, 25];
  const INK     = [17, 17, 16];
  const INK_50  = [118, 118, 114];
  const INK_10  = [228, 228, 226];
  const GREEN   = [16, 185, 129];
  const WHITE   = [255, 255, 255];
  const BG_SOFT = [248, 248, 246];
  const BG_WARM = [253, 245, 236];

  const PW = 210, PH = 297, M = 18, CW = PW - M * 2;
  let y = 0;

  const setFill = (c) => doc.setFillColor(...c);
  const setDraw = (c) => doc.setDrawColor(...c);
  const setTC   = (c) => doc.setTextColor(...c);
  const font    = (style = "normal", size = 10) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
  };
  const newPage = () => { doc.addPage(); y = M; };
  const guard   = (need = 10) => { if (y + need > PH - M) newPage(); };

  // ── HEADER ───────────────────────────────────────────────
  setFill(ORANGE);
  doc.rect(0, 0, PW, 52, "F");

  font("bold", 26); setTC(WHITE);
  doc.text(restaurantName, M, 22);
  font("normal", 9);
  doc.setTextColor(255, 220, 195);
  doc.text("Official Receipt", M, 31);

  const now = new Date();
  const rid = `RCP-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}-${Math.floor(Math.random()*9000+1000)}`;

  font("normal", 8); doc.setTextColor(255, 220, 195);
  doc.text("Receipt ID", PW - M, 16, { align: "right" });
  font("bold", 9); setTC(WHITE);
  doc.text(rid, PW - M, 22, { align: "right" });

  font("normal", 8); doc.setTextColor(255, 220, 195);
  doc.text("Issued", PW - M, 30, { align: "right" });
  font("normal", 8.5); setTC(WHITE);
  doc.text(fmtDT(now.toISOString()), PW - M, 36, { align: "right" });

  // Table number — prefer param, then pick from first order
  const tbl =
    tableNumber ||
    orders[0]?.tableNo ||
    orders[0]?.tableNumber ||
    "";
  if (tbl) {
    font("bold", 9); setTC(WHITE);
    doc.text(`Table ${tbl}`, PW - M, 44, { align: "right" });
  }

  y = 62;

  // ── AGGREGATE STATS ──────────────────────────────────────
  let totalQty = 0, subtotal = 0, paidAmt = 0, unpaidAmt = 0;

  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const price = parseFloat(item.price) || 0;
      const qty   = parseInt(item.quantity, 10) || 1;
      const line  = +(price * qty).toFixed(2);
      totalQty   += qty;
      subtotal   += line;
      if (itemIsPaid(item)) paidAmt   += line;
      else                  unpaidAmt += line;
    });
  });

  const promoDiscount = orders.reduce((s, o) => s + (o.promoDiscount || 0), 0);
  const grandTotal    = +(subtotal - promoDiscount).toFixed(2);

  // ── SUMMARY CARDS ────────────────────────────────────────
  const cW = (CW - 8) / 3, cH = 22;
  [
    { label: "Total Orders", value: String(orders.length),        sub: "orders",        color: ORANGE },
    { label: "Total Items",  value: String(totalQty),             sub: "items ordered", color: [59, 130, 246] },
    { label: "Grand Total",  value: `€${grandTotal.toFixed(2)}`,  sub: "amount due",    color: GREEN },
  ].forEach((card, i) => {
    const cx = M + i * (cW + 4);
    setFill(BG_SOFT); setDraw(INK_10);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, y, cW, cH, 3, 3, "FD");
    setFill(card.color);
    doc.roundedRect(cx, y, 3, cH, 1.5, 1.5, "F");
    font("normal", 7.5); setTC(INK_50);
    doc.text(card.label.toUpperCase(), cx + 7, y + 7);
    font("bold", 13);
    doc.setTextColor(...card.color);
    doc.text(card.value, cx + 7, y + 15);
    font("normal", 7); setTC(INK_50);
    doc.text(card.sub, cx + 7, y + 20);
  });

  y += cH + 12;

  // ── ORDERS ───────────────────────────────────────────────
  orders.forEach((order, oi) => {
    const items = order.items || [];

    // Safety: if no items, show a placeholder row
    const displayItems = items.length > 0 ? items : [{ name: "—", price: 0, quantity: 0 }];

    guard(35);

    // Order header bar
    setFill(BG_WARM); setDraw(ORANGE);
    doc.setLineWidth(0.4);
    doc.roundedRect(M, y, CW, 14, 2, 2, "FD");

    font("bold", 9.5); setTC(ORANGE);
    doc.text(`Order #${order.orderNumber || oi + 1}`, M + 5, y + 5.5);

    font("normal", 8); setTC(INK_50);
    const dt = order.date || order.createdAt;
    doc.text(`Placed: ${fmtDT(dt)}`, M + 5, y + 11);

    // Payment method (right side)
    font("normal", 7.5); setTC(INK_50);
    const pm = order.paymentMethod || "—";
    doc.text(pm, PW - M - 4, y + 5.5, { align: "right" });

    // Status pill
    const statusRaw = (order.status || "pending").toLowerCase();
    const statusTxt = statusRaw.toUpperCase();
    const sBg = statusRaw.includes("deliver") ? GREEN
              : statusRaw.includes("process")  ? [59, 130, 246]
              : ORANGE;
    setFill(sBg);
    doc.roundedRect(PW - M - 28, y + 6, 26, 7, 2, 2, "F");
    font("bold", 6.5); setTC(WHITE);
    doc.text(statusTxt, PW - M - 15, y + 10.5, { align: "center" });

    y += 18;

    // Column headers
    guard(8);
    setFill(INK_10);
    doc.rect(M, y, CW, 7, "F");
    font("bold", 7.5); setTC(INK_50);
    doc.text("ITEM",       M + 4,      y + 4.8);
    doc.text("QTY",        M + 97,     y + 4.8);
    doc.text("UNIT PRICE", M + 112,    y + 4.8);
    doc.text("STATUS",     M + 138,    y + 4.8);
    doc.text("TOTAL",      PW - M - 4, y + 4.8, { align: "right" });
    y += 7;

    // Item rows
    let orderSub = 0;
    displayItems.forEach((item, ii) => {
      const price = parseFloat(item.price) || 0;
      const qty   = parseInt(item.quantity, 10) || 1;
      const line  = +(price * qty).toFixed(2);
      const paid  = itemIsPaid(item);
      orderSub   += line;

      const note  = item.specialInstructions
        ? (item.specialInstructions.length > 50
            ? item.specialInstructions.substring(0, 48) + "…"
            : item.specialInstructions)
        : null;
      const rowH  = note ? 12.5 : 8.5;

      guard(rowH + 1);

      // Row bg
      setFill(ii % 2 === 0 ? WHITE : BG_SOFT);
      doc.rect(M, y, CW, rowH, "F");

      // Left status stripe
      setFill(paid ? GREEN : ORANGE);
      doc.rect(M, y, 2, rowH, "F");

      // Name
      const name = (item.name || "Item");
      const short = name.length > 42 ? name.substring(0, 40) + "…" : name;
      font("normal", 8.5); setTC(INK);
      doc.text(short, M + 4, y + 5.5);

      // Note
      if (note) {
        font("italic", 6.5); setTC(INK_50);
        doc.text(`↳ ${note}`, M + 6, y + 10.5);
      }

      // Qty
      font("normal", 8.5); setTC(INK);
      doc.text(String(qty), M + 100, y + 5.5);

      // Unit price
      doc.text(`€${price.toFixed(2)}`, M + 112, y + 5.5);

      // Status pill
      doc.setFillColor(...(paid ? GREEN : ORANGE));
      doc.roundedRect(M + 136, y + 1.5, 18, 5.5, 1.5, 1.5, "F");
      font("bold", 6); setTC(WHITE);
      doc.text(paid ? "PAID" : "UNPAID", M + 145, y + 5.2, { align: "center" });

      // Line total
      font("bold", 8.5);
      doc.setTextColor(...(paid ? GREEN : INK));
      doc.text(`€${line.toFixed(2)}`, PW - M - 4, y + 5.5, { align: "right" });

      // Separator
      setDraw(INK_10);
      doc.setLineWidth(0.2);
      doc.line(M, y + rowH, PW - M, y + rowH);

      y += rowH + 0.5;
    });

    // Per-order subtotal
    guard(10);
    setFill(BG_SOFT);
    doc.rect(M + CW * 0.55, y, CW * 0.45, 8, "F");
    font("normal", 8); setTC(INK_50);
    doc.text("Order Subtotal", M + CW * 0.57, y + 5.2);
    font("bold", 8.5); setTC(INK);
    doc.text(`€${orderSub.toFixed(2)}`, PW - M - 4, y + 5.2, { align: "right" });
    y += 16;
  });

  // ── TOTALS ───────────────────────────────────────────────
  guard(65);
  setDraw(INK_10);
  doc.setLineWidth(0.5);
  doc.line(M, y, PW - M, y);
  y += 8;

  font("bold", 11); setTC(INK);
  doc.text("Summary", M, y);
  y += 8;

  const rows = [
    { label: "Subtotal",     value: `€${subtotal.toFixed(2)}`, color: INK },
    { label: "Paid",         value: `€${paidAmt.toFixed(2)}`,  color: GREEN },
    {
      label: "Unpaid",
      value: `€${unpaidAmt.toFixed(2)}`,
      color: unpaidAmt > 0.009 ? ORANGE : INK_50,
    },
  ];

  // Promo row
  const promoLabel = orders.find((o) => o.promoCode)?.promoCode || "";
  if (promoDiscount > 0) {
    rows.push({
      label: `Promo${promoLabel ? ` (${promoLabel})` : ""}`,
      value: `-€${promoDiscount.toFixed(2)}`,
      color: GREEN,
    });
  }

  rows.forEach((row) => {
    guard(8);
    setFill(BG_SOFT);
    doc.rect(M + CW * 0.45, y, CW * 0.55, 7, "F");
    font("normal", 9); setTC(INK_50);
    doc.text(row.label, M + CW * 0.47, y + 4.8);
    font("bold", 9);
    doc.setTextColor(...row.color);
    doc.text(row.value, PW - M - 4, y + 4.8, { align: "right" });
    y += 8;
  });

  // Grand total band
  guard(16);
  setFill(ORANGE);
  doc.roundedRect(M + CW * 0.4, y, CW * 0.6, 13, 2, 2, "F");
  font("bold", 10); setTC(WHITE);
  doc.text("GRAND TOTAL", M + CW * 0.42, y + 8.5);
  font("bold", 13);
  doc.text(`€${grandTotal.toFixed(2)}`, PW - M - 4, y + 8.5, { align: "right" });
  y += 22;

  // ── FOOTER ───────────────────────────────────────────────
  guard(28);
  doc.setLineDash([2, 2], 0);
  setDraw(INK_10); doc.setLineWidth(0.4);
  doc.line(M, y, PW - M, y);
  doc.setLineDash([], 0);
  y += 8;

  font("bold", 10); setTC(ORANGE);
  doc.text("Thank you for dining with us!", PW / 2, y, { align: "center" });
  y += 6;
  font("normal", 8); setTC(INK_50);
  doc.text("This is your official receipt. Please keep it for your records.", PW / 2, y, { align: "center" });
  y += 5;
  doc.text(`Generated on ${fmtDT(now.toISOString())} · ${restaurantName}`, PW / 2, y, { align: "center" });

  // Page numbers
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    font("normal", 7); setTC(INK_50);
    doc.text(`Page ${i} of ${pages}`, PW - M, PH - 8, { align: "right" });
    doc.text(restaurantName, M, PH - 8);
  }

  // ── SAVE ─────────────────────────────────────────────────
  const dateStr = now.toISOString().split("T")[0];
  const tblStr  = tbl ? `table${tbl}-` : "";
  doc.save(`receipt-${tblStr}${dateStr}.pdf`);
};