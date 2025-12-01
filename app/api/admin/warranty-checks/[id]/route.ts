import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";

// Clean reimplementation of GET/PATCH/DELETE for a single warranty check

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (
      !adminUser ||
      (adminUser.role !== "ADMIN" && adminUser.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const check = await prisma.warrantyCheck.findUnique({
      where: { id },
      include: {
        workOrder: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
            device: true,
          },
        },
      },
    });

    if (!check) {
      return NextResponse.json(
        { error: "Warranty check not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ check });
  } catch (error) {
    console.error("Get warranty check error:", error);
    return NextResponse.json(
      { error: "Failed to fetch warranty check" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (
      !adminUser ||
      (adminUser.role !== "ADMIN" && adminUser.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      status,
      sendEmail: shouldSendEmail,
      warrantyStatus,
      warrantyExpiry,
      purchaseDate,
      coverageStart,
      coverageEnd,
      deviceStatus,
      additionalNotes,
    } = await req.json();

    const updateData: any = { status };

    if (typeof warrantyStatus !== "undefined")
      updateData.warrantyStatus = warrantyStatus;
    if (typeof deviceStatus !== "undefined")
      updateData.deviceStatus = deviceStatus;
    if (typeof additionalNotes !== "undefined")
      updateData.additionalNotes = additionalNotes;

    const parseDate = (value: string | null | undefined) => {
      if (!value) return null;
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    };

    if (typeof warrantyExpiry !== "undefined")
      updateData.warrantyExpiry = parseDate(warrantyExpiry);
    if (typeof purchaseDate !== "undefined")
      updateData.purchaseDate = parseDate(purchaseDate);
    if (typeof coverageStart !== "undefined")
      updateData.coverageStart = parseDate(coverageStart);
    if (typeof coverageEnd !== "undefined")
      updateData.coverageEnd = parseDate(coverageEnd);

    if (
      status === "SUCCESS" ||
      status === "FAILED" ||
      status === "MANUAL_REQUIRED"
    ) {
      updateData.finishedAt = new Date();
    }

    const updatedCheck = await prisma.warrantyCheck.update({
      where: { id },
      data: updateData,
      include: {
        workOrder: {
          include: {
            user: { select: { name: true, email: true } },
            device: true,
          },
        },
      },
    });

    if (shouldSendEmail && updatedCheck.workOrder?.user?.email) {
      const statusMessages = {
        SUCCESS: "Your warranty check has been completed successfully.",
        FAILED:
          "Your warranty check has failed. Manual verification may be required.",
        MANUAL_REQUIRED: "Your warranty check requires manual verification.",
      } as const;

      const statusMessage =
        statusMessages[status as keyof typeof statusMessages] ||
        "Your warranty check status has been updated.";

      const device = updatedCheck.workOrder?.device;

      let emailHtml = `
        <h2>Hello ${
          updatedCheck.workOrder?.user?.name || "Valued Customer"
        },</h2>
        <p>${statusMessage}</p>
        <p><strong>Provider:</strong> ${updatedCheck.provider.toUpperCase()}</p>
        <p><strong>Device:</strong> ${device?.brand || "Unknown"} ${
        device?.model || "Device"
      }</p>
      `;

      const formatDate = (d?: Date | null) =>
        d ? new Date(d).toLocaleDateString() : null;

      const rawResult = (updatedCheck.result || {}) as any;

      const effectiveWarrantyStatus =
        updatedCheck.warrantyStatus || (rawResult.status as string | undefined);
      const effectiveDeviceStatus =
        updatedCheck.deviceStatus ||
        (rawResult.deviceStatus as string | undefined);

      const warrantyExpiryDate =
        updatedCheck.warrantyExpiry ||
        (rawResult.expiryDate ? new Date(rawResult.expiryDate) : null);

      const purchaseDateValue =
        updatedCheck.purchaseDate ||
        (rawResult.purchaseDate ? new Date(rawResult.purchaseDate) : null);

      const coverageStartValue =
        updatedCheck.coverageStart ||
        (rawResult.coverageStart ? new Date(rawResult.coverageStart) : null);

      const coverageEndValue =
        updatedCheck.coverageEnd ||
        (rawResult.coverageEnd ? new Date(rawResult.coverageEnd) : null);

      const details: string[] = [];
      if (effectiveWarrantyStatus)
        details.push(
          `<li><strong>Warranty Status:</strong> ${effectiveWarrantyStatus}</li>`
        );
      if (warrantyExpiryDate)
        details.push(
          `<li><strong>Warranty Expiry:</strong> ${formatDate(
            warrantyExpiryDate
          )}</li>`
        );
      if (purchaseDateValue)
        details.push(
          `<li><strong>Purchase Date:</strong> ${formatDate(
            purchaseDateValue
          )}</li>`
        );
      if (coverageStartValue)
        details.push(
          `<li><strong>Coverage Start:</strong> ${formatDate(
            coverageStartValue
          )}</li>`
        );
      if (coverageEndValue)
        details.push(
          `<li><strong>Coverage End:</strong> ${formatDate(
            coverageEndValue
          )}</li>`
        );
      if (effectiveDeviceStatus)
        details.push(
          `<li><strong>Device Status:</strong> ${effectiveDeviceStatus}</li>`
        );

      if (details.length > 0) {
        emailHtml += `
          <h3>Warranty & Device Details</h3>
          <ul>
            ${details.join("\n")} 
          </ul>
        `;
      }

      if (updatedCheck.additionalNotes) {
        emailHtml += `
          <p><strong>Notes from technician:</strong><br />
          ${updatedCheck.additionalNotes.replace(/\n/g, "<br />")}</p>
        `;
      }

      emailHtml += `
        <br>
        <p>Best regards,<br>Servixing Team</p>
      `;

      try {
        await sendEmail({
          to: updatedCheck.workOrder.user.email,
          subject: "Warranty Check Status Update",
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Failed to send warranty check email:", emailError);
      }
    }

    return NextResponse.json({ check: updatedCheck });
  } catch (error) {
    console.error("Update warranty check error:", error);
    return NextResponse.json(
      { error: "Failed to update warranty check" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!adminUser || adminUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Super Admin only" },
        { status: 403 }
      );
    }

    const { sendEmail: shouldSendEmail } = await req.json();

    const check = await prisma.warrantyCheck.findUnique({
      where: { id },
      include: {
        workOrder: {
          include: {
            user: { select: { email: true, name: true } },
            device: true,
          },
        },
      },
    });

    if (!check) {
      return NextResponse.json(
        { error: "Warranty check not found" },
        { status: 404 }
      );
    }

    await prisma.warrantyCheck.delete({ where: { id } });

    if (shouldSendEmail && check.workOrder?.user?.email) {
      try {
        await sendEmail({
          to: check.workOrder.user.email,
          subject: "Warranty Check Update",
          html: `
            <h2>Hello ${check.workOrder?.user?.name || "Valued Customer"},</h2>
            <p>Your warranty check for ${check.provider.toUpperCase()} has been removed from our system.</p>
            <p><strong>Device:</strong> ${
              check.workOrder?.device?.brand || "Unknown"
            } ${check.workOrder?.device?.model || "Device"}</p>
            <p>If you have any questions, please contact our support team.</p>
            <br>
            <p>Best regards,<br>Servixing Team</p>
          `,
        });
      } catch (emailError) {
        console.error(
          "Failed to send warranty check deletion email:",
          emailError
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete warranty check error:", error);
    return NextResponse.json(
      { error: "Failed to delete warranty check" },
      { status: 500 }
    );
  }
}
