import { v2 as cloudinary } from "cloudinary";
import AppError from "../error/AppError.js";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    "CRITICAL CONFIGURATION ERROR: Cloudinary credentials are missing from the environment variables.",
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export const uploadBuffer = (
  buffer: Buffer,
  options: { folder: string; resource_type?: "image" | "raw" | "auto" },
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resource_type || "auto",
      },
      (error, result) => {
        if (error || !result) {
          return reject(
            new AppError(`Cloudinary upload failed: ${error?.message}`, 502),
          );
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
};

export const deleteFile = async (
  publicId: string,
  resourceType: "image" | "raw" = "image",
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error(`Failed to delete Cloudinary file ${publicId}:`, error);
  }
};