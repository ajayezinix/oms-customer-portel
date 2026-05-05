# Ezinix Customer Portal

Customer-facing B2B portal for Ezinix OMS built with Next.js (App Router), Supabase SSR auth, Tailwind CSS, Lucide icons, and PWA support.

## Project Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Ensure Supabase Email OTP login is enabled and SMTP is configured.

## Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import project in [Vercel](https://vercel.com).
3. Add the same env vars in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.  
5. After deployment, test OTP login and protected routes.

## Run RLS SQL in Supabase SQL Editor

Use the SQL below (adapt if your existing policies differ):

```sql
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_select_own" ON customers
FOR SELECT USING (email_address = auth.email());

CREATE POLICY "orders_select_own" ON orders
FOR SELECT USING (
  customer_id = (SELECT customer_id FROM customers WHERE email_address = auth.email())
);

CREATE POLICY "returns_select_own" ON returns
FOR SELECT USING (
  customer_id = (SELECT customer_id FROM customers WHERE email_address = auth.email())
);

CREATE POLICY "returns_insert_own" ON returns
FOR INSERT WITH CHECK (
  customer_id = (SELECT customer_id FROM customers WHERE email_address = auth.email())
);
```

## How to Add Customers to the System

1. Create customer record in `customers` table with:
   - `customer_name`
   - `email_address` (must match login email)
   - `phone_number`, `company_address`, `contact_person`, etc.
2. Ensure customer has orders in `orders` with matching `customer_id`.
3. Customer can then log in via email OTP (if `shouldCreateUser: false`, only existing auth users can receive OTP).
4. If required, pre-create user in Supabase Auth with the same email.

## Notes

- Portal reads from the same Supabase DB as OMS backend.
- Customer-visible tables are always filtered by `customer_id`.
- `invoice_id` is treated as invoice URL field for download.
- PWA manifest is available at `/manifest.json`.
