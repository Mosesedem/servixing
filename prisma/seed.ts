import {
  PrismaClient,
  UserRole,
  WorkOrderStatus,
  PaymentStatus,
  DropoffType,
  WarrantyStatus,
  TicketStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean existing data (in development only)
  if (process.env.NODE_ENV === "development") {
    console.log("🧹 Cleaning existing data...");
    await prisma.auditLog.deleteMany();
    await prisma.notificationLog.deleteMany();
    await prisma.warrantyCheck.deleteMany();
    await prisma.part.deleteMany();
    await prisma.paymentLog.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.ticketMessage.deleteMany();
    await prisma.supportTicket.deleteMany();
    await prisma.workOrder.deleteMany();
    await prisma.device.deleteMany();
    await prisma.knowledgeBaseArticle.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  }

  // Hash passwords
  const adminPassword = await bcrypt.hash(
    process.env.TEST_ADMIN_PASSWORD || "Admin@123456",
    10
  );
  const userPassword = await bcrypt.hash(
    process.env.TEST_USER_PASSWORD || "User@123456",
    10
  );
  const techPassword = await bcrypt.hash("Tech@123456", 10);

  // Create Users
  console.log("👤 Creating users...");

  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: process.env.TEST_ADMIN_EMAIL || "admin@servixing.com",
      password: adminPassword,
      phone: "+2348123456789",
      address: "123 Admin Street, Lagos, Nigeria",
      role: UserRole.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  });

  const technician = await prisma.user.create({
    data: {
      name: "John Technician",
      email: "tech@servixing.com",
      password: techPassword,
      phone: "+2348123456788",
      address: "456 Tech Avenue, Lagos, Nigeria",
      role: UserRole.TECHNICIAN,
      emailVerified: new Date(),
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: "Jane Customer",
      email: process.env.TEST_USER_EMAIL || "user@example.com",
      password: userPassword,
      phone: "+2348123456787",
      address: "789 Customer Road, Abuja, Nigeria",
      role: UserRole.CUSTOMER,
      emailVerified: new Date(),
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: "David Smith",
      email: "david@example.com",
      password: userPassword,
      phone: "+2348123456786",
      address: "321 User Lane, Port Harcourt, Nigeria",
      role: UserRole.CUSTOMER,
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Created ${4} users`);

  // Create Devices
  console.log("📱 Creating devices...");

  const device1 = await prisma.device.create({
    data: {
      userId: customer1.id,
      deviceType: "laptop",
      brand: "Apple",
      model: 'MacBook Pro 16" 2023',
      serialNumber: "C02XG0FDH7JY",
      color: "Space Gray",
      description: "MacBook Pro with M2 Max chip, 32GB RAM, 1TB SSD",
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/laptop1.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/laptop1-detail.jpg",
      ],
    },
  });

  const device2 = await prisma.device.create({
    data: {
      userId: customer1.id,
      deviceType: "phone",
      brand: "Apple",
      model: "iPhone 14 Pro Max",
      serialNumber: "F2LMDN0P0GC3",
      imei: "356938035643809",
      color: "Deep Purple",
      description: "iPhone 14 Pro Max 256GB",
      images: ["https://res.cloudinary.com/demo/image/upload/v1/iphone1.jpg"],
    },
  });

  const device3 = await prisma.device.create({
    data: {
      userId: customer2.id,
      deviceType: "laptop",
      brand: "Dell",
      model: "XPS 15 9530",
      serialNumber: "BXRGT03",
      color: "Platinum Silver",
      description: "Dell XPS 15 with Intel i9, 64GB RAM, 2TB SSD",
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/dell-laptop.jpg",
      ],
    },
  });

  const device4 = await prisma.device.create({
    data: {
      userId: customer2.id,
      deviceType: "tablet",
      brand: "Samsung",
      model: "Galaxy Tab S9 Ultra",
      serialNumber: "R9WRA1ZXRQP",
      color: "Graphite",
      description: "Samsung Galaxy Tab S9 Ultra 512GB",
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/samsung-tablet.jpg",
      ],
    },
  });

  console.log(`✅ Created ${4} devices`);

  // Create Work Orders
  console.log("🛠️  Creating work orders...");

  const workOrder1 = await prisma.workOrder.create({
    data: {
      userId: customer1.id,
      deviceId: device1.id,
      status: WorkOrderStatus.IN_REPAIR,
      issueDescription:
        "Screen is cracked and keyboard is not responding properly. Need urgent repair.",
      dropoffType: DropoffType.DROPOFF,
      estimatedCost: 85000,
      finalCost: 82000,
      totalAmount: 82000,
      warrantyChecked: true,
      warrantyStatus: WarrantyStatus.OUT_OF_WARRANTY,
      warrantyProvider: "Apple",
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: "online",
      paymentReference: "PAY-" + Date.now(),
      notes:
        "Customer reported water damage previously. Screen and keyboard replacement required.",
      costBreakdown: {
        serviceFee: 50000,
        partsCost: 32000,
      },
    },
  });

  const workOrder2 = await prisma.workOrder.create({
    data: {
      userId: customer1.id,
      deviceId: device2.id,
      status: WorkOrderStatus.CREATED,
      issueDescription:
        "Battery drains very fast, phone gets hot during charging.",
      dropoffType: DropoffType.DISPATCH,
      dispatchAddress: {
        street: "789 Customer Road",
        city: "Abuja",
        state: "FCT",
        postalCode: "900001",
        country: "Nigeria",
      },
      dispatchFee: 2000,
      totalAmount: 2000,
      warrantyDecision: "requested",
      warrantyChecked: false,
      warrantyStatus: WarrantyStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      notes: "Dispatch scheduled for tomorrow. Warranty check to be performed.",
    },
  });

  const workOrder3 = await prisma.workOrder.create({
    data: {
      userId: customer2.id,
      deviceId: device3.id,
      status: WorkOrderStatus.READY_FOR_PICKUP,
      issueDescription: "Laptop won't turn on. Power button not responding.",
      dropoffType: DropoffType.DROPOFF,
      estimatedCost: 45000,
      finalCost: 38000,
      totalAmount: 38000,
      warrantyChecked: true,
      warrantyStatus: WarrantyStatus.IN_WARRANTY,
      warrantyProvider: "Dell",
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: "online",
      paymentReference: "PAY-" + (Date.now() + 1000),
      notes:
        "Motherboard issue resolved under warranty. Customer to pick up device.",
      costBreakdown: {
        serviceFee: 38000,
      },
    },
  });

  const workOrder4 = await prisma.workOrder.create({
    data: {
      userId: customer2.id,
      deviceId: device4.id,
      status: WorkOrderStatus.COMPLETED,
      issueDescription:
        "Screen has dead pixels and touch not working in some areas.",
      dropoffType: DropoffType.DROPOFF,
      estimatedCost: 55000,
      finalCost: 55000,
      totalAmount: 55000,
      warrantyChecked: true,
      warrantyStatus: WarrantyStatus.OUT_OF_WARRANTY,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: "cash",
      notes: "Screen replaced successfully. Customer picked up device.",
      costBreakdown: {
        serviceFee: 25000,
        partsCost: 30000,
      },
    },
  });

  console.log(`✅ Created ${4} work orders`);

  // Create Payments
  console.log("💳 Creating payments...");

  const payment1 = await prisma.payment.create({
    data: {
      userId: customer1.id,
      workOrderId: workOrder1.id,
      amount: 82000,
      currency: "NGN",
      status: PaymentStatus.PAID,
      provider: "paystack",
      paystackReference: "ref_" + Date.now(),
      paystackAuthCode: "AUTH_" + Date.now(),
      webhookVerified: true,
      webhookVerifiedAt: new Date(),
      metadata: {
        channel: "card",
        cardType: "visa",
        bank: "GTBank",
      },
    },
  });

  const payment2 = await prisma.payment.create({
    data: {
      userId: customer2.id,
      workOrderId: workOrder3.id,
      amount: 38000,
      currency: "NGN",
      status: PaymentStatus.PAID,
      provider: "paystack",
      paystackReference: "ref_" + (Date.now() + 2000),
      paystackAuthCode: "AUTH_" + (Date.now() + 2000),
      webhookVerified: true,
      webhookVerifiedAt: new Date(),
      metadata: {
        channel: "card",
        cardType: "mastercard",
        bank: "Access Bank",
      },
    },
  });

  console.log(`✅ Created ${2} payments`);

  // Create Support Tickets
  console.log("🎫 Creating support tickets...");

  const ticket1 = await prisma.supportTicket.create({
    data: {
      userId: customer1.id,
      deviceId: device2.id,
      workOrderId: workOrder2.id,
      title: "Question about warranty check",
      description: "How long does the warranty check usually take?",
      status: TicketStatus.OPEN,
      priority: "normal",
    },
  });

  const ticket2 = await prisma.supportTicket.create({
    data: {
      userId: customer2.id,
      title: "Inquiry about repair pricing",
      description:
        "Can I get a quote for screen replacement before bringing in my device?",
      status: TicketStatus.CLOSED,
      priority: "low",
    },
  });

  // Create Ticket Messages
  console.log("💬 Creating ticket messages...");

  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket1.id,
      userId: customer1.id,
      message:
        "I submitted my work order yesterday and selected warranty check. Just wondering about the timeline.",
    },
  });

  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket1.id,
      userId: superAdmin.id,
      message:
        "Hi! Warranty checks typically take 24-48 hours. We'll update your work order as soon as we have the results.",
    },
  });

  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket2.id,
      userId: customer2.id,
      message:
        "Looking to get my tablet screen replaced. What would be the estimated cost?",
    },
  });

  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket2.id,
      userId: superAdmin.id,
      message:
        "Screen replacement for Samsung Galaxy Tab S9 Ultra typically costs between ₦45,000 - ₦60,000 depending on parts availability. You can create a work order for a precise quote!",
    },
  });

  console.log(`✅ Created ${2} support tickets with ${4} messages`);

  // Create Knowledge Base Articles
  console.log("📚 Creating knowledge base articles...");

  await prisma.knowledgeBaseArticle.create({
    data: {
      title: "How to Check Your Device Warranty Status",
      slug: "how-to-check-device-warranty",
      content: `# How to Check Your Device Warranty Status

Wondering if your device is still under warranty? Here's a comprehensive guide to checking warranty status for different brands.

## Apple Devices
1. Visit Apple's warranty check page
2. Enter your serial number
3. Review your coverage details

## Dell Devices
1. Go to Dell support website
2. Enter your service tag
3. Check warranty expiration date

## Samsung Devices
Use Samsung Members app or visit their support website.

Need help? Create a work order and we'll check it for you!`,
      category: "troubleshooting",
      tags: ["warranty", "apple", "dell", "samsung"],
      views: 45,
      helpful: 12,
      published: true,
    },
  });

  await prisma.knowledgeBaseArticle.create({
    data: {
      title: "Common MacBook Battery Issues and Solutions",
      slug: "macbook-battery-issues",
      content: `# Common MacBook Battery Issues and Solutions

Is your MacBook battery draining faster than usual? Here are common issues and what you can do.

## Symptoms of Battery Problems
- Rapid battery drain
- Device getting hot
- Battery not charging
- Unexpected shutdowns

## Quick Fixes
1. Reset SMC (System Management Controller)
2. Check battery health in System Settings
3. Close resource-intensive apps
4. Update macOS to latest version

## When to Seek Professional Help
If basic troubleshooting doesn't help, you may need battery replacement. Create a work order with us for professional diagnosis.`,
      category: "maintenance",
      tags: ["macbook", "battery", "apple"],
      views: 128,
      helpful: 34,
      published: true,
    },
  });

  await prisma.knowledgeBaseArticle.create({
    data: {
      title: "What to Do Before Bringing Your Device for Repair",
      slug: "before-device-repair",
      content: `# What to Do Before Bringing Your Device for Repair

Preparing your device properly can speed up the repair process and protect your data.

## Essential Steps

### 1. Backup Your Data
- Use iCloud, Google Drive, or external hard drive
- Export important files
- Save your contacts and photos

### 2. Remove Personal Items
- Take out SIM card
- Remove memory cards
- Take off phone cases and screen protectors

### 3. Note Your Device Passcode
We may need it to test repairs. You can also disable Find My iPhone/Device Protection temporarily.

### 4. Document Issues
- Take photos/videos of problems
- List all symptoms
- Note when issues started

## What to Bring
- Original charger (if charging issue)
- Warranty documentation
- Purchase receipt
- Photo ID

Following these steps ensures a smooth repair experience!`,
      category: "repair-guides",
      tags: ["preparation", "repair", "data-backup"],
      views: 89,
      helpful: 27,
      published: true,
    },
  });

  console.log(`✅ Created ${3} knowledge base articles`);

  // Create Audit Logs
  console.log("📋 Creating audit logs...");

  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: "work_order_status_updated",
      entityType: "WorkOrder",
      entityId: workOrder1.id,
      oldValue: { status: "ACCEPTED" },
      newValue: { status: "IN_REPAIR" },
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: customer1.id,
      action: "device_created",
      entityType: "Device",
      entityId: device1.id,
      newValue: {
        deviceType: "laptop",
        brand: "Apple",
        model: 'MacBook Pro 16" 2023',
      },
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0",
    },
  });

  console.log(`✅ Created ${2} audit logs`);

  // Create Notification Logs
  console.log("🔔 Creating notification logs...");

  await prisma.notificationLog.create({
    data: {
      userId: customer1.id,
      type: "email",
      subject: "Work Order Status Update",
      content:
        "Your work order #" +
        workOrder1.id +
        " status has been updated to IN_REPAIR.",
      status: "sent",
      attempts: 1,
      sentAt: new Date(),
    },
  });

  await prisma.notificationLog.create({
    data: {
      userId: customer2.id,
      type: "email",
      subject: "Device Ready for Pickup",
      content:
        "Your " + device3.brand + " " + device3.model + " is ready for pickup!",
      status: "sent",
      attempts: 1,
      sentAt: new Date(),
    },
  });

  console.log(`✅ Created ${2} notification logs`);

  console.log("");
  console.log("🎉 Database seeding completed successfully!");
  console.log("");
  console.log("📊 Summary:");
  console.log(`   Users: 4 (1 Super Admin, 1 Technician, 2 Customers)`);
  console.log(`   Devices: 4`);
  console.log(`   Work Orders: 4`);
  console.log(`   Payments: 2`);
  console.log(`   Support Tickets: 2`);
  console.log(`   Knowledge Base Articles: 3`);
  console.log(`   Audit Logs: 2`);
  console.log(`   Notification Logs: 2`);
  console.log("");
  console.log("🔑 Test Credentials:");
  console.log(
    `   Super Admin: ${superAdmin.email} / ${
      process.env.TEST_ADMIN_PASSWORD || "Admin@123456"
    }`
  );
  console.log(`   Technician: tech@servixing.com / Tech@123456`);
  console.log(
    `   Customer: ${customer1.email} / ${
      process.env.TEST_USER_PASSWORD || "User@123456"
    }`
  );
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
