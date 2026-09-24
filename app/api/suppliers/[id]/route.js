import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma.js";

export async function PUT(req, { params }) {
  const body = await req.json();
  const supplier = await prisma.supplier.update({
    where: { id: params.id },
    data: { name: body.name, contact: body.contact, email: body.email },
  });
  return NextResponse.json(supplier);
}

export async function DELETE(_req, { params }) {
  await prisma.supplier.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
