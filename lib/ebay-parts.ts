export interface PartResult {
  id: string;
  title: string;
  price: number;
  condition: string;
  imageUrl: string;
  seller: string;
  ebayUrl: string;
}

export type SortOption = "best_match" | "price_asc" | "price_desc";
export type ConditionOption =
  | "any"
  | "new"
  | "used"
  | "refurbished"
  | "for_parts";

export interface SearchOptions {
  page?: number;
  perPage?: number;
  sort?: SortOption;
  condition?: ConditionOption;
  minPrice?: number;
  maxPrice?: number;
}

export interface PartSearchResponse {
  items: PartResult[];
  total: number;
  page: number;
  perPage: number;
}

// Tiny helper to safely read nested fields from the eBay response
function get<T = any>(obj: any, path: Array<string | number>, fallback: T): T {
  try {
    let cur = obj;
    for (const key of path) cur = cur?.[key];
    return cur ?? fallback;
  } catch {
    return fallback;
  }
}

function brandToCategoryId(brand: string): string | undefined {
  const phoneBrands = [
    "Apple",
    "Samsung",
    "Google",
    "OnePlus",
    "Xiaomi",
    "Huawei",
    "Sony",
    "LG",
  ];
  const laptopBrands = ["Dell", "HP", "Lenovo", "Asus", "Acer", "Microsoft"];

  // eBay categories (approx):
  // Cell Phone Parts & Accessories: 43304, Laptop Replacement Parts: 18200
  if (phoneBrands.includes(brand)) return "43304";
  if (laptopBrands.includes(brand)) return "18200";
  return undefined;
}

export async function searchParts(
  query: string,
  brand: string,
  options: SearchOptions = {}
): Promise<PartSearchResponse> {
  // Use either EBAY_APP_ID (preferred) or EBAY_API_KEY
  const appId = process.env.EBAY_APP_ID || process.env.EBAY_API_KEY;

  if (!appId) {
    console.log(
      "eBay API key/app id not configured (EBAY_APP_ID or EBAY_API_KEY)"
    );
    return { items: [], total: 0, page: 1, perPage: 24 };
  }

  const environment = process.env.EBAY_ENVIRONMENT || "PRODUCTION";
  const baseUrl =
    environment === "SANDBOX"
      ? "https://svcs.sandbox.ebay.com"
      : "https://svcs.ebay.com";

  // Build keywords by combining brand and query for better relevance
  const keywords = `${brand} ${query}`.trim();
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(50, Math.max(1, options.perPage ?? 24));
  const sort = options.sort ?? "best_match";
  const categoryId = brandToCategoryId(brand);

  const params = new URLSearchParams({
    "OPERATION-NAME": "findItemsByKeywords",
    "SERVICE-VERSION": "1.0.0",
    "SECURITY-APPNAME": appId,
    "RESPONSE-DATA-FORMAT": "JSON",
    "REST-PAYLOAD": "true",
    keywords,
    "paginationInput.entriesPerPage": String(perPage),
    "paginationInput.pageNumber": String(page),
    outputSelector: "SellerInfo",
  });

  if (categoryId) params.set("categoryId", categoryId);

  // Sorting mapping
  const sortMap: Record<SortOption, string> = {
    best_match: "BestMatch",
    price_asc: "PricePlusShippingLowest",
    price_desc: "PricePlusShippingHighest",
  };
  params.set("sortOrder", sortMap[sort] ?? "BestMatch");

  // Item filters
  let filterIdx = 0;
  const addFilter = (name: string, value: string | string[]) => {
    params.set(`itemFilter(${filterIdx}).name`, name);
    if (Array.isArray(value)) {
      value.forEach((v, j) =>
        params.set(`itemFilter(${filterIdx}).value(${j})`, String(v))
      );
    } else {
      params.set(`itemFilter(${filterIdx}).value`, String(value));
    }
    filterIdx += 1;
  };

  // Condition mapping to eBay condition IDs
  const cond = (options.condition ?? "any").toLowerCase() as ConditionOption;
  const conditionMap: Record<Exclude<ConditionOption, "any">, string[]> = {
    new: ["1000"],
    used: ["3000"],
    refurbished: ["2000", "2500"],
    for_parts: ["7000"],
  };
  if (cond !== "any") addFilter("Condition", conditionMap[cond]);

  if (typeof options.minPrice === "number")
    addFilter("MinPrice", String(options.minPrice));
  if (typeof options.maxPrice === "number")
    addFilter("MaxPrice", String(options.maxPrice));

  const endpoint = `${baseUrl}/services/search/FindingService/v1?${params.toString()}`;

  try {
    const res = await fetch(endpoint, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`eBay API HTTP ${res.status}`);

    const json = await res.json();
    const items: any[] = get(
      json,
      ["findItemsByKeywordsResponse", 0, "searchResult", 0, "item"],
      []
    );
    const totalStr = get<string>(
      json,
      [
        "findItemsByKeywordsResponse",
        0,
        "paginationOutput",
        0,
        "totalEntries",
        0,
      ],
      "0"
    );
    const total = Number.parseInt(totalStr || "0", 10) || 0;

    const results: PartResult[] = items
      .map((it: any) => {
        const id = get<string>(it, ["itemId", 0], "");
        const title = get<string>(it, ["title", 0], "");
        const priceStr = get<string>(
          it,
          ["sellingStatus", 0, "currentPrice", 0, "__value__"],
          "0"
        );
        const price = Number.parseFloat(priceStr || "0");
        const condition = get<string>(
          it,
          ["condition", 0, "conditionDisplayName", 0],
          "Unknown"
        );
        const imageUrl =
          get<string>(it, ["galleryURL", 0], "") ||
          get<string>(it, ["galleryPlusPictureURL", 0], "");
        const seller = get<string>(
          it,
          ["sellerInfo", 0, "sellerUserName", 0],
          ""
        );
        const ebayUrl = get<string>(it, ["viewItemURL", 0], "");

        return { id, title, price, condition, imageUrl, seller, ebayUrl };
      })
      .filter((r: PartResult) => r.id && r.title && r.ebayUrl);

    return { items: results, total, page, perPage };
  } catch (error) {
    console.error("eBay search error:", error);
    return { items: [], total: 0, page, perPage };
  }
}
