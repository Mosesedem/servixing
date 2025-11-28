import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// Mock settings storage - in production, this would be in a database
let systemSettings = {
  siteName: "ServiXing",
  siteDescription: "Professional device repair services",
  contactEmail: "support@servixing.com",
  contactPhone: "+234 xxx xxx xxxx",
  maintenanceMode: false,
  allowRegistration: true,
  emailNotifications: true,
  smsNotifications: false,
  defaultCurrency: "NGN",
  timezone: "Africa/Lagos",
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(systemSettings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updates = await req.json();

    // Validate input
    const allowedFields = [
      "siteName",
      "siteDescription",
      "contactEmail",
      "contactPhone",
      "maintenanceMode",
      "allowRegistration",
      "emailNotifications",
      "smsNotifications",
      "defaultCurrency",
      "timezone",
    ];

    const validatedUpdates: any = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        validatedUpdates[field] = updates[field];
      }
    }

    // Only SUPER_ADMIN can change maintenance mode
    if (updates.maintenanceMode !== undefined && userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only super admins can change maintenance mode" },
        { status: 403 }
      );
    }

    // Update settings
    systemSettings = { ...systemSettings, ...validatedUpdates };

    // Log the change
    await prisma?.auditLog.create({
      data: {
        userId: session.user.id,
        action: "settings_updated",
        entityType: "System",
        entityId: "global_settings",
        oldValue: JSON.stringify({}),
        newValue: JSON.stringify(validatedUpdates),
      },
    });

    return NextResponse.json(systemSettings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
