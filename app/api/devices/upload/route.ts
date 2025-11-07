import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadImage, uploadMultipleImages } from "@/lib/cloudinary";

/**
 * POST /api/devices/upload
 * Upload device images to Cloudinary
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "No images provided" },
        },
        { status: 400 }
      );
    }

    if (files.length > 10) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Maximum 10 images allowed",
          },
        },
        { status: 400 }
      );
    }

    // Convert files to base64 data URIs
    const imageDataPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      return `data:${file.type};base64,${base64}`;
    });

    const imageDataURIs = await Promise.all(imageDataPromises);

    // Upload to Cloudinary
    const uploadResults = await uploadMultipleImages(imageDataURIs, {
      folder: `servixing/devices/${user.id}`,
      tags: [`user:${user.id}`, "device"],
    });

    const imageUrls = uploadResults.map((result) => result.secure_url);

    return NextResponse.json({
      success: true,
      data: { urls: imageUrls },
    });
  } catch (error) {
    console.error("Image upload error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPLOAD_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to upload images",
        },
      },
      { status: 500 }
    );
  }
}
