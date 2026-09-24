"use client";
import { useEffect, useState } from "react";
import { downloadCSV } from "../../lib/csv.js";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ supplierId: "", date: "", items: [] });
  const [draftProduct, setDraftProduct] = useState("");
  const [draftQty, setDraftQty] = useState("");

  async function load() {
    const [o, s, p] = await Promise.all([
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/suppliers").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]);
    setOrders(o); setSuppliers(s); setProducts(p);
  }
  useEffect(() => { load(); }, []);

  function startEdit(o) {
    setEditing(o.id);
    setDraft({ supplierId: o.supplierId, date: o.date.slice(0, 10), items: o.items.map((it) => ({ productId: it.productId, qty: it.qty })) });
  }
  function cancelEdit() { setEditing(null); setDraft({ supplierId: "", date: "", items: [] }); }

  function addItem() {
    if (!draftProduct || !draftQty) return;
    const qty = Number(draftQty);
    setDraft((d) => {
      const existing = d.items.find((it) => it.productId === draftProduct);
      const items = existing
        ? d.items.map((it) => (it.productId === draftProduct ? { ...it, qty: it.qty + qty } : it))
        : [...d.items, { productId: draftProduct, qty }];
      return { ...d, items };
    });
    setDraftQty("");
  }
  function removeItem(idx) {
    setDraft((d) => ({ ...d, items: d.items.filter((_, i) => i !== idx) }));
  }
  function prodName(id) { return products.find((p) => p.id === id)?.name ?? "—"; }

  async function submit(e) {
    e.preventDefault();
    if (!draft.supplierId || !draft.date || draft.items.length === 0) {
      alert("Select a supplier, a date, and add at least one item.");
      return;
    }
    const url = editing ? `/api/orders/${editing}` : "/api/orders";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    cancelEdit();
    load();
  }
  async function remove(id) { await fetch(`/api/orders/${id}`, { method: "DELETE" }); load(); }
  async function receive(id) { await fetch(`/api/orders/${id}/receive`, { method: "POST" }); load(); }
  function exportCSV() {
    downloadCSV("orders.csv", orders, [
      ["Supplier", (o) => o.supplier?.name ?? "—"], ["Date", (o) => o.date.slice(0, 10)],
      ["Items", (o) => o.items.map((it) => `${it.product?.name} x${it.qty}`).join("; ")],
      ["Status", (o) => o.status], ["Total", (o) => o.total],
    ]);
  }

  return (
    <div className="card">
      <h2>Purchase orders <button className="mini" onClick={exportCSV}>Export CSV</button></h2>
      <div className="hint">Receiving an order adds its quantities back into stock. Orders can hold multiple products.</div>
      <div className="tablewrap">
        <table>
          <tbody>
            <tr><th>Supplier</th><th>Date</th><th>Items</th><th>Status</th><th>Total</th><th></th></tr>
            {orders.length === 0 && <tr><td colSpan={6} className="empty">No orders yet.</td></tr>}
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.supplier?.name ?? "—"}</td><td>{o.date.slice(0, 10)}</td>
                <td>{o.items.map((it) => `${it.product?.name} x${it.qty}`).join(", ")}</td>
                <td><span className={`badge ${o.status}`}>{o.status}</span></td>
                <td>KES {o.total}</td>
                <td>
                  {o.status === "pending" && <button className="mini" onClick={() => receive(o.id)}>Receive</button>}
                  <button className="mini" onClick={() => startEdit(o)}>Edit</button>
                  <button className="mini danger" onClick={() => remove(o.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form onSubmit={submit}>
        <select value={draft.supplierId} onChange={(e) => setDraft({ ...draft, supplierId: e.target.value })}>
          <option value="">Select supplier</option>
          {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} required />
        <div style={{ display: "flex", gap: 8, width: "100%", flexWrap: "wrap" }}>
          <select value={draftProduct} onChange={(e) => setDraftProduct(e.target.value)}>
            <option value="">Select product</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input type="number" placeholder="Qty" min="1" value={draftQty} onChange={(e) => setDraftQty(e.target.value)} />
          <button type="button" className="btn" onClick={addItem}>+ Add item</button>
        </div>
        {draft.items.length > 0 ? (
          <div className="tablewrap">
            <table>
              <tbody>
                <tr><th>Product</th><th>Qty</th><th></th></tr>
                {draft.items.map((it, idx) => (
                  <tr key={idx}>
                    <td>{prodName(it.productId)}</td><td>{it.qty}</td>
                    <td><button type="button" className="mini danger" onClick={() => removeItem(idx)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">No items added yet.</div>
        )}
        <button className="btn" type="submit">{editing ? "Save changes" : "Place order"}</button>
        {editing && <button type="button" className="mini" onClick={cancelEdit}>Cancel</button>}
      </form>
    </div>
  );
}
