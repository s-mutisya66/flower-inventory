import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma.js";

export async function PUT(req, { params }) {
  const body = await req.json(); // { productId, qty, date } - does not re-adjust stock
  const product = await prisma.product.findUnique({ where: { id: body.productId } });
  const qty = Number(body.qty);
  const total = product ? product.price * qty : 0;

  const sale = await prisma.sale.update({
    where: { id: params.id },
    data: { productId: body.productId, qty, unitPrice: product?.price ?? 0, total, date: new Date(body.date) },
    include: { product: true },
  });
  return NextResponse.json(sale);
}

export async function DELETE(_req, { params }) {
  await prisma.sale.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
