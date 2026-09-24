export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma.js";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { supplier: true, items: { include: { product: true } } },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req) {
  const body = await req.json(); // { supplierId, date, items: [{ productId, qty }] }
  const products = await prisma.product.findMany({
    where: { id: { in: body.items.map((i) => i.productId) } },
  });
  const total = body.items.reduce((sum, it) => {
    const p = products.find((p) => p.id === it.productId);
    return sum + (p ? p.price * Number(it.qty) : 0);
  }, 0);

  const order = await prisma.order.create({
    data: {
      supplierId: body.supplierId,
      date: new Date(body.date),
      status: "pending",
      total,
      items: { create: body.items.map((it) => ({ productId: it.productId, qty: Number(it.qty) })) },
    },
    include: { supplier: true, items: { include: { product: true } } },
  });
  return NextResponse.json(order, { status: 201 });
}
