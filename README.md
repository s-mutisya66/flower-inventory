# Bloom Inventory

A flower shop inventory management system: products, suppliers, multi-item
purchase orders, and sales, each backed by a Postgres database via Prisma.
Built with Next.js (App Router).

## Features
- **Products** — stock levels, reorder thresholds, supplier links, low-stock flags
- **Suppliers** — contact info
- **Purchase orders** — multiple products per order; "Receive" restocks products
- **Sales** — recording a sale deducts stock automatically
- **Dashboard** — inventory value, revenue, low-stock alerts
- CSV export on every list
- Full edit/delete on every record

## 1. Get a Postgres database
Any Postgres works. The easiest free options that pair well with Vercel:
- **Neon** (neon.tech) — free tier, works from anywhere, not tied to Vercel
- **Vercel Postgres** — set up directly from your Vercel project's Storage tab

Copy the connection string you're given.

## 2. Local setup
```bash
cp .env.example .env      # paste your DATABASE_URL in
npm install
npm run migrate           # creates tables
npm run seed               # loads dummy flower shop data
npm run dev                 # http://localhost:3000
```

## 3. Deploy to Vercel
1. Push this project to a GitHub repo.
2. In Vercel: New Project → import the repo.
3. Add the `DATABASE_URL` environment variable (same value as your `.env`).
4. Deploy. Vercel runs `npm run build`, which generates the Prisma client.
5. Run migrations against the production database once, either:
   - locally: `DATABASE_URL="<prod-url>" npx prisma migrate deploy`
   - or add it as a one-off Vercel build step.
6. (Optional) seed production data the same way with `npm run seed`.

## Project structure
```
app/                 Next.js pages (Dashboard, Products, Suppliers, Orders, Sales)
app/api/             REST route handlers (Prisma CRUD)
prisma/schema.prisma Database schema
prisma/seed.js       Dummy data
lib/prisma.js        Prisma client singleton
lib/csv.js           Client-side CSV export helper
```

## Notes
- Orders store a status of `pending` or `received`. Receiving an order
  increments stock for each item and does not currently support partial
  receipt.
- Editing a past sale does not reverse or reapply its stock effect —
  it only updates the sale record itself.
