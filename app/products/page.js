"use client";
import { useEffect, useState } from "react";
import { downloadCSV } from "../../lib/csv.js";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank());

  function blank() {
    return { name: "", category: "", price: "", stock: "", reorderLevel: "", unit: "", supplierId: "" };
  }

  async function load() {
    const [p, s] = await Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/suppliers").then((r) => r.json()),
    ]);
    setProducts(p);
    setSuppliers(s);
  }
  useEffect(() => { load(); }, []);

  function startEdit(p) {
    setEditing(p.id);
    setForm({ name: p.name, category: p.category, price: p.price, stock: p.stock, reorderLevel: p.reorderLevel, unit: p.unit, supplierId: p.supplierId || "" });
  }
  function cancelEdit() { setEditing(null); setForm(blank()); }

  async function submit(e) {
    e.preventDefault();
    const url = editing ? `/api/products/${editing}` : "/api/products";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    cancelEdit();
    load();
  }
  async function remove(id) {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }
  function exportCSV() {
    downloadCSV("products.csv", products, [
      ["Name", (p) => p.name], ["Category", (p) => p.category], ["Price", (p) => p.price],
      ["Stock", (p) => p.stock], ["Reorder Level", (p) => p.reorderLevel], ["Unit", (p) => p.unit],
      ["Supplier", (p) => p.supplier?.name ?? "—"],
    ]);
  }

  return (
    <div className="card">
      <h2>Products <button className="mini" onClick={exportCSV}>Export CSV</button></h2>
      <div className="tablewrap">
        <table>
          <tbody>
            <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Reorder</th><th>Supplier</th><th></th></tr>
            {products.length === 0 && <tr><td colSpan={7} className="empty">No products yet.</td></tr>}
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td><td>{p.category}</td><td>KES {p.price}</td>
                <td className={p.stock < p.reorderLevel ? "low" : ""}>{p.stock} {p.unit}</td>
                <td>{p.reorderLevel}</td><td>{p.supplier?.name ?? "—"}</td>
                <td>
                  <button className="mini" onClick={() => startEdit(p)}>Edit</button>
                  <button className="mini danger" onClick={() => remove(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form onSubmit={submit}>
        <input placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Category" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input type="number" placeholder="Price" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input type="number" placeholder="Stock" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <input type="number" placeholder="Reorder level" required value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} />
        <input placeholder="Unit (stem/bunch)" required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
        <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
          <option value="">No supplier</option>
          {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button className="btn" type="submit">{editing ? "Save changes" : "Add product"}</button>
        {editing && <button type="button" className="mini" onClick={cancelEdit}>Cancel</button>}
      </form>
    </div>
  );
}
