"use client";
import { useEffect, useState } from "react";
import { downloadCSV } from "../../lib/csv.js";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", contact: "", email: "" });

  async function load() {
    setSuppliers(await fetch("/api/suppliers").then((r) => r.json()));
  }
  useEffect(() => { load(); }, []);

  function startEdit(s) { setEditing(s.id); setForm({ name: s.name, contact: s.contact, email: s.email }); }
  function cancelEdit() { setEditing(null); setForm({ name: "", contact: "", email: "" }); }

  async function submit(e) {
    e.preventDefault();
    const url = editing ? `/api/suppliers/${editing}` : "/api/suppliers";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    cancelEdit();
    load();
  }
  async function remove(id) {
    await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    load();
  }
  function exportCSV() {
    downloadCSV("suppliers.csv", suppliers, [["Name", (s) => s.name], ["Contact", (s) => s.contact], ["Email", (s) => s.email]]);
  }

  return (
    <div className="card">
      <h2>Suppliers <button className="mini" onClick={exportCSV}>Export CSV</button></h2>
      <div className="tablewrap">
        <table>
          <tbody>
            <tr><th>Name</th><th>Contact</th><th>Email</th><th></th></tr>
            {suppliers.length === 0 && <tr><td colSpan={4} className="empty">No suppliers yet.</td></tr>}
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td><td>{s.contact}</td><td>{s.email}</td>
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
        <input placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Phone" required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
        <input placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <button className="btn" type="submit">{editing ? "Save changes" : "Add supplier"}</button>
        {editing && <button type="button" className="mini" onClick={cancelEdit}>Cancel</button>}
      </form>
    </div>
  );
}
