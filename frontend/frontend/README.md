# CultureFitsKe — Full-Stack Next.js App

One project: the storefront (React/Next.js pages) and the backend (Next.js
API routes + MongoDB) live together. Deploying to Vercel deploys both — the
API routes run automatically as serverless functions, no separate backend
host needed.

## 1. Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev                   # http://localhost:3000
```

## 2. Where to get each credential

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | Free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register). Create a cluster → Database Access (create a user) → Network Access (allow `0.0.0.0/0` for Vercel) → Connect → copy the connection string. |
| `JWT_SECRET` | Any long random string — e.g. run `openssl rand -hex 32`. |
| `CLOUDINARY_*` | Free account at [cloudinary.com](https://cloudinary.com) — dashboard shows all three values. |
| `WHATSAPP_*` | Create a Meta developer app, add the WhatsApp product, verify a business phone number: [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp) |
| `AT_*` | Free account at [africastalking.com](https://africastalking.com) — SMS fallback if WhatsApp sending fails. |

## 3. Deploying (since you've already deployed the frontend to Vercel)

1. Push this updated code (with the new `app/api`, `lib`, and `models` folders) to the same GitHub repo you already connected to Vercel.
2. In your Vercel project settings → Environment Variables, add everything from `.env.example` with your real values.
3. Redeploy (Vercel does this automatically on a new push, or trigger manually from the dashboard).
4. That's it — your API routes are now live at `https://yoursite.vercel.app/api/...`, no second hosting service required.

## 4. Payments — M-Pesa Paybill (no gateway)

There's no payment API integration. Your Paybill number is stored as a
setting (`GET/PATCH /api/settings`, editable from the admin Settings tab) and
shown to customers at checkout. When you set a delivery fee
(`PATCH /api/orders/:id/delivery-fee`), the app automatically sends a
WhatsApp message (SMS fallback) with the final total, your Paybill number,
and the order number as the account reference. The customer pays you
directly from their own M-Pesa app — you confirm payment landed and mark the
order accordingly.

## 5. Customization fee

Stored as a setting too (`customization_fee`, defaults to KSh 300) and
editable any time from the admin Settings tab. Every new order looks it up
fresh, so a price change applies immediately.

## 6. API overview

All endpoints are prefixed with `/api`. Requests that need auth expect:
`Authorization: Bearer <token>`

| Method & Path | Auth | Purpose |
|---|---|---|
| `POST /auth/register` | — | Create a customer account |
| `POST /auth/login` | — | Log in, returns a JWT |
| `GET /products` | — | Browse catalog (filter with `?team=&kit=&version=`) |
| `GET /products/:id` | — | Single product with photos, stock, rating |
| `POST /products` | admin | Add a new kit (multipart form: photos, min 3) |
| `PATCH /products/:id/stock` | admin | Set stock for one size/sleeve variant |
| `DELETE /products/:id` | admin | Remove a kit (soft delete) |
| `POST /orders` | customer | Place an order request (unpaid) |
| `POST /orders/upload-design` | customer | Upload a custom name/number design image |
| `GET /orders/mine` | customer | My order history |
| `GET /orders` | admin | All orders |
| `PATCH /orders/:id/delivery-fee` | admin | Set delivery fee → sends WhatsApp confirmation |
| `PATCH /orders/:id/status` | admin | Update order status |
| `GET /reviews/product/:id` | — | Reviews for a product |
| `POST /reviews` | customer | Leave a review |
| `DELETE /reviews/:id` | admin | Remove a review |
| `GET /wishlist` | customer | My saved products |
| `POST /wishlist/:productId` | customer | Save a product |
| `DELETE /wishlist/:productId` | customer | Un-save a product |
| `GET /dashboard/summary` | admin | Pending orders, revenue, low stock, top products |
| `GET /dashboard/sales?range=` | admin | Revenue over time (daily/weekly/monthly) |
| `GET /settings` | — | Current customization fee + Paybill details |
| `PATCH /settings` | admin | Update customization fee and/or Paybill details |

## 7. Creating your admin account

There's no public sign-up for admin — registering on the storefront always
creates a regular customer account. Only you can create the admin account,
by running a script directly against your database:

```bash
npm run create-admin -- "Your Name" "0712345678" "a-strong-password"
```

This requires `MONGODB_URI` to be set in `.env.local` (same file you already
created for local dev). It creates the account if it doesn't exist yet, or
promotes an existing account with that phone number to admin if it does.

Once created, log in on the storefront with that phone number and password —
the "Admin" button only appears in the header for that account, and the
`/admin` view is blocked server-side for everyone else (checked via
`/api/auth/me` and every admin-only API route, not just hidden in the UI).

If you ever need to run this against your **live** database (not local), set
`MONGODB_URI` to your Atlas connection string in your terminal for that one
command, e.g.:

```bash
MONGODB_URI="your-atlas-connection-string" node scripts/createAdmin.js "Your Name" "0712345678" "a-strong-password"
```

## 8. What's real vs. what's left

**Fully wired to the database:**
- Login, registration, and admin access — genuinely gated by your account's role
- Product catalog — browsing, admin "Add New Kit" (with real photo upload to Cloudinary), per-variant stock editing, removing a kit
- Wishlist — saved products persist per account
- Orders — checkout creates a real order (requires login, no guest checkout); admin's Orders tab shows real orders, and setting a delivery fee genuinely triggers the WhatsApp send server-side
- Settings — customization fee and Paybill number/instructions save to the database and apply to new orders immediately
- Custom design uploads — the customer's uploaded badge/graphic is uploaded to Cloudinary at order time, not just kept as a local preview

**Cart is intentionally still local-only.** There's no "cart" table in the
database — items live in browser memory until checkout, same as most
storefronts. That's expected, not a gap.

**Not yet built:**
- No UI for customers to leave reviews (the review API routes exist, but there's no submission form on the product page yet)
- No customer-facing "my orders" history page (the `/api/orders/mine` route exists and is ready to use)
- No M-Pesa payment confirmation automation — that stays manual, by design (see section 4)

Ask to have either of the two "not yet built" items added whenever you want them.
