# gearON

Production-ready portfolio e-commerce app for gaming accessories and PC components.

## Stack

- Next.js App Router + TypeScript
- PostgreSQL + Prisma ORM
- NextAuth (Credentials + optional Google)
- Stripe test mode with automatic fallback to clearly labeled Mock Checkout
- Tailwind CSS + shadcn-style UI components
- Zod validation
- Server Actions
- Vitest + Playwright
- ESLint + Prettier

## Key Features

- Responsive storefront (mobile/tablet/desktop)
- Sticky header and cart drawer
- Desktop sidebar filters + mobile filter drawer
- Product detail with gray placeholder gallery + sticky mobile add-to-cart bar
- Guest cart (localStorage) + logged-in cart (DB) + sync on sign-in
- Checkout flow with `PENDING -> PAID`
- Profile orders page
- Admin panel (products/categories/brands/orders)
- Role-based protection on `/admin/*`
- Skeleton loading states, toast notifications, theme toggle (persistent)

## Image Policy

No real uploads are implemented.
All product visuals are rendered as solid gray placeholders.
Database includes `ProductImage` URLs so real images can be enabled later without schema refactor.

## Local Setup (Windows)

1. Copy env file:

```powershell
Copy-Item .env.example .env
```

2. Start PostgreSQL (example Docker command):

```powershell
docker run -d --name gearon-postgres -e POSTGRES_DB=gearon -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5434:5432 postgres:16
```

3. Set `DATABASE_URL` in `.env` to your instance (example):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/gearon"
```

4. Prepare DB:

```powershell
.\scripts\db.ps1 -Task push
.\scripts\db.ps1 -Task seed
```

5. Run app:

```powershell
.\scripts\dev.ps1
```

## Demo Users (Seed)

- Admin: `admin@gearon.dev` / `Admin123!`
- User: `user@gearon.dev` / `User123!`

## Testing

```powershell
.\scripts\test.ps1
```

Unit only:

```powershell
.\scripts\test.ps1 -UnitOnly
```

## Scripts

- `scripts/dev.ps1` -> run dev server
- `scripts/db.ps1` -> `generate | push | migrate | seed | reset`
- `scripts/test.ps1` -> lint + typecheck + unit + e2e

## CI

GitHub Actions workflow: `.github/workflows/ci.yml`

Runs:

- Prisma generate/push/seed
- ESLint
- TypeScript typecheck
- Vitest
- Playwright (Chromium)

## Environment Variables

Required:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

Optional:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

If Stripe keys are absent, checkout uses Mock Checkout mode.

## File Tree

```text
.
+-- .github/workflows/ci.yml
+-- app/
�   +-- actions/
�   +-- admin/
�   +-- api/
�   �   +-- auth/[...nextauth]/route.ts
�   �   L-- cart/route.ts
�   +-- auth/sign-in/page.tsx
�   +-- catalog/
�   +-- checkout/
�   +-- products/[slug]/
�   +-- profile/page.tsx
�   +-- globals.css
�   +-- layout.tsx
�   +-- not-found.tsx
�   L-- page.tsx
+-- components/
�   +-- admin/
�   +-- cart/
�   +-- catalog/
�   +-- ui/
�   +-- auth-sign-in-form.tsx
�   +-- checkout-form.tsx
�   +-- footer.tsx
�   +-- header.tsx
�   +-- image-placeholder.tsx
�   +-- logo.tsx
�   +-- product-add-to-cart-panel.tsx
�   +-- product-card.tsx
�   +-- providers.tsx
�   +-- theme-provider.tsx
�   L-- theme-toggle.tsx
+-- e2e/
�   +-- add-to-cart.spec.ts
�   +-- admin-protected.spec.ts
�   +-- mock-checkout.spec.ts
�   L-- search-filter.spec.ts
+-- lib/
+-- prisma/
�   +-- schema.prisma
�   L-- seed.ts
+-- scripts/
�   +-- db.ps1
�   +-- dev.ps1
�   L-- test.ps1
+-- tests/
+-- types/next-auth.d.ts
+-- proxy.ts
+-- playwright.config.ts
+-- vitest.config.ts
L-- .env.example
```
