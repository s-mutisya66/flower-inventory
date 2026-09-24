import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma.js";

export async function GET() {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(suppliers);
}

export async function POST(req) {
  const body = await req.json();
  const supplier = await prisma.supplier.create({
    data: { name: body.name, contact: body.contact, email: body.email },
  });
  return NextResponse.json(supplier, { status: 201 });
}
