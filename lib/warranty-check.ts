import { env } from "@/lib/env";

export async function checkWarranty(
  brand: string,
  serialNumber?: string,
  imei?: string
): Promise<{
  status: string;
  provider: string;
  expiryDate?: string;
  deviceStatus?: string;
}> {
  const upperBrand = brand.toUpperCase();

  // Check device status via IMEI if provided
  let deviceStatus = "unknown";
  if (imei && env.GSMA_API_KEY) {
    try {
      const gsmaResponse = await fetch(
        `https://api.gsma.com/imei-check/v1/imei/${imei}`,
        {
          headers: {
            Authorization: `Bearer ${env.GSMA_API_KEY}`,
          },
        }
      );
      if (gsmaResponse.ok) {
        const gsmaData = await gsmaResponse.json();
        deviceStatus = gsmaData.status === "white" ? "clean" : "blacklisted";
      }
    } catch (error) {
      console.error("GSMA API error:", error);
    }
  }

  // Apple warranty check
  if (["APPLE", "IPHONE", "IPAD", "MAC"].includes(upperBrand)) {
    if (serialNumber) {
      if (env.WARRANTY_API_KEY) {
        try {
          const response = await fetch(
            "https://api.warrantyapi.com/v1/warranty",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                key: env.WARRANTY_API_KEY,
                serial: serialNumber,
                brand: "apple",
              }),
            }
          );
          if (response.ok) {
            const data = await response.json();
            return {
              status: data.warranty?.status || "unknown",
              provider: "apple",
              expiryDate: data.warranty?.expiry,
              deviceStatus,
            };
          }
        } catch (error) {
          console.error("WarrantyAPI error:", error);
        }
      }
      // Fallback to requires_verification
      return {
        status: "requires_verification",
        provider: "apple",
        deviceStatus,
      };
    }
    return { status: "unknown", provider: "apple", deviceStatus };
  }

  // Dell warranty check
  if (["DELL", "XPS", "INSPIRON", "VOSTRO"].includes(upperBrand)) {
    if (serialNumber) {
      if (env.DELL_API_KEY) {
        try {
          const response = await fetch(
            `https://api.dell.com/support/v2/assetinfo/warranty/tags.json?svctags=${serialNumber}&apikey=${env.DELL_API_KEY}`
          );
          if (response.ok) {
            const data = await response.json();
            // Parse Dell API response
            const warranty = data[0]?.warranties?.[0];
            const status = warranty
              ? new Date(warranty.endDate) > new Date()
                ? "active"
                : "expired"
              : "unknown";
            return {
              status,
              provider: "dell",
              expiryDate: warranty?.endDate,
              deviceStatus,
            };
          }
        } catch (error) {
          console.error("Dell API error:", error);
        }
      }
      // Fallback
      return {
        status: "requires_verification",
        provider: "dell",
        deviceStatus,
      };
    }
    return { status: "unknown", provider: "dell", deviceStatus };
  }

  // Samsung warranty check
  if (["SAMSUNG", "GALAXY", "CHROMEBOOK"].includes(upperBrand)) {
    if (imei || serialNumber) {
      return {
        status: "requires_verification",
        provider: "samsung",
        deviceStatus,
      };
    }
    return { status: "unknown", provider: "samsung", deviceStatus };
  }

  // HP warranty check
  if (["HP", "HEWLETT"].includes(upperBrand)) {
    if (serialNumber) {
      return {
        status: "requires_verification",
        provider: "hp",
        deviceStatus,
      };
    }
    return { status: "unknown", provider: "hp", deviceStatus };
  }

  return { status: "not_applicable", provider: "custom", deviceStatus };
}
