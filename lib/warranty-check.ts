export async function checkWarranty(
  brand: string,
  serialNumber?: string,
  imei?: string,
): Promise<{ status: string; provider: string; expiryDate?: string }> {
  const upperBrand = brand.toUpperCase()

  // Apple warranty check
  if (["APPLE", "IPHONE", "IPAD", "MAC"].includes(upperBrand)) {
    if (serialNumber || imei) {
      return {
        status: "requires_verification",
        provider: "apple",
      }
    }
    return { status: "unknown", provider: "apple" }
  }

  // Dell warranty check
  if (["DELL", "XPS", "INSPIRON", "VOSTRO"].includes(upperBrand)) {
    if (serialNumber) {
      return {
        status: "requires_verification",
        provider: "dell",
      }
    }
    return { status: "unknown", provider: "dell" }
  }

  // Samsung warranty check
  if (["SAMSUNG", "GALAXY", "CHROMEBOOK"].includes(upperBrand)) {
    if (imei || serialNumber) {
      return {
        status: "requires_verification",
        provider: "samsung",
      }
    }
    return { status: "unknown", provider: "samsung" }
  }

  // HP warranty check
  if (["HP", "HEWLETT"].includes(upperBrand)) {
    if (serialNumber) {
      return {
        status: "requires_verification",
        provider: "hp",
      }
    }
    return { status: "unknown", provider: "hp" }
  }

  return { status: "not_applicable", provider: "custom" }
}
