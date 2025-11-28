import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadMultipleImages } from "@/lib/cloudinary";
import { createRateLimiter } from "@/lib/rate-limit";
import config from "@/lib/config";
import { sendEmail, buildRepairConfirmationEmail } from "@/lib/mailer";
import { UserRole } from "@prisma/client";

/**
 * POST /api/public/repair-request
 * Accepts multipart/form-data with fields + up to 3 images.
 * Rate-limited and unauthenticated.
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const rl = createRateLimiter(5, "10 m");
    if (rl) {
      const ip = req.headers.get("x-forwarded-for") || "anonymous";
      const { success } = await rl.limit(`public:repair:${ip}`);
      if (!success) {
        return NextResponse.json(
          { error: { code: "RATE_LIMIT", message: "Too many requests" } },
          { status: 429 }
        );
      }
    }

    const form = await req.formData();

    // Extract core fields
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "")
      .trim()
      .toLowerCase();
    const phone = String(form.get("phone") || "").trim();
    const deviceType = String(form.get("deviceType") || "").trim();
    const brand = String(form.get("brand") || "").trim();
    const model = String(form.get("model") || "").trim();
    const serialNumber = String(form.get("serialNumber")).trim();
    const issue = String(form.get("issue") || "").trim();
    const problemType = String(form.get("problemType") || "").trim();
    const dropoffType = String(form.get("dropoffType") || "DROPOFF").trim();

    // Address
    const addressLine1 = String(form.get("addressLine1") || "").trim();
    const addressLine2 = String(form.get("addressLine2") || "").trim();
    const city = String(form.get("city") || "").trim();
    const state = String(form.get("state") || "").trim();
    const postalCode = String(form.get("postalCode") || "").trim();
    const landmark = String(form.get("landmark") || "").trim();

    const customerRequest = String(form.get("customerRequest") || "").trim();
    const honeypot = String(form.get("hp") || "").trim();

    // Honeypot check
    if (honeypot) {
      return NextResponse.json(
        { error: { code: "SPAM_DETECTED", message: "Invalid submission" } },
        { status: 400 }
      );
    }

    // Validate required
    if (
      !name ||
      !email ||
      !phone ||
      !deviceType ||
      !brand ||
      !issue ||
      !serialNumber
    ) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Missing required fields",
          },
        },
        { status: 400 }
      );
    }

    if (dropoffType === "DISPATCH" || dropoffType === "ONSITE") {
      if (!addressLine1 || !city || !state) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message:
                "Address line 1, city and state are required for dispatch and onsite services",
            },
          },
          { status: 400 }
        );
      }
    }

    // Images validation & upload
    const files = form.getAll("images").filter(Boolean) as File[];
    if (files.length > 3) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Maximum 3 images" } },
        { status: 400 }
      );
    }

    for (const file of files) {
      const allowed = config.upload.allowedImageTypes as readonly string[];
      if (!allowed.includes(file.type)) {
        return NextResponse.json(
          {
            error: {
              code: "INVALID_FILE_TYPE",
              message: "Only image files are allowed",
            },
          },
          { status: 400 }
        );
      }
      if (file.size > config.upload.maxFileSize) {
        return NextResponse.json(
          {
            error: {
              code: "FILE_TOO_LARGE",
              message: `Each image must be ${(
                config.upload.maxFileSize /
                (1024 * 1024)
              ).toFixed(0)}MB or smaller`,
            },
          },
          { status: 400 }
        );
      }
    }

    // Convert to base64 & upload
    let imageUrls: string[] = [];
    if (files.length) {
      const imageDataURIs = await Promise.all(
        files.map(async (file) => {
          const bytes = await file.arrayBuffer();
          const base64 = Buffer.from(bytes).toString("base64");
          return `data:${file.type};base64,${base64}`;
        })
      );

      const folder = `servixing/public/${new Date()
        .toISOString()
        .slice(0, 10)}`;
      const results = await uploadMultipleImages(imageDataURIs, {
        folder,
        tags: ["public", "device"],
      });
      imageUrls = results.map((r) => r.secure_url);
    }

    // Find or create user by email
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || null,
          phone: phone || null,
          role: UserRole.CUSTOMER,
        },
      });
    }

    // Compose metadata
    const metadata = {
      contact: { name, email, phone },
      device: { deviceType, brand, model, serialNumber },
      issue,
      problemType: problemType || null,
      dropoffType,
      address:
        dropoffType === "DISPATCH" || dropoffType === "ONSITE"
          ? { addressLine1, addressLine2, city, state, postalCode, landmark }
          : null,
      customerRequest: customerRequest || null,
      images: imageUrls,
      submittedAt: new Date().toISOString(),
      source: "public_form",
    };

    // Build description markdown for staff
    const addressText =
      dropoffType === "DISPATCH" || dropoffType === "ONSITE"
        ? [
            addressLine1,
            addressLine2,
            `${city}${state ? ", " + state : ""}`,
            postalCode,
            landmark ? `Landmark: ${landmark}` : "",
          ]
            .filter(Boolean)
            .join("\n")
        : "Drop-off at service center";

    const description = `
**Customer Details:**
- Name: ${name}
- Email: ${email}
- Phone: ${phone}

**Device Information:**
- Type: ${deviceType}
- Brand: ${brand}
- Model: ${model || "Not specified"}
- serial Number: ${serialNumber}

**Problem Type:**
${problemType || "Not specified"}

**Issue Description:**
${issue}

**Service Type:**
${
  dropoffType === "DROPOFF"
    ? "Drop-off at service center"
    : dropoffType === "DISPATCH"
    ? `Dispatch pickup at:\n${addressText}`
    : `Onsite service at:\n${addressText}`
}

${
  customerRequest
    ? `\n**Customer Request (Optional):**\n${customerRequest}`
    : ""
}

${
  imageUrls.length
    ? `\n**Attached Images:**\n${imageUrls
        .map((u, i) => `![Image ${i + 1}](${u})`)
        .join("\n")}`
    : ""
}
    `;

    // Create ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        title: `Repair Request: ${brand} ${deviceType}`,
        description,
        priority: "normal",
        metadata,
      } as any,
    });

    // Store images as TicketMessage attachments for better rendering
    if (imageUrls.length) {
      await prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          userId: user.id,
          message: "Images attached with repair request.",
          attachments: imageUrls,
        },
      });
    }

    // Send confirmation emails (user + admin)
    const userHtml = buildRepairConfirmationEmail({
      name,
      email,
      phone,
      deviceType,
      brand,
      model,
      serialNumber,
      issue,
      dropoffType,
      address: {
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        landmark,
      },
      customerRequest,
      images: imageUrls,
    });

    await sendEmail({
      to: email,
      subject: "Your repair request has been received",
      html: userHtml,
      userIdForLog: user.id,
    });

    // Admin email (summarized)
    const adminHtml = `<!doctype html><html><body style=\"font-family:Arial\">\
      <h3>New Repair Request</h3>\
      <p><strong>${name}</strong> (${email} — ${phone}) submitted a request.</p>\
      <p><strong>Device:</strong> ${brand} ${deviceType}  ${
      model ? `(${model})` : ""
    } with SN:${serialNumber}</p>\
      <p><strong>Issue:</strong><br/>${issue.replace(/\n/g, "<br/>")}</p>\
      <p><strong>Service Type:</strong> ${dropoffType}</p>\
      ${
        dropoffType === "DISPATCH" || dropoffType === "ONSITE"
          ? `<p><strong>Address:</strong><br/>${addressText.replace(
              /\n/g,
              "<br/>"
            )}</p>`
          : ""
      }\
      ${
        customerRequest
          ? `<p><strong>Customer Request:</strong><br/>${customerRequest.replace(
              /\n/g,
              "<br/>"
            )}</p>`
          : ""
      }\
      <p><a href=\"${config.app.url}/admin\">View in Admin</a></p>\
    </body></html>`;

    await sendEmail({
      to: config.email.adminEmail,
      subject: `New Repair Request from ${name || email}`,
      html: adminHtml,
      skipLog: true,
    });

    // Log admin email status under an admin/system user when available
    try {
      const adminUser = await prisma.user.findUnique({
        where: { email: config.email.adminEmail },
        select: { id: true },
      });
      if (adminUser) {
        await prisma.notificationLog.create({
          data: {
            userId: adminUser.id,
            type: "email",
            subject: `New Repair Request from ${name || email}`,
            content: `Admin notification sent to ${config.email.adminEmail}`,
            status: "sent",
            sentAt: new Date(),
          },
        });
      }
    } catch (e) {
      console.error("Failed to log admin email notification:", e);
    }

    return NextResponse.json({
      success: true,
      data: { ticketId: ticket.id, images: imageUrls },
    });
  } catch (error) {
    console.error("Public repair request error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to submit repair request",
        },
      },
      { status: 500 }
    );
  }
}
