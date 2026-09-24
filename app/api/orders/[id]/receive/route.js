export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma.js";

export async function POST(_req, { params }) {
  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });

  await prisma.$transaction([
    ...order.items.map((it) =>
      prisma.product.update({ where: { id: it.productId }, data: { stock: { increment: it.qty } } })
    ),
    prisma.order.update({ where: { id: params.id }, data: { status: "received" } }),
  ]);

  return NextResponse.json({ ok: true });
}
