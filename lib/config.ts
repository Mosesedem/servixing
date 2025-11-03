/**
 * Application Configuration
 * Centralized configuration for the Servixing repair shop management system
 */

export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "Servixing",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    env: process.env.NODE_ENV || "development",
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB default
    maxFilesPerUpload: parseInt(process.env.MAX_FILES_PER_UPLOAD || "5"),
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowedDocumentTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },

  // Business rules
  business: {
    defaultDispatchFee: parseFloat(process.env.DEFAULT_DISPATCH_FEE || "2000"),
    warrantyCheckFee: parseFloat(process.env.WARRANTY_CHECK_FEE || "1000"),
    defaultCurrency: process.env.DEFAULT_CURRENCY || "NGN",
  },

  // Rate limiting
  rateLimit: {
    requestsPerWindow: parseInt(
      process.env.RATE_LIMIT_REQUESTS_PER_WINDOW || "10"
    ),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"), // 1 minute default
  },

  // Feature flags
  features: {
    warrantyCheck: process.env.ENABLE_WARRANTY_CHECK === "true",
    partsSearch: process.env.ENABLE_PARTS_SEARCH === "true",
    payment: process.env.ENABLE_PAYMENT === "true",
    emailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === "true",
  },

  // External service URLs
  services: {
    paystack: {
      baseUrl: "https://api.paystack.co",
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      secretKey: process.env.PAYSTACK_SECRET_KEY,
      webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      uploadFolder: process.env.CLOUDINARY_UPLOAD_FOLDER || "servixing/devices",
    },
    ebay: {
      appId: process.env.EBAY_APP_ID,
      certId: process.env.EBAY_CERT_ID,
      environment: process.env.EBAY_ENVIRONMENT || "SANDBOX",
    },
    redis: {
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    },
  },

  // Email configuration
  email: {
    from: process.env.EMAIL_FROM || "noreply@servixing.com",
    fromName: process.env.EMAIL_FROM_NAME || "Servixing Support",
    adminEmail: process.env.ADMIN_EMAIL || "admin@servixing.com",
    skipInDev: process.env.SKIP_EMAIL_IN_DEV === "true",
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    debug: process.env.DEBUG === "true",
  },

  // Security
  security: {
    corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || "")
      .split(",")
      .filter(Boolean),
    adminApiKey: process.env.ADMIN_API_KEY,
  },

  // Cache TTLs (in seconds)
  cache: {
    warrantyCheck: 24 * 60 * 60, // 24 hours
    partsSearch: 60 * 60, // 1 hour
    userProfile: 5 * 60, // 5 minutes
    ebayToken: 2 * 60 * 60, // 2 hours
  },

  // Pagination defaults
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },

  // Work order statuses
  workOrderStatuses: [
    "CREATED",
    "ACCEPTED",
    "IN_REPAIR",
    "AWAITING_PARTS",
    "READY_FOR_PICKUP",
    "COMPLETED",
    "CANCELLED",
  ] as const,

  // User roles
  userRoles: ["CUSTOMER", "TECHNICIAN", "ADMIN", "SUPER_ADMIN"] as const,

  // Support ticket priorities
  ticketPriorities: ["low", "normal", "high", "urgent"] as const,

  // Device types
  deviceTypes: [
    "laptop",
    "phone",
    "tablet",
    "desktop",
    "watch",
    "other",
  ] as const,

  // Popular brands
  brands: {
    laptop: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Microsoft", "Acer"],
    phone: ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Oppo", "Tecno"],
    tablet: ["Apple", "Samsung", "Microsoft", "Amazon", "Lenovo"],
    watch: ["Apple", "Samsung", "Fitbit", "Garmin", "Huawei"],
  },
} as const;

// Helper functions
export function isDevelopment(): boolean {
  return config.app.env === "development";
}

export function isProduction(): boolean {
  return config.app.env === "production";
}

export function isTest(): boolean {
  return config.app.env === "test";
}

export function getApiUrl(path: string): string {
  return `${config.app.url}/api${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatCurrency(
  amount: number,
  currency: string = config.business.defaultCurrency
): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export default config;
