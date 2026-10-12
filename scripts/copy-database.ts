// Copies every row from one Postgres database to another, e.g. from the local
// embedded database into Neon. The target must already have the schema
// (run `npm run db:push` against it first) and must be empty.
//
//   SOURCE_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/miniature \
//   TARGET_DATABASE_URL=<Neon DIRECT connection string> \
//   npm run db:copy
import { PrismaClient } from "@prisma/client";

// Parents before children so foreign keys are satisfied.
const models = [
  "adminUser", "role", "permission", "customer", "category", "product", "productImage", "productVariant",
  "productOption", "productOptionValue", "order", "orderItem", "orderCustomization", "orderPhoto",
  "orderStatusHistory", "orderRevision", "orderNote", "mediaAsset", "gallery", "galleryImage", "review",
  "testimonial", "fAQ", "banner", "homepageSection", "page", "coupon", "contactInquiry", "analyticsEvent", "siteSetting",
] as const;

type Delegate = { findMany: () => Promise<object[]>; createMany: (args: { data: object[] }) => Promise<{ count: number }>; count: () => Promise<number> };

async function main() {
  const sourceUrl = process.env.SOURCE_DATABASE_URL;
  const targetUrl = process.env.TARGET_DATABASE_URL;
  if (!sourceUrl || !targetUrl) throw new Error("Set SOURCE_DATABASE_URL and TARGET_DATABASE_URL.");
  if (sourceUrl === targetUrl) throw new Error("Source and target are the same database.");

  const source = new PrismaClient({ datasources: { db: { url: sourceUrl } } });
  const target = new PrismaClient({ datasources: { db: { url: targetUrl } } });
  const delegate = (client: PrismaClient, model: string) => (client as unknown as Record<string, Delegate>)[model];

  try {
    for (const model of models) {
      if ((await delegate(target, model).count()) > 0) {
        throw new Error(`The target database already has ${model} rows. Copy only into an empty database.`);
      }
    }

    for (const model of models) {
      const rows = await delegate(source, model).findMany();
      if (rows.length) await delegate(target, model).createMany({ data: rows });
      console.log(`${model.padEnd(20)} ${rows.length}`);
    }

    // Implicit many-to-many join table between Role and Permission.
    const links = await source.$queryRawUnsafe<{ A: string; B: string }[]>('SELECT "A", "B" FROM "_PermissionToRole"');
    for (const link of links) {
      await target.$executeRawUnsafe('INSERT INTO "_PermissionToRole" ("A", "B") VALUES ($1, $2)', link.A, link.B);
    }
    console.log(`${"_PermissionToRole".padEnd(20)} ${links.length}`);
    console.log("Done.");
  } finally {
    await Promise.all([source.$disconnect(), target.$disconnect()]);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
