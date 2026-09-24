import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma.js";

export async function PUT(req, { params }) {
  const body = await req.json();
  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: body.name,
      category: body.category,
      price: Number(body.price),
      stock: Number(body.stock),
      reorderLevel: Number(body.reorderLevel),
      unit: body.unit,
      supplierId: body.supplierId || null,
    },
  });
  return NextResponse.json(product);
}

export async function DELETE(_req, { params }) {
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
