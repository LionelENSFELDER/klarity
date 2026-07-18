import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding SQLite database...");

  // Nettoyer les données existantes
  await prisma.contract.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing data");

  // Créer un utilisateur de test
  const testUser = await prisma.user.create({
    data: {
      email: "test@klarity.dev",
      name: "John Doe",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      emailVerified: new Date(),
      password: "$2y$10$IWJXf1PnKiLhf5rW0uBJB.AYBGIGG/0SCNK64NApCw2bQHwrgEDYy",
    },
  });

  console.log(`✅ Created test user: ${testUser.email}`);

  // Créer des contrats de démonstration (catégories du référentiel Klarity)
  const contractsData = [
    {
      name: "MAAF Habitation",
      provider: "MAAF",
      contractNumber: "AH-2024-051234",
      category: "habitation",
      amount: 45.5,
      frequency: "monthly",
      debitDay: 5,
      renewalDate: new Date("2026-03-15"),
      monthlyAmount: 45.5,
    },
    {
      name: "Assurance Auto",
      provider: "Direct Assurance",
      contractNumber: "AA-2024-068521",
      category: "auto",
      amount: 82.0,
      frequency: "monthly",
      debitDay: 28,
      renewalDate: new Date("2026-09-28"),
      monthlyAmount: 82.0,
    },
    {
      name: "EDF Électricité",
      provider: "EDF",
      category: "energie",
      amount: 65.0,
      frequency: "monthly",
      debitDay: 15,
      monthlyAmount: 65.0,
    },
    {
      name: "Orange Mobile + Internet",
      provider: "Orange",
      contractNumber: "TEL-2024-159753",
      category: "telecom",
      amount: 89.9,
      frequency: "monthly",
      debitDay: 10,
      renewalDate: new Date("2027-01-10"),
      monthlyAmount: 89.9,
    },
    {
      name: "Alan Mutuelle Santé",
      provider: "Alan",
      contractNumber: "MS-2024-445789",
      category: "sante",
      amount: 156.2,
      frequency: "monthly",
      debitDay: 1,
      renewalDate: new Date("2026-12-31"),
      monthlyAmount: 156.2,
    },
    {
      name: "Crédit Immobilier",
      provider: "Crédit Agricole",
      contractNumber: "CI-2020-778001",
      category: "credit",
      amount: 845.0,
      frequency: "monthly",
      debitDay: 5,
      monthlyAmount: 845.0,
    },
    {
      name: "Netflix",
      provider: "Netflix",
      category: "abonnement",
      amount: 13.49,
      frequency: "monthly",
      debitDay: 13,
      monthlyAmount: 13.49,
    },
    {
      name: "Spotify",
      provider: "Spotify",
      category: "abonnement",
      amount: 10.99,
      frequency: "monthly",
      debitDay: 18,
      monthlyAmount: 10.99,
    },
    {
      name: "Assurance Vie - Frais annuels",
      provider: "MAIF",
      category: "credit",
      amount: 120.0,
      frequency: "annual",
      debitDay: 20,
      anchorMonth: 2, // mars
      annualAmount: 120.0,
    },
    {
      name: "Eau - Régie municipale",
      provider: "Veolia",
      category: "energie",
      amount: 95.0,
      frequency: "quarterly",
      debitDay: 8,
      anchorMonth: 0, // janvier, avril, juillet, octobre
    },
  ];

  const contracts = await Promise.all(
    contractsData.map((data) =>
      prisma.contract.create({
        data: {
          ...data,
          status: "active",
          startDate: new Date("2024-01-01"),
          userId: testUser.id,
        },
      }),
    ),
  );

  console.log(`✅ Created ${contracts.length} sample contracts`);

  // Statistiques
  const stats = {
    totalUsers: await prisma.user.count(),
    totalContracts: await prisma.contract.count(),
    activeContracts: await prisma.contract.count({
      where: { status: "active" },
    }),
    totalMonthly: contracts.reduce((sum, c) => sum + (c.monthlyAmount || 0), 0),
    totalAnnual: contracts.reduce((sum, c) => sum + (c.annualAmount || 0), 0),
  };

  console.log("\n📊 Database Statistics:");
  console.log(`   Users: ${stats.totalUsers}`);
  console.log(
    `   Contracts: ${stats.totalContracts} (${stats.activeContracts} active)`,
  );
  console.log(`   Monthly cost: ${stats.totalMonthly.toFixed(2)}€`);
  console.log(`   Annual cost: ${stats.totalAnnual.toFixed(2)}€`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n🔐 Test login credentials:");
  console.log(`   Email: ${testUser.email}`);
  console.log("   (Use Google OAuth or email magic link)");

  console.log("\n🛠️  Next steps:");
  console.log("   1. Run: npm run dev");
  console.log("   2. Open: npx prisma studio (to view data)");
  console.log("   3. Test auth with your configured providers");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
