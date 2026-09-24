"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [d, setD] = useState(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setD);
  }, []);

  if (!d) return <div className="empty">Loading…</div>;

  return (
    <>
      <div className="grid">
        <div className="card stat"><b>{d.productCount}</b><span>Products tracked</span></div>
        <div className="card stat"><b>{d.totalItems}</b><span>Total stock units</span></div>
        <div className="card stat"><b>KES {d.invValue.toLocaleString()}</b><span>Inventory value</span></div>
        <div className="card stat"><b>KES {d.revenue.toLocaleString()}</b><span>Total sales revenue</span></div>
      </div>
      <div className="card">
        <h2>⚠️ Low stock ({d.low.length})</h2>
        {d.low.length ? (
          <div className="tablewrap">
            <table>
              <tbody>
                <tr><th>Product</th><th>Stock</th><th>Reorder level</th><th>Supplier</th></tr>
                {d.low.map((p) => (
                  <tr key={p.name}>
                    <td>{p.name}</td><td className="low">{p.stock}</td><td>{p.reorderLevel}</td><td>{p.supplier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">All products are above reorder level.</div>
        )}
      </div>
      <div className="card">
        <h2>📦 Pending purchase orders</h2>
        <div className="empty">{d.pending} order(s) awaiting delivery.</div>
      </div>
    </>
  );
}
