import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  url: string;
  folder?: string;
}

/**
 * Upload image to Cloudinary
 * @param file - File path or base64 data URI
 * @param options - Upload options
 * @returns Upload result
 */
export async function uploadImage(
  file: string,
  options?: {
    folder?: string;
    public_id?: string;
    transformation?: any[];
    tags?: string[];
  }
): Promise<CloudinaryUploadResult> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder:
        options?.folder ||
        process.env.CLOUDINARY_UPLOAD_FOLDER ||
        "servixing/devices",
      public_id: options?.public_id,
      transformation: options?.transformation,
      tags: options?.tags,
      resource_type: "image",
    });

    return result as CloudinaryUploadResult;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of file paths or base64 data URIs
 * @param options - Upload options
 * @returns Array of upload results
 */
export async function uploadMultipleImages(
  files: string[],
  options?: {
    folder?: string;
    tags?: string[];
  }
): Promise<CloudinaryUploadResult[]> {
  try {
    const uploadPromises = files.map((file) =>
      uploadImage(file, {
        folder: options?.folder,
        tags: options?.tags,
      })
    );

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Cloudinary multiple upload error:", error);
    throw new Error("Failed to upload images to Cloudinary");
  }
}

/**
 * Delete image from Cloudinary
 * @param publicId - Public ID of the image to delete
 * @returns Deletion result
 */
export async function deleteImage(
  publicId: string
): Promise<{ result: string }> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete image from Cloudinary");
  }
}

/**
 * Delete multiple images from Cloudinary
 * @param publicIds - Array of public IDs to delete
 * @returns Deletion results
 */
export async function deleteMultipleImages(
  publicIds: string[]
): Promise<{ deleted: Record<string, string> }> {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error("Cloudinary multiple delete error:", error);
    throw new Error("Failed to delete images from Cloudinary");
  }
}

/**
 * Get optimized image URL
 * @param publicId - Public ID of the image
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "scale" | "crop" | "thumb";
    quality?: "auto" | number;
    format?: "auto" | "webp" | "jpg" | "png";
  }
): string {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width: options?.width,
        height: options?.height,
        crop: options?.crop || "fill",
        quality: options?.quality || "auto",
        fetch_format: options?.format || "auto",
      },
    ],
    secure: true,
  });
}

/**
 * Generate upload signature for client-side uploads
 * @param params - Upload parameters
 * @returns Signature and timestamp
 */
export function generateUploadSignature(params: {
  folder?: string;
  public_id?: string;
  tags?: string[];
}) {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder:
        params.folder ||
        process.env.CLOUDINARY_UPLOAD_FOLDER ||
        "servixing/devices",
      public_id: params.public_id,
      tags: params.tags?.join(","),
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  };
}

export { cloudinary };
