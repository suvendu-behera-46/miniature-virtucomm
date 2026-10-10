import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = hashSync("admin123", 10);

  await prisma.adminUser.upsert({
    where: { email: "admin@miniaturestudio.in" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@miniaturestudio.in",
      password,
      role: "SUPER_ADMIN",
      active: true,
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "business_name" },
    update: { value: "Miniature Studio" },
    create: {
      key: "business_name",
      value: "Miniature Studio",
      description: "Business display name",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
