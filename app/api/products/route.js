import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma.js";

export async function GET() {
  const products = await prisma.product.findMany({ include: { supplier: true }, orderBy: { name: "asc" } });
  return NextResponse.json(products);
}

export async function POST(req) {
  const body = await req.json();
  const product = await prisma.product.create({
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
  return NextResponse.json(product, { status: 201 });
}
