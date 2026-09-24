export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma.js";

export async function GET() {
  const products = await prisma.product.findMany({ include: { supplier: true } });
  const sales = await prisma.sale.findMany();
  const orders = await prisma.order.findMany();

  const totalItems = products.reduce((s, p) => s + p.stock, 0);
  const invValue = products.reduce((s, p) => s + p.stock * p.price, 0);
  const revenue = sales.reduce((s, x) => s + x.total, 0);
  const low = products.filter((p) => p.stock < p.reorderLevel);
  const pending = orders.filter((o) => o.status === "pending").length;

  return NextResponse.json({
    productCount: products.length,
    totalItems,
    invValue,
    revenue,
    pending,
    low: low.map((p) => ({ name: p.name, stock: p.stock, reorderLevel: p.reorderLevel, supplier: p.supplier?.name ?? "—" })),
  });
}
