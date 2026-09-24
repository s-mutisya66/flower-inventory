export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma.js";

export async function GET() {
  const sales = await prisma.sale.findMany({ include: { product: true }, orderBy: { date: "desc" } });
  return NextResponse.json(sales);
}

export async function POST(req) {
  const body = await req.json(); // { productId, qty, date }
  const product = await prisma.product.findUnique({ where: { id: body.productId } });
  if (!product) return NextResponse.json({ error: "product not found" }, { status: 400 });

  const qty = Number(body.qty);
  const unitPrice = product.price;
  const total = qty * unitPrice;

  const [sale] = await prisma.$transaction([
    prisma.sale.create({
      data: { productId: body.productId, qty, unitPrice, total, date: new Date(body.date) },
      include: { product: true },
    }),
    prisma.product.update({ where: { id: body.productId }, data: { stock: { decrement: qty } } }),
  ]);

  return NextResponse.json(sale, { status: 201 });
}
