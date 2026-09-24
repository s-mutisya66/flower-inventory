import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.sale.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();

  const kitengela = await prisma.supplier.create({
    data: { name: "Kitengela Blooms Ltd", contact: "0712 345 678", email: "sales@kitengelablooms.co.ke" },
  });
  const naivasha = await prisma.supplier.create({
    data: { name: "Naivasha Rose Farm", contact: "0701 222 333", email: "orders@naivasharoses.com" },
  });
  const greenvalley = await prisma.supplier.create({
    data: { name: "Green Valley Growers", contact: "0733 998 112", email: "info@greenvalley.co.ke" },
  });

  const roses = await prisma.product.create({
    data: { name: "Red Roses", category: "Roses", price: 150, stock: 80, reorderLevel: 30, unit: "stem", supplierId: naivasha.id },
  });
  const lilies = await prisma.product.create({
    data: { name: "White Lilies", category: "Lilies", price: 200, stock: 18, reorderLevel: 20, unit: "stem", supplierId: kitengela.id },
  });
  const sunflowers = await prisma.product.create({
    data: { name: "Sunflowers", category: "Sunflowers", price: 120, stock: 45, reorderLevel: 15, unit: "stem", supplierId: greenvalley.id },
  });
  const babysBreath = await prisma.product.create({
    data: { name: "Baby's Breath", category: "Filler", price: 60, stock: 10, reorderLevel: 25, unit: "bunch", supplierId: greenvalley.id },
  });
  const tulips = await prisma.product.create({
    data: { name: "Tulips (Mixed)", category: "Tulips", price: 180, stock: 36, reorderLevel: 20, unit: "stem", supplierId: kitengela.id },
  });
  const eucalyptus = await prisma.product.create({
    data: { name: "Eucalyptus Leaves", category: "Filler", price: 80, stock: 22, reorderLevel: 10, unit: "bunch", supplierId: naivasha.id },
  });

  await prisma.order.create({
    data: {
      supplierId: kitengela.id,
      date: new Date("2026-09-18"),
      status: "pending",
      total: 40 * lilies.price,
      items: { create: [{ productId: lilies.id, qty: 40 }] },
    },
  });
  await prisma.order.create({
    data: {
      supplierId: naivasha.id,
      date: new Date("2026-09-15"),
      status: "received",
      total: 60 * roses.price,
      items: { create: [{ productId: roses.id, qty: 60 }] },
    },
  });

  const sales = [
    { productId: roses.id, date: "2026-09-20", qty: 12, unitPrice: roses.price },
    { productId: sunflowers.id, date: "2026-09-21", qty: 8, unitPrice: sunflowers.price },
    { productId: tulips.id, date: "2026-09-22", qty: 5, unitPrice: tulips.price },
    { productId: babysBreath.id, date: "2026-09-23", qty: 6, unitPrice: babysBreath.price },
  ];
  for (const s of sales) {
    await prisma.sale.create({
      data: { ...s, date: new Date(s.date), total: s.qty * s.unitPrice },
    });
  }

  console.log("Seeded dummy flower shop data.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
