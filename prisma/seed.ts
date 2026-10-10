import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

const unsplash = (id: string, width = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

// Starting catalog: the products that were previously hard-coded in the storefront.
const categories = [
  { name: "Couples", slug: "couples" },
  { name: "Family", slug: "family" },
  { name: "Pets", slug: "pets" },
  { name: "Weddings", slug: "weddings" },
  { name: "Friends & groups", slug: "friends-groups" },
  { name: "Vehicles", slug: "vehicles" },
  { name: "Corporate", slug: "corporate" },
  { name: "Premium", slug: "premium" },
];

const products = [
  {
    name: "Custom Couple Miniature",
    slug: "custom-couple-miniature",
    category: "couples",
    price: 5999,
    comparePrice: 7999,
    flags: { popular: true, featured: true },
    heading: "An anniversary keepsake handcrafted from your memories.",
    description:
      "A personalized couple miniature made from your reference photos, with custom outfit detailing, pose matching, and premium finishing to preserve your story beautifully.",
    features: ["2 to 5 persons available", "Premium hand-painted finish", "Feasibility review before production", "Free nationwide delivery"],
    images: ["photo-1529156069898-49953e39b3ac", "photo-1516589178581-6cd7833ae3b2", "photo-1529333166437-7750a6dd5a70", "photo-1511988617509-a57c8a288659"],
  },
  {
    name: "Family Heritage Miniature",
    slug: "family-heritage-miniature",
    category: "family",
    price: 6999,
    comparePrice: 8499,
    flags: { popular: true, featured: true },
    heading: "A family portrait you can hold forever.",
    description:
      "Celebrate your parents, grandparents, or the whole family with a detailed miniature sculpture inspired by real family portraits and cherished memories.",
    features: ["Family of 4+ members", "Custom outfit and pose styling", "Gift-ready packaging", "Made in India"],
    images: ["photo-1517849845537-4d257902454a", "photo-1511895426328-dc8714191300", "photo-1511632765486-a01980e01a18", "photo-1476231682828-37e571bc172f"],
  },
  {
    name: "Pet Portrait Keepsake",
    slug: "pet-portrait-keepsake",
    category: "pets",
    price: 4799,
    comparePrice: 5999,
    flags: { newProduct: true, featured: true },
    heading: "Your best friend deserves a forever keepsake.",
    description:
      "From fluffy companions to playful puppies, we sculpt and finish each pet miniature to reflect their character, expression, and favorite pose.",
    features: ["Pet-specific portrait styling", "Full-body or half-body options", "Hand-painted detailing", "Reference feasibility review"],
    images: ["photo-1543466835-00a7907e9de1", "photo-1537151625747-768eb6cf92b2", "photo-1552053831-71594a27632d", "photo-1583337130417-3346a1be7dee"],
  },
  {
    name: "Wedding Keepsake",
    slug: "wedding-keepsake",
    category: "weddings",
    price: 7499,
    comparePrice: 8999,
    flags: { featured: false },
    heading: "A meaningful wedding memory to keep forever.",
    description:
      "Capture the joy of your ceremony in a sculpted wedding piece that tells your story through pose, clothing, flowers, and decorative details.",
    features: ["Wedding themed custom design", "Miniature for the couple", "Premium display base", "Carefully packed for gifting"],
    images: ["photo-1529156069898-49953e39b3ac", "photo-1537633552985-df8429e8048b", "photo-1519741497674-611481863552", "photo-1511285560929-80b456fea0bc"],
  },
  {
    name: "Friends Group Miniature",
    slug: "friends-group-miniature",
    category: "friends-groups",
    price: 7999,
    comparePrice: 9499,
    flags: { featured: true },
    heading: "Celebrate the bond that never fades.",
    description:
      "A friendship keepsake for your closest circle, personalized with your photos and styled to reflect each person and the mood of your group.",
    features: ["Group portrait customization", "Couples or friend groups", "Color and accessory matching", "Celebration-ready finish"],
    images: ["photo-1517849845537-4d257902454a", "photo-1511988617509-a57c8a288659", "photo-1529333166437-7750a6dd5a70", "photo-1529156069898-49953e39b3ac"],
  },
  {
    name: "Solo Bike Miniature",
    slug: "solo-bike-miniature",
    category: "vehicles",
    price: 5999,
    comparePrice: 6999,
    flags: {},
    heading: "A bike tribute made with precision and personality.",
    description:
      "Perfect for riders, enthusiasts, and milestone possessions, this miniature captures your bike design, stance, and color in a display-ready collectible.",
    features: ["Bike custom detailing", "Display-friendly finish", "Premium paint and texture", "Personalized base design"],
    images: ["photo-1558980664-10e7170b5df9", "photo-1558981806-ec527fa84c39", "photo-1558981403-c5f9899a28bc"],
  },
  {
    name: "Corporate Team Miniature",
    slug: "corporate-team-miniature",
    category: "corporate",
    price: 9499,
    comparePrice: 10999,
    flags: {},
    heading: "A professional keepsake for your team and milestones.",
    description:
      "Great for corporate gifting, employee recognition, and brand memories, built with a clean presentation and custom finishing for business occasions.",
    features: ["Corporate gifting", "Team or leadership pieces", "Professional finish", "Great for awards and events"],
    images: ["photo-1552664730-d307ca884978", "photo-1521737711867-e3b97375f902", "photo-1556761175-b413da4baf72", "photo-1522071820081-009f0129c71c"],
  },
  {
    name: "Premium Bronze Sculpture",
    slug: "premium-bronze-sculpture",
    category: "premium",
    price: 12999,
    comparePrice: 14999,
    flags: {},
    heading: "A luxury heirloom for your most meaningful memories.",
    description:
      "A premium-grade sculpture ideal for legacy gifting, milestone moments, and display-focused keepsakes with a more refined metal-inspired finish.",
    features: ["Luxury finish", "Collector-grade detailing", "Elegant display base", "Ideal for premium gifting"],
    images: ["photo-1517849845537-4d257902454a", "photo-1579783902614-a3fb3927b6a5", "photo-1577083552431-6e5fd01aa342", "photo-1578301978693-85fa9c0320b9"],
  },
];

const testimonials = [
  { name: "Aisha & Arjun", testimonial: "The detail was stunning. Our custom couple miniature matched our wedding photo perfectly and now it sits on our shelf as a treasured memory." },
  { name: "Naina Sharma", testimonial: "We ordered a family miniature for my parents, and the finish quality was excellent. It felt personal, premium, and beautifully crafted." },
  { name: "Vikram Reddy", testimonial: "The communication, preview process, and final finish were all excellent. This felt like a premium keepsake, not a mass-market product." },
];

const faqs = [
  { question: "Can I share a 2D or 3D reference image?", answer: "Yes. Share a clear 2D photo or 3D image, and our team will review whether it can be made as a miniature." },
  { question: "When does production begin?", answer: "We first review your reference to confirm that we can create it. Production begins after your design is confirmed as feasible." },
  { question: "How long does custom production take?", answer: "Most custom pieces take 12 to 18 working days to produce after the reference is approved, depending on design complexity and finishing requirements." },
  { question: "Do you make miniatures for families and pets too?", answer: "Absolutely. We create custom family portraits, weddings, pets, couples, friends, corporate gifts, and special milestones." },
  { question: "Do you deliver across India?", answer: "Yes. We deliver nationwide with safe packaging." },
  { question: "Can I gift a miniature directly?", answer: "Yes. We can include a message card, a gift-ready box, and special packaging for personal gifting." },
];

const galleryImages = [
  { title: "Custom Couple Miniature", image: "photo-1529156069898-49953e39b3ac", featured: true },
  { title: "Wedding Keepsake", image: "photo-1517849845537-4d257902454a", featured: true },
  { title: "Pet Portrait", image: "photo-1543466835-00a7907e9de1", featured: true },
  { title: "Family Memory", image: "photo-1517849845537-4d257902454a", featured: true },
  { title: "Couple Anniversary", image: "photo-1529156069898-49953e39b3ac", featured: false },
  { title: "Premium Display Piece", image: "photo-1517849845537-4d257902454a", featured: false },
];

async function main() {
  await prisma.adminUser.upsert({
    where: { email: "admin@miniaturestudio.in" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@miniaturestudio.in",
      password: hashSync("admin123", 10),
      role: "SUPER_ADMIN",
      active: true,
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "business_name" },
    update: {},
    create: { key: "business_name", value: "Miniature Studio", description: "Business name" },
  });

  // Content is only seeded into empty tables so admin edits are never overwritten.
  if ((await prisma.product.count()) === 0) {
    for (const [index, category] of categories.entries()) {
      await prisma.category.upsert({ where: { slug: category.slug }, update: {}, create: { ...category, displayOrder: index } });
    }
    for (const product of products) {
      const category = await prisma.category.findUnique({ where: { slug: product.category } });
      await prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          categoryId: category?.id,
          basePrice: product.price,
          comparePrice: product.comparePrice,
          shortDescription: product.heading,
          fullDescription: product.description,
          features: product.features.join("\n"),
          productionTime: "12 to 18 working days",
          featured: false,
          ...product.flags,
          images: { create: product.images.map((id, index) => ({ url: unsplash(id), isPrimary: index === 0, sortOrder: index })) },
        },
      });
    }
    console.log(`Seeded ${products.length} products in ${categories.length} categories.`);
  }

  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({ data: testimonials.map((item) => ({ ...item, rating: 5, featured: true })) });
  }

  if ((await prisma.fAQ.count()) === 0) {
    await prisma.fAQ.createMany({ data: faqs.map((item, index) => ({ ...item, displayOrder: index })) });
  }

  if ((await prisma.galleryImage.count()) === 0) {
    const gallery = await prisma.gallery.upsert({ where: { slug: "main" }, update: {}, create: { slug: "main", title: "Studio gallery" } });
    await prisma.galleryImage.createMany({
      data: galleryImages.map((item, index) => ({ galleryId: gallery.id, title: item.title, imageUrl: unsplash(item.image, 900), featured: item.featured, sortOrder: index })),
    });
  }
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
