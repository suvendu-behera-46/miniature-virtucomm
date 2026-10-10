# Miniature Studio

A Next.js storefront and admin portal for a custom 3D miniature business. The app is structured around a PostgreSQL + Prisma data model, protected admin routes, animated customer experience, and a CMS-like admin dashboard.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- PostgreSQL + Prisma
- NextAuth credentials authentication

## Core structure

- Customer storefront: `/`
- Product catalog: `/products`
- Product detail: `/product/[slug]`
- Admin dashboard: `/admin`
- Admin login: `/admin/login`
- Customer reference upload: `/#reference-upload`
- Admin image submissions: `/admin/reference-uploads`
- Protected admin APIs: `/api/admin/*`

## Local setup

1. Start PostgreSQL and update `.env` with your database URL.
2. Run Prisma schema sync:

```bash
npx prisma db push
```

3. Seed a default admin user:

```bash
npm run seed
```

4. Start the app:

```bash
npm run dev
```

Open http://localhost:3000

Default admin login:

- Email: admin@miniaturestudio.in
- Password: admin123

## Notes

- The admin panel and customer website are intentionally separated.
- Business content is represented by database models and APIs, with the app architecture ready for full production CMS workflows.
- The storefront includes motion effects using Framer Motion.
- Customer reference images (JPG, PNG, or WebP; up to five images, 12 MB each and 40 MB combined) and their contact details are stored privately under `private/reference-uploads`, outside the public web directory. Admins can review submissions and download images from `/admin/reference-uploads`; no email notification is sent.
- Production deployments must mount persistent, writable storage at `private/reference-uploads` so submissions survive app rebuilds and restarts.
