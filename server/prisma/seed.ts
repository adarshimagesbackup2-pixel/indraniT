import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // 1. Default admin user (must change password on first login)
  const existingAdmin = await prisma.user.findUnique({
    where: { phone: "9999999999" },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("Admin@123", 12);
    await prisma.user.create({
      data: {
        name: "Administrator",
        phone: "9999999999",
        passwordHash,
        role: "ADMIN",
        mustChangePassword: true,
      },
    });
    console.log("✔ Seeded default admin (phone: 9999999999 / password: Admin@123)");
  } else {
    console.log("• Admin user already exists, skipping");
  }

  // 2. Business settings singleton
  const existingSettings = await prisma.businessSettings.findUnique({
    where: { id: "singleton" },
  });

  if (!existingSettings) {
    await prisma.businessSettings.create({
      data: {
        id: "singleton",
        businessName: "Indrani Traders",
        businessGstin: null,
        businessAddress: "MIDC Industrial Area, Nashik, Maharashtra",
        businessPhone: "9999999999",
      },
    });
    console.log("✔ Seeded default business settings");
  } else {
    console.log("• Business settings already exist, skipping");
  }

  // 3. Sample bag types
  const sampleBags = [
    { bagType: "Jute Bardan", defaultRate: 18.5, currentStock: 5000, lowStockThreshold: 1000, hsnCode: "6305" },
    { bagType: "Leno Mesh Bag", defaultRate: 9.75, currentStock: 8000, lowStockThreshold: 2000, hsnCode: "3923" },
    { bagType: "HDPE Woven Bag", defaultRate: 12.0, currentStock: 3000, lowStockThreshold: 1500, hsnCode: "3923" },
  ];

  for (const bag of sampleBags) {
    const existing = await prisma.bagMaster.findUnique({ where: { bagType: bag.bagType } });
    if (!existing) {
      await prisma.bagMaster.create({ data: bag });
      console.log(`✔ Seeded bag type: ${bag.bagType}`);
    }
  }

  // 4. Demo customer
  const existingDemoCustomer = await prisma.customer.findFirst({
    where: { phone: "8888888888" },
  });
  if (!existingDemoCustomer) {
    await prisma.customer.create({
      data: {
        name: "Demo Customer",
        phone: "8888888888",
        address: "123 Demo Road, Nashik, Maharashtra",
        gstin: null,
        trademarkName: "Demo Traders",
        openingBalance: 0.0,
        openingBalanceType: "DEBIT",
        creditLimit: 50000.0,
        isActive: true,
        stateCode: "27",
        pincode: "422010",
      },
    });
    console.log("✔ Seeded demo customer (phone: 8888888888)");
  }

  // 5. Sample transport
  const existingTransport = await prisma.transport.findFirst({
    where: { vehicleNo: "MH15AB1234" },
  });
  if (!existingTransport) {
    await prisma.transport.create({
      data: {
        vehicleNo: "MH15AB1234",
        driverName: "Ramesh Patil",
        driverPhone: "9876543210",
      },
    });
    console.log("✔ Seeded sample transport vehicle");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
