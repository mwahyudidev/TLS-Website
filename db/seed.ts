import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "node:path";
import { sql } from "drizzle-orm";
import { hashPassword } from "../server/lib/password";
import * as schema from "./schema";

const dbPath = process.env.DATABASE_URL ?? "./db/data/store.db";
const absPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.resolve(process.cwd(), dbPath);
const sqlite = new Database(absPath);
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log("Seeding database at", absPath);

  const existing = await db.select().from(schema.roles).all();
  if (existing.length > 0) {
    console.log("Already seeded — skipping. Run `npm run db:reset` to reseed.");
    sqlite.close();
    return;
  }

  // 1. Roles
  const roleRows = await db
    .insert(schema.roles)
    .values([
      { name: "super_admin" },
      { name: "admin" },
      { name: "staff" },
      { name: "customer" },
    ])
    .returning();
  const roleByName = Object.fromEntries(roleRows.map((r) => [r.name, r.id]));
  console.log("✓ Roles");

  // 2. Admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@thelineseafood.sg";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe!2026";
  const adminHash = await hashPassword(adminPassword);
  await db.insert(schema.users).values({
    email: adminEmail,
    passwordHash: adminHash,
    name: "Store Admin",
    roleId: roleByName.super_admin!,
    status: "active",
  });
  console.log(`✓ Admin user: ${adminEmail} / ${adminPassword}`);

  // 3. Sample customer
  const customerHash = await hashPassword("Password!23");
  const [customerUser] = await db
    .insert(schema.users)
    .values({
      email: "jane@example.com",
      passwordHash: customerHash,
      name: "Jane Tan",
      phone: "+65 9123 4567",
      roleId: roleByName.customer!,
    })
    .returning();
  await db.insert(schema.customers).values({
    userId: customerUser!.id,
    name: customerUser!.name,
    email: customerUser!.email,
    phone: "+65 9123 4567",
  });
  console.log("✓ Sample customer: jane@example.com / Password!23");

  // 4. Seafood categories
  // navGroup controls which mega-menu column each category appears in.
  // Admins can change navGroup via the Categories admin panel.
  // Column order: "live" → "fresh-frozen" → "special"
  const categoryData = [
    // ── Live Seafood column ──
    { name: "Live Fish",    slug: "live-fish",    navGroup: "live",         sortOrder: 1,  description: "Live fish from the tank — grouper, seabass, and more", imageUrl: "https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=800&auto=format&fit=crop" },
    { name: "Live Crab",    slug: "live-crab",    navGroup: "live",         sortOrder: 2,  description: "Live crabs delivered in aerated packaging", imageUrl: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop" },
    { name: "Live Lobster", slug: "live-lobster", navGroup: "live",         sortOrder: 3,  description: "Premium live lobsters for special occasions", imageUrl: "https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=800&auto=format&fit=crop" },
    { name: "Live Prawn",   slug: "live-prawn",   navGroup: "live",         sortOrder: 4,  description: "Jumbo live tiger prawns, sweet and crunchy", imageUrl: "https://images.unsplash.com/photo-1565680018160-b55b48975c30?w=800&auto=format&fit=crop" },
    { name: "Shellfish",    slug: "shellfish",    navGroup: "live",         sortOrder: 5,  description: "Mussels, clams, oysters and more", imageUrl: "https://images.unsplash.com/photo-1552644839-6e92c02e2e75?w=800&auto=format&fit=crop" },
    // ── Fresh & Frozen column ──
    { name: "Fresh Catch",     slug: "fresh-catch",     navGroup: "fresh-frozen", sortOrder: 10, description: "Same-day fresh catch, chilled and cleaned", imageUrl: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&auto=format&fit=crop" },
    { name: "Frozen Seafood",  slug: "frozen-seafood",  navGroup: "fresh-frozen", sortOrder: 11, description: "IQF frozen at peak freshness — stock up without compromise", imageUrl: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=800&auto=format&fit=crop" },
    { name: "Salmon",          slug: "salmon",          navGroup: "fresh-frozen", sortOrder: 12, description: "Sashimi-grade Norwegian salmon, air-flown fresh", imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop" },
    { name: "Sea Bass",        slug: "sea-bass",        navGroup: "fresh-frozen", sortOrder: 13, description: "Premium sea bass fillets, mild and versatile", imageUrl: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&auto=format&fit=crop" },
    { name: "Red Snapper",     slug: "red-snapper",     navGroup: "fresh-frozen", sortOrder: 14, description: "Whole or fillet red snapper, excellent steamed or fried", imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop" },
    // ── Special Packs column ──
    { name: "Child-Friendly Pack", slug: "child-pack",      navGroup: "special", sortOrder: 20, description: "Boneless, bite-sized portions perfect for kids", imageUrl: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&auto=format&fit=crop" },
    { name: "Family Bundles",      slug: "family-bundles",  navGroup: "special", sortOrder: 21, description: "Curated family packs for steamboat and big gatherings", imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop" },
    { name: "Gift Sets",           slug: "gift-sets",       navGroup: "special", sortOrder: 22, description: "Beautifully packaged seafood gift sets for any occasion", imageUrl: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=800&auto=format&fit=crop" },
    { name: "BBQ Pack",            slug: "bbq-pack",        navGroup: "special", sortOrder: 23, description: "Everything you need for a Singapore-style seafood BBQ", imageUrl: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop" },
  ];
  const catRows = await db.insert(schema.categories).values(categoryData).returning();
  const catBySlug = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));
  console.log("✓ Categories");

  // 5. Seafood products
  type SeedProduct = {
    name: string;
    slug: string;
    description: string;
    priceCents: number;
    compareAtPriceCents?: number;
    stock: number;
    sku: string;
    weightGrams: number;
    featured?: boolean;
    isCatchOfWeek?: boolean;
    categorySlug: string;
    image: string;
    seafoodType?: string;
    storageType?: "live" | "chilled" | "frozen";
    packSize?: string;
    unitType?: string;
    origin?: string;
    freshnessNote?: string;
    storageInstruction?: string;
    preparationNote?: string;
    deliveryNote?: string;
    minOrderQuantity?: number;
  };

  const productData: SeedProduct[] = [
    // Live category
    {
      name: "Sri Lankan Mud Crab (Live)",
      slug: "sri-lankan-mud-crab-live",
      description: "Premium Sri Lankan mud crabs, delivered live. Sweet, tender meat with chunky claws. Perfect for chilli crab or black pepper crab.",
      priceCents: 6800,
      stock: 20,
      sku: "LVE-CRAB-001",
      weightGrams: 700,
      featured: true,
      isCatchOfWeek: true,
      categorySlug: "live-crab",
      image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop",
      seafoodType: "Crab",
      storageType: "live",
      packSize: "700g–900g each",
      unitType: "per piece",
      origin: "Sri Lanka",
      freshnessNote: "Live on arrival, guaranteed. Swimming crabs packed in damp newspaper.",
      storageInstruction: "Cook on day of delivery for best results. Do not refrigerate live crabs.",
      preparationNote: "Clean and cook immediately. Steam or cook in your preferred sauce.",
      deliveryNote: "Live seafood delivered in insulated packaging. Morning slots recommended.",
    },
    {
      name: "Live Red Garoupa",
      slug: "live-red-garoupa",
      description: "Wild-caught live red grouper. Firm white flesh, mild and slightly sweet. Excellent steamed Teochew-style.",
      priceCents: 7200,
      stock: 15,
      sku: "LVE-GROU-002",
      weightGrams: 600,
      featured: true,
      categorySlug: "live-fish",
      image: "https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=800&auto=format&fit=crop",
      seafoodType: "Fish",
      storageType: "live",
      packSize: "500g–700g each",
      unitType: "per piece",
      origin: "Local (Singapore waters)",
      freshnessNote: "Kept in aerated tanks, live upon delivery.",
      storageInstruction: "Cook on day of delivery.",
      preparationNote: "Gut and clean upon delivery. Best steamed with ginger and soy.",
      deliveryNote: "Delivered in oxygenated bags. Keep upright.",
    },
    {
      name: "Live Tiger Prawn",
      slug: "live-tiger-prawn",
      description: "Jumbo live tiger prawns, sweet and crunchy. Great for grilling, stir-frying, or simply steamed with garlic.",
      priceCents: 3200,
      stock: 30,
      sku: "LVE-PRWN-003",
      weightGrams: 500,
      categorySlug: "live-prawn",
      image: "https://images.unsplash.com/photo-1565680018160-b55b48975c30?w=800&auto=format&fit=crop",
      seafoodType: "Prawn",
      storageType: "live",
      packSize: "500g",
      unitType: "per 500g",
      origin: "Malaysia / Thailand",
      freshnessNote: "Live prawns, very active on arrival.",
      storageInstruction: "Cook on day of delivery.",
      preparationNote: "Rinse well. Devein before cooking.",
    },
    // Fresh category
    {
      name: "Fresh Norwegian Salmon Fillet",
      slug: "fresh-norwegian-salmon-fillet",
      description: "Sashimi-grade Norwegian Atlantic salmon fillet. Rich, buttery flavour with vibrant orange flesh. Perfect for sashimi, pan-searing or grilling.",
      priceCents: 2800,
      compareAtPriceCents: 3500,
      stock: 40,
      sku: "FRS-SALM-001",
      weightGrams: 300,
      featured: true,
      isCatchOfWeek: false,
      categorySlug: "salmon",
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop",
      seafoodType: "Fish",
      storageType: "chilled",
      packSize: "300g",
      unitType: "per 300g",
      origin: "Norway",
      freshnessNote: "Sashimi grade, air-flown within 48 hours of harvest.",
      storageInstruction: "Keep refrigerated at 0–4°C. Consume within 2 days.",
      preparationNote: "Can be eaten raw as sashimi. Excellent pan-seared with lemon butter.",
      deliveryNote: "Delivered on ice in insulated box.",
    },
    {
      name: "Fresh Threadfin (Ngoh Hiang Yu)",
      slug: "fresh-threadfin",
      description: "Local favourite for steaming or frying. Delicate white flesh, mildly sweet. Often used in Chinese soups and congee.",
      priceCents: 1800,
      stock: 25,
      sku: "FRS-THDF-002",
      weightGrams: 400,
      featured: true,
      categorySlug: "fresh-catch",
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&auto=format&fit=crop",
      seafoodType: "Fish",
      storageType: "chilled",
      packSize: "350g–450g each",
      unitType: "per piece",
      origin: "Local (Singapore / Malaysia)",
      freshnessNote: "Caught this morning. Gutted and cleaned.",
      storageInstruction: "Keep chilled. Cook within 24 hours.",
      preparationNote: "Steam with ginger and soy, or pan-fry with light seasoning.",
    },
    {
      name: "Fresh Sea Bass Fillet",
      slug: "fresh-sea-bass-fillet",
      description: "Premium sea bass fillet, skin-on. Mild, sweet flavour with moist, flaky texture. Versatile for steaming, baking, or pan-frying.",
      priceCents: 2200,
      stock: 20,
      sku: "FRS-SBAS-003",
      weightGrams: 250,
      categorySlug: "sea-bass",
      image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&auto=format&fit=crop",
      seafoodType: "Fish",
      storageType: "chilled",
      packSize: "250g",
      unitType: "per 250g",
      origin: "Greece / Local",
      freshnessNote: "Delivered fresh, never frozen.",
      storageInstruction: "Refrigerate immediately. Use within 2 days.",
    },
    {
      name: "Fresh Flower Crab",
      slug: "fresh-flower-crab",
      description: "Sweet, delicate flower crabs freshly caught. Great for crab bee hoon, porridge, or stir-fried with salted egg.",
      priceCents: 2400,
      stock: 30,
      sku: "FRS-FLCR-004",
      weightGrams: 400,
      categorySlug: "fresh-catch",
      image: "https://images.unsplash.com/photo-1566765880073-5b3b7e11e6e2?w=800&auto=format&fit=crop",
      seafoodType: "Crab",
      storageType: "chilled",
      packSize: "350g–450g each",
      unitType: "per piece",
      origin: "Malaysia / Indonesia",
      freshnessNote: "Fresh, cleaned and chilled.",
      storageInstruction: "Keep chilled. Cook within 24 hours.",
      preparationNote: "Halve before cooking. Excellent with bee hoon or in a light broth.",
    },
    // Frozen category
    {
      name: "IQF Tiger Prawn (21/25)",
      slug: "iqf-tiger-prawn-21-25",
      description: "Individually quick-frozen tiger prawns, 21–25 count per pound. Shell-on, deveined. Consistent size, sweet flavour.",
      priceCents: 1800,
      compareAtPriceCents: 2400,
      stock: 60,
      sku: "FRZ-PRWN-001",
      weightGrams: 1000,
      featured: true,
      categorySlug: "frozen-seafood",
      image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=800&auto=format&fit=crop",
      seafoodType: "Prawn",
      storageType: "frozen",
      packSize: "1kg",
      unitType: "per 1kg",
      origin: "Thailand / Vietnam",
      freshnessNote: "Frozen within 2 hours of harvest. No additives.",
      storageInstruction: "Keep frozen at -18°C. Once thawed, cook immediately.",
      preparationNote: "Thaw in chilled water for 15 mins. Pat dry before cooking.",
    },
    {
      name: "Frozen Squid Rings",
      slug: "frozen-squid-rings",
      description: "Cleaned and sliced calamari rings, IQF frozen. Tender texture, ideal for calamari fritti, stir-fries or BBQ.",
      priceCents: 1200,
      stock: 80,
      sku: "FRZ-SQRD-002",
      weightGrams: 500,
      categorySlug: "frozen-seafood",
      image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop",
      seafoodType: "Squid",
      storageType: "frozen",
      packSize: "500g",
      unitType: "per 500g",
      origin: "Peru / Vietnam",
      freshnessNote: "Cleaned and IQF frozen.",
      storageInstruction: "Keep frozen. Do not refreeze after thawing.",
      preparationNote: "Thaw and pat dry before frying or grilling.",
    },
    {
      name: "Frozen New Zealand Green Mussel",
      slug: "frozen-nz-green-mussel",
      description: "Half-shell NZ green mussels, IQF. Plump and juicy with a naturally briny flavour. Great for baking with garlic butter or steaming.",
      priceCents: 1400,
      stock: 50,
      sku: "FRZ-MUSL-003",
      weightGrams: 500,
      categorySlug: "shellfish",
      image: "https://images.unsplash.com/photo-1552644839-6e92c02e2e75?w=800&auto=format&fit=crop",
      seafoodType: "Shellfish",
      storageType: "frozen",
      packSize: "500g",
      unitType: "per 500g",
      origin: "New Zealand",
      freshnessNote: "Frozen at source within 12 hours of harvest.",
      storageInstruction: "Keep frozen. Thaw in fridge overnight.",
      preparationNote: "Steam directly from frozen or bake with garlic butter topping.",
    },
    // Child Pack category
    {
      name: "Fish Fingers (Boneless Kids Pack)",
      slug: "fish-fingers-boneless-kids",
      description: "100% real fish, boneless and easy for kids. Lightly battered, no added preservatives. Quick to bake or air-fry in 12 minutes.",
      priceCents: 1600,
      stock: 45,
      sku: "KID-FFNG-001",
      weightGrams: 400,
      featured: true,
      categorySlug: "child-pack",
      image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&auto=format&fit=crop",
      seafoodType: "Fish",
      storageType: "frozen",
      packSize: "400g (~12 pieces)",
      unitType: "per pack",
      origin: "Made in Singapore",
      freshnessNote: "No preservatives. Made fresh, frozen immediately.",
      storageInstruction: "Keep frozen. Once opened, use within 1 week.",
      preparationNote: "Air-fry at 180°C for 10–12 min. No oil needed.",
      deliveryNote: "Packaged in child-safe easy-tear packaging.",
      minOrderQuantity: 1,
    },
    {
      name: "Prawn Balls (Kids Pack)",
      slug: "prawn-balls-kids-pack",
      description: "Tender, juicy prawn balls — a kid favourite. No bones, no fuss. Perfect for steamboat, soups, or as a snack.",
      priceCents: 1400,
      stock: 35,
      sku: "KID-PWBL-002",
      weightGrams: 300,
      categorySlug: "child-pack",
      image: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800&auto=format&fit=crop",
      seafoodType: "Prawn",
      storageType: "frozen",
      packSize: "300g (~20 balls)",
      unitType: "per pack",
      origin: "Made in Singapore",
      freshnessNote: "Real prawn, no fillers. Handmade in small batches.",
      storageInstruction: "Keep frozen. Consume within 3 months.",
      preparationNote: "Drop into boiling soup or broth for 3–4 minutes.",
    },
    // Bundles category
    {
      name: "BBQ Seafood Bundle (4 pax)",
      slug: "bbq-seafood-bundle-4pax",
      description: "Everything you need for a Singapore-style seafood BBQ. Includes: 1kg tiger prawns, 2 flower crabs, 500g squid, 500g sambal sauce.",
      priceCents: 8800,
      compareAtPriceCents: 11200,
      stock: 20,
      sku: "BDL-BBQ-001",
      weightGrams: 3000,
      featured: true,
      isCatchOfWeek: true,
      categorySlug: "bbq-pack",
      image: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop",
      seafoodType: "Mixed",
      storageType: "chilled",
      packSize: "For 4 pax",
      unitType: "per bundle",
      origin: "Mixed origin",
      freshnessNote: "All components fresh. Assembled same morning.",
      storageInstruction: "Keep chilled. Cook within 24 hours of delivery.",
      deliveryNote: "Delivered in insulated box with ice packs.",
    },
    {
      name: "Family Steamboat Bundle (6 pax)",
      slug: "family-steamboat-bundle-6pax",
      description: "Premium steamboat set for 6. Includes: 1kg tiger prawns, 1 red garoupa (500g), 500g fish balls, 300g prawn balls, 500g NZ mussels.",
      priceCents: 11800,
      compareAtPriceCents: 14500,
      stock: 15,
      sku: "BDL-STB-002",
      weightGrams: 3800,
      featured: true,
      categorySlug: "family-bundles",
      image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop",
      seafoodType: "Mixed",
      storageType: "chilled",
      packSize: "For 6 pax",
      unitType: "per bundle",
      origin: "Mixed origin",
      freshnessNote: "Freshly assembled same day.",
      storageInstruction: "Keep chilled. Consume within 24 hours.",
      deliveryNote: "Packed in compartments to keep ingredients separate.",
    },
    {
      name: "Weekly Essentials Bundle",
      slug: "weekly-essentials-bundle",
      description: "Your weekly seafood supply sorted. Includes: 500g salmon fillet, 1kg frozen tiger prawns, 500g squid rings. Great value for couples.",
      priceCents: 5200,
      compareAtPriceCents: 6600,
      stock: 25,
      sku: "BDL-WKL-003",
      weightGrams: 2000,
      categorySlug: "family-bundles",
      image: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=800&auto=format&fit=crop",
      seafoodType: "Mixed",
      storageType: "frozen",
      packSize: "For 2 pax (weekly)",
      unitType: "per bundle",
      origin: "Mixed origin",
      freshnessNote: "Frozen components IQF. Salmon air-flown fresh.",
      storageInstruction: "Frozen items: keep at -18°C. Salmon: refrigerate, consume within 2 days.",
    },
  ];

  for (const p of productData) {
    const [row] = await db
      .insert(schema.products)
      .values({
        name: p.name,
        slug: p.slug,
        description: p.description,
        priceCents: p.priceCents,
        compareAtPriceCents: p.compareAtPriceCents,
        stock: p.stock,
        sku: p.sku,
        weightGrams: p.weightGrams,
        status: "active",
        featured: !!p.featured,
        isCatchOfWeek: !!p.isCatchOfWeek,
        seafoodType: p.seafoodType,
        storageType: p.storageType,
        packSize: p.packSize,
        unitType: p.unitType,
        origin: p.origin,
        freshnessNote: p.freshnessNote,
        storageInstruction: p.storageInstruction,
        preparationNote: p.preparationNote,
        deliveryNote: p.deliveryNote,
        minOrderQuantity: p.minOrderQuantity ?? 1,
      })
      .returning();

    await db.insert(schema.productImages).values({
      productId: row!.id,
      url: p.image,
      altText: p.name,
      sortOrder: 0,
    });

    await db.insert(schema.productCategories).values({
      productId: row!.id,
      categoryId: catBySlug[p.categorySlug]!,
    });
  }
  console.log(`✓ ${productData.length} seafood products`);

  // 6. Weekly promo
  const now = Math.floor(Date.now() / 1000);
  const weekEnd = now + 7 * 24 * 60 * 60;
  await db.insert(schema.weeklyPromos).values({
    title: "This Week's Catch",
    description: "Hand-picked specials from our fishermen partners. Limited stocks — order early!",
    badgeText: "This Week",
    validFrom: now,
    validUntil: weekEnd,
    status: "active",
    sortOrder: 0,
  });
  console.log("✓ Weekly promo");

  // 7. Subscription plans
  await db.insert(schema.subscriptionPlans).values([
    {
      name: "Fresh Weekly Box",
      slug: "fresh-weekly-box",
      description: "Curated fresh seafood delivered every week. We pick the freshest catch so you don't have to.",
      frequency: "weekly",
      priceCents: 4500,
      discountPercent: 10,
      features: JSON.stringify([
        "Fresh picks every Monday",
        "10% subscriber discount",
        "Free delivery",
        "Skip or pause anytime",
      ]),
      status: "active",
      sortOrder: 1,
    },
    {
      name: "Family Fortnightly Box",
      slug: "family-fortnightly-box",
      description: "A bigger, family-sized selection delivered fortnightly. Perfect for households of 4–6.",
      frequency: "biweekly",
      priceCents: 8500,
      discountPercent: 15,
      features: JSON.stringify([
        "Feeds 4–6 pax per box",
        "15% subscriber discount",
        "Free delivery",
        "Mix of fresh and frozen",
        "Skip or pause anytime",
      ]),
      status: "active",
      sortOrder: 2,
    },
    {
      name: "Monthly Freezer Fill",
      slug: "monthly-freezer-fill",
      description: "Stock your freezer with a month's worth of premium frozen seafood. Great value for meal preppers.",
      frequency: "monthly",
      priceCents: 12000,
      discountPercent: 20,
      features: JSON.stringify([
        "20% subscriber discount",
        "Free delivery",
        "Premium IQF frozen selection",
        "Vacuum-sealed for freshness",
        "Skip or pause anytime",
      ]),
      status: "active",
      sortOrder: 3,
    },
  ]);
  console.log("✓ Subscription plans");

  // 8. Content pages
  await db.insert(schema.contentPages).values([
    {
      slug: "our-story",
      title: "Our Story",
      body: JSON.stringify({
        intro: "The Line Seafood was born from a simple belief: everyone deserves access to the freshest, most sustainable seafood Singapore has to offer.",
        paragraphs: [
          "Founded in 2020 by a family of seafood lovers, The Line started as a humble weekend fish delivery service in Tampines. Word spread quickly — our commitment to quality and transparency with sourcing set us apart.",
          "Today, we partner with over 30 local fishermen and trusted regional suppliers across Singapore, Malaysia, Thailand, and beyond. Every product is handled with care from sea to doorstep.",
          "We believe in knowing where your seafood comes from. That's why every listing includes origin information, freshness notes, and honest storage advice.",
        ],
        mission: "Fresh seafood, delivered with heart.",
      }),
      metaDescription: "Learn about The Line Seafood — our journey from a weekend delivery to Singapore's most trusted online seafood store.",
      status: "published",
    },
    {
      slug: "faq",
      title: "Frequently Asked Questions",
      body: JSON.stringify({
        sections: [
          {
            heading: "Orders & Delivery",
            questions: [
              { q: "When do you deliver?", a: "We deliver Monday to Saturday. Order cutoff is 10pm the day before for morning slots, and 8am for afternoon slots." },
              { q: "Do you deliver islandwide?", a: "Yes, we deliver to all areas in Singapore including Sentosa. Jurong Island and restricted areas may have limited slots." },
              { q: "Is there a minimum order?", a: "Minimum order is S$30 for free delivery. Orders below S$30 incur a S$5 delivery fee." },
              { q: "Can I change my order after placing it?", a: "Contact us via WhatsApp within 2 hours of placing your order. After that, we may have already started preparing it." },
            ],
          },
          {
            heading: "Product Quality",
            questions: [
              { q: "How fresh is 'fresh' seafood?", a: "Our fresh seafood is delivered within 24–48 hours of catch. We work directly with suppliers to minimise handling time." },
              { q: "What does 'sashimi grade' mean?", a: "Our sashimi-grade fish has been handled and chilled to standards safe for raw consumption. Always trust your senses — if in doubt, cook it." },
              { q: "What is IQF?", a: "IQF stands for Individually Quick Frozen — each piece is frozen separately at peak freshness, preventing ice crystal damage." },
            ],
          },
        ],
      }),
      metaDescription: "Answers to your most common questions about ordering, delivery, and product quality at The Line Seafood.",
      status: "published",
    },
    {
      slug: "terms-and-conditions",
      title: "Terms & Conditions",
      body: JSON.stringify({
        lastUpdated: "1 January 2026",
        sections: [
          { heading: "1. General", content: "By placing an order with The Line Seafood, you agree to these terms and conditions. We reserve the right to update these terms at any time." },
          { heading: "2. Orders", content: "All orders are subject to availability. We will contact you if an item becomes unavailable after your order is placed. Substitutions of equal or higher value may be offered." },
          { heading: "3. Delivery", content: "Delivery times are estimates only. We endeavour to meet all slots but cannot guarantee exact times due to traffic and logistical constraints." },
          { heading: "4. Refunds", content: "We offer full refunds for quality issues reported within 2 hours of delivery, with photographic evidence. Please contact us via WhatsApp immediately." },
          { heading: "5. Live Seafood", content: "Live seafood is guaranteed alive upon delivery. Once accepted, responsibility transfers to the customer. We cannot refund live seafood that has been stored incorrectly." },
        ],
      }),
      metaDescription: "The Line Seafood terms and conditions for orders, delivery, and refunds.",
      status: "published",
    },
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      body: JSON.stringify({
        lastUpdated: "1 January 2026",
        sections: [
          { heading: "Data We Collect", content: "We collect your name, email, phone number, and delivery address to process your orders. We do not store payment card details." },
          { heading: "How We Use Your Data", content: "Your data is used to fulfil orders, send order confirmations, and (with consent) send marketing communications. We do not sell your data to third parties." },
          { heading: "WhatsApp Communications", content: "If you contact us via WhatsApp, your number will be stored for customer service purposes only." },
          { heading: "Cookies", content: "We use essential cookies to maintain your cart and session. Analytics cookies (if enabled) help us improve the site." },
          { heading: "Contact", content: "For any privacy concerns, contact us at privacy@thelineseafood.sg or via WhatsApp." },
        ],
      }),
      metaDescription: "How The Line Seafood collects, uses, and protects your personal information.",
      status: "published",
    },
    {
      slug: "about",
      title: "About Us",
      body: JSON.stringify({
        tagline: "Singapore's freshest seafood, delivered to your door.",
        values: [
          { title: "Freshness First", description: "We never compromise on freshness. Our cold chain is monitored from source to your doorstep." },
          { title: "Transparent Sourcing", description: "Every product tells you where it's from, how it's stored, and how to prepare it." },
          { title: "Community Fishermen", description: "We work directly with local fishermen, paying fair prices and supporting sustainable fishing." },
          { title: "No Nasties", description: "No artificial preservatives in our fresh lines. What you see is what you get." },
        ],
        team: "We are a team of 12 based in Tampines, Singapore. Our founders grew up eating seafood at Bedok hawker centre and wanted to bring that same quality home.",
      }),
      metaDescription: "About The Line Seafood — our values, team, and commitment to fresh, sustainable seafood.",
      status: "published",
    },
  ]);
  console.log("✓ Content pages");

  // 9. Recipes
  const [recipe1] = await db.insert(schema.recipes).values([
    {
      slug: "chilli-crab-singapore-style",
      title: "Singapore Chilli Crab",
      description: "The iconic Singapore dish. Mud crabs cooked in a rich, tangy, spicy tomato-based sauce. Mop it all up with mantou buns.",
      imageUrl: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop",
      prepTimeMinutes: 20,
      cookTimeMinutes: 25,
      servings: 4,
      difficulty: "medium",
      ingredients: JSON.stringify([
        "2 mud crabs (approx 700g each), cleaned and halved",
        "3 tbsp vegetable oil",
        "6 cloves garlic, minced",
        "3 cm ginger, grated",
        "4 red chillies, blended",
        "4 tbsp tomato ketchup",
        "2 tbsp chilli sauce",
        "1 tbsp oyster sauce",
        "1 tbsp sugar",
        "1 cup water or stock",
        "2 eggs, beaten",
        "Spring onions and coriander to garnish",
        "Fried mantou to serve",
      ]),
      instructions: JSON.stringify([
        "Clean and halve the crabs. Pat dry.",
        "Heat oil in a large wok over high heat. Add crab pieces, fry for 5 minutes until shells turn red. Remove and set aside.",
        "In the same wok, sauté garlic and ginger until fragrant.",
        "Add blended chillies and stir-fry for 2 minutes.",
        "Add ketchup, chilli sauce, oyster sauce, sugar, and water. Bring to a simmer.",
        "Return crab to the wok, toss to coat in sauce. Cover and cook for 10 minutes.",
        "Drizzle beaten eggs into the sauce while stirring to create egg ribbons.",
        "Garnish with spring onions and coriander. Serve with fried mantou.",
      ]),
      tips: "Ask us to pre-clean your crabs when ordering. The sauce should be thick enough to coat the crab — add more stock if it dries out.",
      status: "published",
      featured: true,
    },
    {
      slug: "teochew-steamed-fish",
      title: "Teochew Steamed Fish",
      description: "Classic Teochew-style steamed fish with preserved vegetables, tomatoes, and a clean, savoury broth. Simple, healthy, and deeply satisfying.",
      imageUrl: "https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=800&auto=format&fit=crop",
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      servings: 3,
      difficulty: "easy",
      ingredients: JSON.stringify([
        "1 whole red garoupa or threadfin (500–600g), cleaned",
        "2 tbsp preserved vegetables (tung chye), rinsed",
        "2 ripe tomatoes, sliced",
        "4 strips salted plum",
        "3 cm ginger, julienned",
        "2 tbsp light soy sauce",
        "1 tsp sesame oil",
        "1 cup water",
        "Coriander to garnish",
      ]),
      instructions: JSON.stringify([
        "Rinse the fish and score both sides with 3 diagonal cuts.",
        "In a steaming dish, layer tomatoes on the base.",
        "Place fish on top. Scatter preserved vegetables, salted plum, and ginger over the fish.",
        "Mix soy sauce, sesame oil, and water. Pour around (not over) the fish.",
        "Steam over high heat for 12–15 minutes, depending on thickness.",
        "Garnish with coriander and serve immediately with rice.",
      ]),
      tips: "Don't overcook — the fish is done when the flesh flakes easily at the thickest part. Salted plum adds a unique tang that balances the fish perfectly.",
      status: "published",
      featured: true,
    },
    {
      slug: "garlic-butter-mussels",
      title: "Garlic Butter Mussels",
      description: "Restaurant-quality mussels at home in under 15 minutes. Our NZ green mussels are perfect for this classic preparation.",
      imageUrl: "https://images.unsplash.com/photo-1552644839-6e92c02e2e75?w=800&auto=format&fit=crop",
      prepTimeMinutes: 5,
      cookTimeMinutes: 12,
      servings: 2,
      difficulty: "easy",
      ingredients: JSON.stringify([
        "500g NZ green mussels (half shell), thawed",
        "4 tbsp unsalted butter",
        "6 cloves garlic, minced",
        "½ cup white wine or chicken stock",
        "Juice of 1 lemon",
        "2 tbsp fresh parsley, chopped",
        "Salt and pepper to taste",
        "Crusty bread to serve",
      ]),
      instructions: JSON.stringify([
        "Thaw mussels in fridge overnight or in cold water for 30 minutes.",
        "In a wide pan, melt butter over medium heat. Add garlic and cook until fragrant, 1–2 min.",
        "Add wine or stock and bring to a simmer.",
        "Add mussels, shell-side down. Cover and steam for 5–6 minutes.",
        "Squeeze lemon juice, season with salt and pepper.",
        "Scatter parsley and serve immediately with crusty bread.",
      ]),
      tips: "If some mussels don't open after 6–7 minutes, discard them. Don't overcrowd the pan — cook in batches if needed.",
      status: "published",
      featured: false,
    },
  ]).returning();
  console.log("✓ Recipes");

  // 10. Delivery schedules
  await db.insert(schema.deliverySchedules).values([
    {
      dayOfWeek: 1, // Monday
      label: "Monday Morning",
      cutoffTime: "22:00",
      deliveryTime: "09:00 – 13:00",
      areas: JSON.stringify(["Central", "East", "North East"]),
      notes: "Order by Sunday 10pm",
      isActive: true,
      sortOrder: 1,
    },
    {
      dayOfWeek: 1,
      label: "Monday Afternoon",
      cutoffTime: "08:00",
      deliveryTime: "14:00 – 18:00",
      areas: JSON.stringify(["Central", "East", "North East", "North", "West"]),
      notes: "Order by 8am same day",
      isActive: true,
      sortOrder: 2,
    },
    {
      dayOfWeek: 3, // Wednesday
      label: "Wednesday Morning",
      cutoffTime: "22:00",
      deliveryTime: "09:00 – 13:00",
      areas: JSON.stringify(["Central", "East", "West"]),
      notes: "Order by Tuesday 10pm",
      isActive: true,
      sortOrder: 3,
    },
    {
      dayOfWeek: 5, // Friday
      label: "Friday Morning",
      cutoffTime: "22:00",
      deliveryTime: "09:00 – 13:00",
      areas: JSON.stringify(["Central", "East", "North East", "North", "West"]),
      notes: "Most popular slot. Order by Thursday 10pm.",
      isActive: true,
      sortOrder: 4,
    },
    {
      dayOfWeek: 5,
      label: "Friday Afternoon",
      cutoffTime: "08:00",
      deliveryTime: "14:00 – 18:00",
      areas: JSON.stringify(["Central", "East", "North East", "North", "West"]),
      notes: "Order by 8am Friday. Great for weekend BBQs.",
      isActive: true,
      sortOrder: 5,
    },
    {
      dayOfWeek: 6, // Saturday
      label: "Saturday Morning",
      cutoffTime: "22:00",
      deliveryTime: "09:00 – 13:00",
      areas: JSON.stringify(["Central", "East", "North East"]),
      notes: "Order by Friday 10pm. Limited slots.",
      isActive: true,
      sortOrder: 6,
    },
  ]);
  console.log("✓ Delivery schedules");

  // 11. Social links
  await db.insert(schema.socialLinks).values([
    { platform: "instagram", url: "https://www.instagram.com/thelineseafoodsg", label: "Instagram", isActive: true, sortOrder: 1 },
    { platform: "facebook", url: "https://www.facebook.com/thelineseafoodsg", label: "Facebook", isActive: true, sortOrder: 2 },
    { platform: "tiktok", url: "https://www.tiktok.com/@thelineseafoodsg", label: "TikTok", isActive: true, sortOrder: 3 },
    { platform: "youtube", url: "https://www.youtube.com/@thelineseafoodsg", label: "YouTube", isActive: true, sortOrder: 4 },
    { platform: "whatsapp", url: "https://wa.me/6591234567", label: "WhatsApp", isActive: true, sortOrder: 5 },
  ]);
  console.log("✓ Social links");

  // 12. Hero slides
  await db.insert(schema.heroSlides).values([
    {
      title: "Fresh from the Sea to Your Table.",
      subtitle: "Live crabs, sashimi-grade fish, IQF frozen prawns — sourced daily and delivered islandwide across Singapore.",
      ctaLabel: "Shop Now",
      ctaUrl: "/shop",
      slideType: "welcome",
      status: "active",
      sortOrder: 1,
    },
    {
      title: "This Week's Fresh Deals.",
      subtitle: "Hand-picked specials from our fishermen partners. Limited stock — order before it sells out.",
      ctaLabel: "View Weekly Promos",
      ctaUrl: "/weekly-promos",
      slideType: "promo",
      status: "active",
      sortOrder: 2,
    },
    {
      title: "Subscribe & Never Run Out.",
      subtitle: "Weekly, fortnightly, or monthly seafood deliveries. Save up to 20% with a subscription plan.",
      ctaLabel: "View Subscription Plans",
      ctaUrl: "/subscriptions",
      slideType: "subscription",
      status: "active",
      sortOrder: 3,
    },
    {
      title: "Live · Fresh · Frozen · Bundles.",
      subtitle: "Browse our five seafood categories — from live tanks to freezer-ready packs for the whole family.",
      ctaLabel: "Browse Categories",
      ctaUrl: "/shop",
      slideType: "category",
      status: "active",
      sortOrder: 4,
    },
    {
      title: "Questions? Chat with Us on WhatsApp.",
      subtitle: "Our team is online 8am–9pm daily. Ask about products, orders, custom cuts, or anything else.",
      ctaLabel: "Chat on WhatsApp",
      ctaUrl: "https://wa.me/6591234567",
      slideType: "whatsapp",
      status: "active",
      sortOrder: 5,
    },
  ]);
  console.log("✓ Hero slides");

  // 13. Store settings
  const settings: Array<{ key: string; value: unknown }> = [
    { key: "store.name", value: "The Line Seafood" },
    { key: "store.tagline", value: "Singapore's freshest seafood, delivered to your door." },
    { key: "store.email", value: "hello@thelineseafood.sg" },
    { key: "store.phone", value: "+65 9123 4567" },
    { key: "store.whatsapp", value: "+6591234567" },
    { key: "store.address", value: "Tampines, Singapore 520000" },
    { key: "store.currency", value: "SGD" },
    { key: "shipping.flat_rate_cents", value: 500 },
    { key: "shipping.free_threshold_cents", value: 3000 },
    { key: "stock.low_threshold", value: 5 },
    { key: "checkout.payment_instructions", value: "Transfer to PayNow UEN 123456789A (The Line Seafood). Include your order number as reference. We will confirm payment and prepare your order within 30 minutes." },
    { key: "track_order.help_text", value: "Enter your order number (e.g. TLS-2026-000001) and the email address you used at checkout." },
  ];
  await db
    .insert(schema.storeSettings)
    .values(settings.map((s) => ({ key: s.key, value: JSON.stringify(s.value) })));
  console.log(`✓ ${settings.length} store settings`);

  // 13. Sample coupon
  await db.insert(schema.coupons).values({
    code: "FRESH10",
    type: "percentage",
    value: 1000, // 10%
    minimumOrderCents: 3000,
    status: "active",
  });
  console.log("✓ Coupon: FRESH10 (10% off, min $30)");

  console.log("\n✅ Seed complete — The Line Seafood is ready.\n");
  sqlite.close();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  sqlite.close();
  process.exit(1);
});
