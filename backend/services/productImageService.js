import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { uploadsDirectory } from "../config/paths.js";

const uploadDirectory = path.join(uploadsDirectory, "products");
const maxImages = 4;
const maxImageBytes = 5 * 1024 * 1024;
const maxTotalImageBytes = 10 * 1024 * 1024;
const mimeExtensions = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export class ProductImageValidationError extends Error {}

function detectImageMimeType(buffer) {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

function decodeImages(imageGallery) {
  if (!Array.isArray(imageGallery) || imageGallery.length < 1 || imageGallery.length > maxImages) {
    throw new ProductImageValidationError("بین ۱ تا ۴ تصویر برای محصول انتخاب کنید.");
  }

  let totalBytes = 0;

  return imageGallery.map((image, index) => {
    if (!image || typeof image !== "object") {
      throw new ProductImageValidationError("اطلاعات یکی از تصاویر معتبر نیست.");
    }

    const label = typeof image.label === "string" ? image.label.trim() : "";
    const match =
      typeof image.dataUrl === "string" &&
      image.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/);

    if (!label || label.length > 120 || !match) {
      throw new ProductImageValidationError("نوع یا عنوان یکی از تصاویر معتبر نیست.");
    }

    const [, declaredMimeType, encoded] = match;
    const buffer = Buffer.from(encoded, "base64");

    if (
      buffer.length === 0 ||
      buffer.length > maxImageBytes ||
      buffer.toString("base64") !== encoded ||
      detectImageMimeType(buffer) !== declaredMimeType
    ) {
      throw new ProductImageValidationError(
        "هر تصویر باید JPEG، PNG یا WebP معتبر و حداکثر ۵ مگابایت باشد.",
      );
    }

    totalBytes += buffer.length;
    if (totalBytes > maxTotalImageBytes) {
      throw new ProductImageValidationError("حجم کل تصاویر نمی‌تواند بیشتر از ۱۰ مگابایت باشد.");
    }

    return {
      buffer,
      extension: mimeExtensions.get(declaredMimeType),
      label,
      imageId: index + 1,
    };
  });
}

export async function saveProductImages(imageGallery) {
  const decodedImages = decodeImages(imageGallery);
  const savedFiles = [];

  await fs.mkdir(uploadDirectory, { recursive: true });

  try {
    const savedImages = [];

    for (const image of decodedImages) {
      const filename = `${randomUUID()}.${image.extension}`;
      const filePath = path.join(uploadDirectory, filename);
      await fs.writeFile(filePath, image.buffer, { flag: "wx" });
      savedFiles.push(filePath);
      savedImages.push({
        id: image.imageId,
        label: image.label,
        src: `/uploads/products/${filename}`,
      });
    }

    return { imageGallery: savedImages, filePaths: savedFiles };
  } catch (error) {
    await removeProductImages(savedFiles);
    throw error;
  }
}

export async function removeProductImages(filePaths) {
  await Promise.allSettled(filePaths.map((filePath) => fs.unlink(filePath)));
}
