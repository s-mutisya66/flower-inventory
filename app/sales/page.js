"use client";
import { useEffect, useState } from "react";
import { downloadCSV } from "../../lib/csv.js";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ productId: "", qty: "", date: "" });

  async function load() {
    const [s, p] = await Promise.all([
      fetch("/api/sales").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]);
    setSales(s); setProducts(p);
  }
  useEffect(() => { load(); }, []);

  function startEdit(s) { setEditing(s.id); setForm({ productId: s.productId, qty: s.qty, date: s.date.slice(0, 10) }); }
  function cancelEdit() { setEditing(null); setForm({ productId: "", qty: "", date: "" }); }

  async function submit(e) {
    e.preventDefault();
    const url = editing ? `/api/sales/${editing}` : "/api/sales";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    cancelEdit();
    load();
  }
  async function remove(id) { await fetch(`/api/sales/${id}`, { method: "DELETE" }); load(); }
  function exportCSV() {
    downloadCSV("sales.csv", sales, [
      ["Date", (s) => s.date.slice(0, 10)], ["Product", (s) => s.product?.name ?? "—"],
      ["Qty", (s) => s.qty], ["Unit Price", (s) => s.unitPrice], ["Total", (s) => s.total],
    ]);
  }

  return (
    <div className="card">
      <h2>Sales <button className="mini" onClick={exportCSV}>Export CSV</button></h2>
      <div className="hint">Recording a new sale deducts the quantity from stock. Editing a sale does not re-adjust stock.</div>
      <div className="tablewrap">
        <table>
          <tbody>
            <tr><th>Date</th><th>Product</th><th>Qty</th><th>Unit price</th><th>Total</th><th></th></tr>
            {sales.length === 0 && <tr><td colSpan={6} className="empty">No sales yet.</td></tr>}
            {sales.map((s) => (
              <tr key={s.id}>
                <td>{s.date.slice(0, 10)}</td><td>{s.product?.name ?? "—"}</td><td>{s.qty}</td>
                <td>KES {s.unitPrice}</td><td>KES {s.total}</td>
                <td>
                  <button className="mini" onClick={() => startEdit(s)}>Edit</button>
                  <button className="mini danger" onClick={() => remove(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form onSubmit={submit}>
        <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} required>
          <option value="">Select product</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name} (KES {p.price})</option>)}
        </select>
        <input type="number" placeholder="Qty" required value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
        <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <button className="btn" type="submit">{editing ? "Save changes" : "Record sale"}</button>
        {editing && <button type="button" className="mini" onClick={cancelEdit}>Cancel</button>}
      </form>
    </div>
  );
}
