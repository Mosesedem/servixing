import { Resend } from "resend";
import { prisma } from "./db";
import config from "./config";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  userIdForLog?: string;
  skipLog?: boolean;
}) {
  const toArray = Array.isArray(options.to) ? options.to : [options.to];

  if (config.email.skipInDev && config.app.env === "development") {
    console.log("[DEV] Skipping email send:", {
      to: toArray,
      subject: options.subject,
    });
  } else if (!resend) {
    console.warn("Resend API key not configured; skipping email send.");
  } else {
    try {
      const { error } = await resend.emails.send({
        from: `${config.email.fromName} <${config.email.from}>`,
        to: toArray,
        subject: options.subject,
        html: options.html,
      });
      if (error) {
        console.error("Resend email error:", error);
      }
    } catch (err) {
      console.error("Resend send error:", err);
    }
  }

  if (!options.skipLog && options.userIdForLog) {
    try {
      await prisma.notificationLog.create({
        data: {
          userId: options.userIdForLog,
          type: "email",
          subject: options.subject,
          content: "Email sent",
          status: "sent",
          sentAt: new Date(),
        },
      });
    } catch (err) {
      console.error("Failed to log email notification:", err);
    }
  }
}

export function buildRepairConfirmationEmail(params: {
  name: string;
  email: string;
  phone: string;
  deviceType: string;
  brand: string;
  model?: string;
  serialNumber: string;
  issue: string;
  dropoffType: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    landmark?: string;
  };
  customerRequest?: string;
  images?: string[];
}) {
  const addressHtml =
    params.dropoffType === "DISPATCH"
      ? `<div style=\"margin-top:10px\"><strong>Pickup Address</strong><br/>${[
          params.address?.addressLine1,
          params.address?.addressLine2,
          [params.address?.city, params.address?.state]
            .filter(Boolean)
            .join(", "),
          params.address?.postalCode,
          params.address?.landmark
            ? `Landmark: ${params.address?.landmark}`
            : "",
        ]
          .filter(Boolean)
          .join("<br/>")}</div>`
      : `<div style=\"margin-top:10px\"><strong>Service Type:</strong> Drop-off at service center</div>`;

  const imagesHtml = (params.images || [])
    .slice(0, 3)
    .map(
      (url, i) =>
        `<div style=\"margin-right:8px;margin-bottom:8px;display:inline-block\"><img src=\"${url}\" alt=\"image ${
          i + 1
        }\" style=\"width:140px;height:140px;object-fit:cover;border-radius:8px;border:1px solid #eee\"/></div>`
    )
    .join("");

  const customerReqHtml = params.customerRequest
    ? `<div style=\"margin-top:10px\"><strong>Additional Request</strong><br/>${params.customerRequest}</div>`
    : "";

  return `<!doctype html>
<html>
  <head>
    <meta charSet=\"utf-8\" />
    <title>Repair Request Confirmation</title>
  </head>
  <body style=\"font-family:Arial, sans-serif; color:#111;\">
    <div style=\"max-width:640px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px\">
      <h2 style=\"margin-top:0;color:#111\">Repair Request Received</h2>
      <p>Hi ${params.name || "there"},</p>
      <p>Thanks for choosing ${
        config.app.name
      }. We've received your repair request. Our team will contact you shortly with details and pricing.</p>

      <div style=\"background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px\">
        <div><strong>Contact</strong><br/>${params.name} — ${
    params.phone
  }<br/>${params.email}</div>
        <div style=\"margin-top:10px\"><strong>Device</strong><br/>${
          params.brand
        } ${params.deviceType} ${
    params.model ? `(${params.model})` : ""
  } with SN: ${params.serialNumber}</div>
        <div style=\"margin-top:10px\"><strong>Issue Description</strong><br/>${params.issue.replace(
          /\n/g,
          "<br/>"
        )}</div>
        ${addressHtml}
        ${customerReqHtml}
      </div>

      ${imagesHtml ? `<div style=\"margin-top:16px\">${imagesHtml}</div>` : ""}

      <p style=\"margin-top:16px;color:#555\">You'll receive an update within 2 hours.</p>
      <p style=\"color:#888;font-size:12px\">This is an automated email from ${
        config.app.name
      }. Please do not reply.</p>
    </div>
  </body>
</html>`;
}

export function buildPartsRequestConfirmationEmail(params: {
  name: string;
  email: string;
  phone: string;
  deviceType: string;
  brand: string;
  model?: string;
  serialNumber: string;
  partName: string;
  quantity: number;
  deliveryType: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    landmark?: string;
  };
  customerRequest?: string;
  images?: string[];
}) {
  const addressHtml =
    params.deliveryType === "DELIVERY"
      ? `<div style=\"margin-top:10px\"><strong>Delivery Address</strong><br/>${[
          params.address?.addressLine1,
          params.address?.addressLine2,
          [params.address?.city, params.address?.state]
            .filter(Boolean)
            .join(", "),
          params.address?.postalCode,
          params.address?.landmark
            ? `Landmark: ${params.address?.landmark}`
            : "",
        ]
          .filter(Boolean)
          .join("<br/>")}</div>`
      : `<div style=\"margin-top:10px\"><strong>Delivery Method:</strong> Pickup at service center</div>`;

  const imagesHtml = (params.images || [])
    .slice(0, 3)
    .map(
      (url, i) =>
        `<div style=\"margin-right:8px;margin-bottom:8px;display:inline-block\"><img src=\"${url}\" alt=\"image ${
          i + 1
        }\" style=\"width:140px;height:140px;object-fit:cover;border-radius:8px;border:1px solid #eee\"/></div>`
    )
    .join("");

  const customerReqHtml = params.customerRequest
    ? `<div style=\"margin-top:10px\"><strong>Customer Request</strong><br/>${params.customerRequest}</div>`
    : "";

  return `<!doctype html>
<html>
  <head>
    <meta charSet=\"utf-8\" />
    <title>Parts Request Confirmation</title>
  </head>
  <body style=\"font-family:Arial, sans-serif; color:#111;\">
    <div style=\"max-width:640px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px\">
      <h2 style=\"margin-top:0;color:#111\">Parts Request Received</h2>
      <p>Hi ${params.name || "there"},</p>
      <p>Thanks for choosing ${
        config.app.name
      }. We've received your parts request. Our team will contact you shortly with details and pricing.</p>

      <div style=\"background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px\">
        <div><strong>Contact</strong><br/>${params.name} — ${
    params.phone
  }<br/>${params.email}</div>
        <div style=\"margin-top:10px\"><strong>Device</strong><br/>${
          params.brand
        } ${params.deviceType} ${
    params.model ? `(${params.model})` : ""
  } with SN: ${params.serialNumber}</div>
        <div style=\"margin-top:10px\"><strong>Part Requested</strong><br/>${
          params.partName
        } (Quantity: ${params.quantity})</div>
        ${addressHtml}
        ${customerReqHtml}
      </div>

      ${imagesHtml ? `<div style=\"margin-top:16px\">${imagesHtml}</div>` : ""}

      <p style=\"margin-top:16px;color:#555\">You'll receive an update within 2 hours.</p>
      <p style=\"color:#888;font-size:12px\">This is an automated email from ${
        config.app.name
      }. Please do not reply.</p>
    </div>
  </body>
</html>`;
}
