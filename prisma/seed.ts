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
    },
  });

  console.log(`✅ Created test user: ${testUser.email}`);

  // Créer des contrats de démonstration
  const contracts = await Promise.all([
    // Assurance Habitation
    prisma.contract.create({
      data: {
        name: "Assurance Habitation",
        provider: "MAIF",
        contractNumber: "AH-2024-051234",
        category: "assurance-habitation",
        status: "active",
        startDate: new Date("2024-03-15"),
        endDate: new Date("2025-03-15"),
        renewalDate: new Date("2025-03-15"),
        monthlyAmount: 45.5,
        annualAmount: 546.0,
        clientPhone: "05 49 73 73 73",
        website: "https://www.maif.fr",
        advisorName: "Marie Dupont",
        notes:
          "Points importants :\n• Option vol ajoutée en juin 2024\n• Revoir la franchise dégâts des eaux l'an prochain\n• Contacter MAIF avant mars pour négocier le tarif\n• Inventaire des biens à mettre à jour",
        userId: testUser.id,
      },
    }),

    // Assurance Auto
    prisma.contract.create({
      data: {
        name: "Assurance Auto",
        provider: "Direct Assurance",
        contractNumber: "AA-2024-068521",
        category: "assurance-auto",
        status: "active",
        startDate: new Date("2023-09-28"),
        endDate: new Date("2025-09-28"),
        renewalDate: new Date("2025-09-28"),
        monthlyAmount: 82.0,
        annualAmount: 984.0,
        clientPhone: "09 70 80 90 90",
        website: "https://www.direct-assurance.fr",
        notes:
          "Véhicule : Peugeot 308 (2019)\nFormule : Tous risques\nFranchise : 300€",
        userId: testUser.id,
      },
    }),

    // Électricité
    prisma.contract.create({
      data: {
        name: "Électricité",
        provider: "EDF",
        category: "energie",
        status: "active",
        startDate: new Date("2023-06-01"),
        monthlyAmount: 65.0,
        annualAmount: 780.0,
        clientPhone: "09 69 32 15 15",
        website: "https://particulier.edf.fr",
        notes:
          "Tarif Bleu - Option Heures Creuses\nPuissance : 6 kVA\nIndex relevé le 15 de chaque mois",
        userId: testUser.id,
      },
    }),

    // Mobile + Internet
    prisma.contract.create({
      data: {
        name: "Mobile + Internet",
        provider: "Orange",
        contractNumber: "TEL-2024-159753",
        category: "telecom",
        status: "active",
        startDate: new Date("2024-01-10"),
        endDate: new Date("2026-01-10"),
        renewalDate: new Date("2026-01-10"),
        monthlyAmount: 89.9,
        annualAmount: 1078.8,
        clientPhone: "3900",
        website: "https://orange.fr",
        notes:
          "Forfait : Livebox Up + Mobile 100Go\nEngagement : 24 mois\nÉquipements inclus : Livebox 6, décodeur TV",
        userId: testUser.id,
      },
    }),

    // Mutuelle Santé
    prisma.contract.create({
      data: {
        name: "Mutuelle Santé",
        provider: "Harmonie Mutuelle",
        contractNumber: "MS-2024-445789",
        category: "sante",
        status: "active",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        renewalDate: new Date("2024-12-31"),
        monthlyAmount: 156.2,
        annualAmount: 1874.4,
        clientPhone: "09 69 36 40 00",
        website: "https://www.harmonie-mutuelle.fr",
        notes:
          "Niveau : Confort+\nOptique : 450€/an\nDentaire : Soins conservateurs 300%\nHospitalisation : Chambre individuelle",
        userId: testUser.id,
      },
    }),

    // Compte Bancaire
    prisma.contract.create({
      data: {
        name: "Compte Courant",
        provider: "Crédit Agricole",
        category: "banque",
        status: "active",
        startDate: new Date("2020-05-15"),
        monthlyAmount: 8.0,
        annualAmount: 96.0,
        clientPhone: "09 70 70 24 24",
        website: "https://www.credit-agricole.fr",
        advisorName: "Pierre Martin",
        notes:
          "Compte principal\nCarte Visa Classic incluse\nVirements SEPA gratuits\nDécouverts autorisés : 1000€",
        userId: testUser.id,
      },
    }),

    // Contrat en cours d'expiration
    prisma.contract.create({
      data: {
        name: "Netflix",
        provider: "Netflix",
        category: "abonnement",
        status: "active",
        startDate: new Date("2023-11-01"),
        endDate: new Date("2025-10-31"),
        monthlyAmount: 13.49,
        annualAmount: 161.88,
        website: "https://www.netflix.com",
        notes:
          "Plan Standard - 2 écrans HD\nRenouvellement automatique\nPossibilité de changer de plan à tout moment",
        userId: testUser.id,
      },
    }),
  ]);

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
    `   Contracts: ${stats.totalContracts} (${stats.activeContracts} active)`
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
