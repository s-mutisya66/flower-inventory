export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma.js";

export async function PUT(req, { params }) {
  const body = await req.json(); // { supplierId, date, items: [{ productId, qty }] }
  const products = await prisma.product.findMany({
    where: { id: { in: body.items.map((i) => i.productId) } },
  });
  const total = body.items.reduce((sum, it) => {
    const p = products.find((p) => p.id === it.productId);
    return sum + (p ? p.price * Number(it.qty) : 0);
  }, 0);

  await prisma.orderItem.deleteMany({ where: { orderId: params.id } });
  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      supplierId: body.supplierId,
      date: new Date(body.date),
      total,
      items: { create: body.items.map((it) => ({ productId: it.productId, qty: Number(it.qty) })) },
    },
    include: { supplier: true, items: { include: { product: true } } },
  });
  return NextResponse.json(order);
}

export async function DELETE(_req, { params }) {
  await prisma.order.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
