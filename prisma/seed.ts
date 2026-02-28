import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Keyboards",
    description: "Mechanical and low profile gaming keyboards.",
  },
  { name: "Mice", description: "Wired and wireless precision mice." },
  { name: "Headsets", description: "Immersive competitive audio gear." },
  { name: "GPUs", description: "Graphics cards for modern gaming builds." },
  {
    name: "CPUs",
    description: "Processors for streaming and high FPS gaming.",
  },
  { name: "Monitors", description: "Fast refresh displays and ultrawides." },
] as const;

const brands = [
  "Logitech",
  "Razer",
  "Corsair",
  "ASUS",
  "MSI",
  "SteelSeries",
  "HyperX",
  "NVIDIA",
] as const;

const adjectives = [
  "Apex",
  "Nova",
  "Pulse",
  "Vector",
  "Nebula",
  "Titan",
  "Phantom",
  "Orbit",
] as const;
const modelCodes = [
  "X1",
  "G3",
  "Pro",
  "V2",
  "Max",
  "Ultra",
  "Core",
  "Elite",
] as const;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

async function main() {
  console.log("Seeding gearON database...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const userPassword = await bcrypt.hash("User123!", 12);

  await prisma.user.create({
    data: {
      name: "Admin Operator",
      email: "admin@gearon.dev",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      name: "Demo User",
      email: "user@gearon.dev",
      passwordHash: userPassword,
      role: Role.USER,
    },
  });

  const categoryMap = new Map<string, string>();
  for (const category of categories) {
    const created = await prisma.category.create({
      data: {
        name: category.name,
        slug: slugify(category.name),
        description: category.description,
      },
    });
    categoryMap.set(category.name, created.id);
  }

  const brandMap = new Map<string, string>();
  for (const brand of brands) {
    const created = await prisma.brand.create({
      data: {
        name: brand,
        slug: slugify(brand),
      },
    });
    brandMap.set(brand, created.id);
  }

  const productsToCreate: Array<{
    name: string;
    slug: string;
    description: string;
    priceCents: number;
    stock: number;
    popularity: number;
    featured: boolean;
    specs: Record<string, string>;
    categoryId: string;
    brandId: string;
    createdAt: Date;
  }> = [];

  let sequence = 0;
  for (const category of categories) {
    for (let i = 0; i < 8; i += 1) {
      const brand = brands[(sequence + i) % brands.length];
      const adjective = adjectives[(sequence + i) % adjectives.length];
      const model = modelCodes[(sequence + i * 2) % modelCodes.length];
      const name = `${brand} ${adjective} ${category.name.slice(0, -1)} ${model}`;

      const basePrice = 4900 + sequence * 700;
      const categoryBump =
        category.name === "GPUs"
          ? 35000
          : category.name === "CPUs"
            ? 21000
            : category.name === "Monitors"
              ? 18000
              : 0;
      const priceCents = basePrice + categoryBump;

      const specs: Record<string, string> = {
        category: category.name,
        connection: i % 2 === 0 ? "USB-C / 2.4GHz" : "Wired USB",
        warranty: "3 years",
        latency: `${(0.12 + i * 0.03).toFixed(2)}ms`,
      };

      productsToCreate.push({
        name,
        slug: slugify(`${name}-${sequence + 1}`),
        description: `${name} is designed for competitive play, stable thermals, and long-session comfort. Built for the gearON performance lineup.`,
        priceCents,
        stock: 5 + ((sequence * 3) % 37),
        popularity: 50 + (sequence % 40),
        featured: sequence % 6 === 0,
        specs,
        categoryId: categoryMap.get(category.name)!,
        brandId: brandMap.get(brand)!,
        createdAt: new Date(Date.now() - sequence * 86400000),
      });

      sequence += 1;
    }
  }

  for (const product of productsToCreate) {
    await prisma.product.create({
      data: {
        ...product,
        images: {
          create: [
            {
              url: `placeholder://gray/${product.slug}/1`,
              alt: `${product.name} placeholder view 1`,
              sortOrder: 0,
            },
            {
              url: `placeholder://gray/${product.slug}/2`,
              alt: `${product.name} placeholder view 2`,
              sortOrder: 1,
            },
            {
              url: `placeholder://gray/${product.slug}/3`,
              alt: `${product.name} placeholder view 3`,
              sortOrder: 2,
            },
          ],
        },
      },
    });
  }

  console.log(`Seed complete. Inserted ${productsToCreate.length} products.`);
  console.log("Admin login: admin@gearon.dev / Admin123!");
  console.log("User login: user@gearon.dev / User123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
