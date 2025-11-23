import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary, { isCloudinaryConfigured } from "../utils/cloudinary";

// Check if Cloudinary is configured using the utility function
const cloudinaryReady = isCloudinaryConfigured();

// Only create CloudinaryStorage if Cloudinary is configured
// Otherwise use memory storage (files will need to be manually handled)
let storage: multer.StorageEngine;
try {
  if (cloudinaryReady) {
    storage = new CloudinaryStorage({
      cloudinary,
      params: async (req, file) => {
        const fileField = file.fieldname;
        // Determine folder based on the route or user role
        const userRole = (req as any).user?.role || "sellers";
        const folder = userRole === "BUYER" ? `yogreet/buyers` : `yogreet/sellers`;
        return {
          folder: folder,
          resource_type: "image",
          allowed_formats: [
            "jpg",
            "jpeg",
            "png",
            "gif",
            "bmp",
            "webp",
            "svg",
            "tiff",
            "tif",
            "ico",
            "avif",
            "heic",
            "heif",
            "raw",
            "cr2",
            "nef",
            "orf",
            "sr2",
          ],
          transformation: [
            {
              width: 1200,
              height: 1200,
              crop: "limit",
              quality: "auto:good",
              format: "auto",
            },
          ],
          public_id: `${fileField}-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 15)}`,
        };
      },
    });
  } else {
    storage = multer.memoryStorage();
  }
} catch (error: any) {
  console.error('❌ Failed to initialize CloudinaryStorage:', error?.message || error);
  console.warn('⚠️  Falling back to memory storage. File uploads will be stored in memory.');
  storage = multer.memoryStorage();
}

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "image/svg+xml",
    "image/tiff",
    "image/x-icon",
    "image/vnd.microsoft.icon",
    "image/avif",
    "image/heic",
    "image/heif",
    "image/x-canon-cr2",
    "image/x-canon-crw",
    "image/x-nikon-nef",
    "image/x-sony-arw",
    "image/x-adobe-dng",
    "image/x-panasonic-raw",
    "image/x-olympus-orf",
    "image/x-fuji-raf",
    "image/x-kodak-dcr",
    "image/x-sigma-x3f",
  ];

  if (
    allowedMimeTypes.includes(file.mimetype) ||
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file format: ${file.mimetype}. Please upload an image file.`
      )
    );
  }
};

const multerConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 20,
  },
};

export const uploadSingle = multer(multerConfig);

export const uploadSellerImages = multer(multerConfig).fields([
  { name: "businessLogo", maxCount: 1 },
]);

export const uploadDocuments = multer(multerConfig).fields([
  { name: "gstCertificate", maxCount: 1 },
  { name: "panCard", maxCount: 1 },
  { name: "businessLicense", maxCount: 1 },
  { name: "canceledCheque", maxCount: 1 },
]);

export const uploadSellerVerificationDocuments = multer(multerConfig).fields([
  { name: "incorporationCertificate", maxCount: 1 },
  { name: "msmeUdyamCertificate", maxCount: 1 },
  { name: "businessAddressProof", maxCount: 1 },
  { name: "ownerIdDocument", maxCount: 1 },
  { name: "iecCertificate", maxCount: 1 },
  { name: "apedaCertificate", maxCount: 1 },
  { name: "spicesBoardCertificate", maxCount: 1 },
  { name: "tradeLicense", maxCount: 1 },
  { name: "bankProofDocument", maxCount: 1 },
  { name: "fssaiCertificate", maxCount: 1 },
]);

export const uploadProductImages = multer({
  ...multerConfig,
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 15,
  },
}).array("productImages", 15);

export const uploadFlexibleImages = (
  fieldConfigs: Array<{ name: string; maxCount: number }>
) => {
  return multer(multerConfig).fields(fieldConfigs);
};

export const uploadMultipleImages = (
  fieldName: string,
  maxCount: number = 10
) => {
  return multer({
    ...multerConfig,
    limits: {
      fileSize: 12 * 1024 * 1024,
      files: maxCount,
    },
  }).array(fieldName, maxCount);
};

export const isValidImageExtension = (filename: string): boolean => {
  const validExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".svg",
    ".tiff",
    ".tif",
    ".ico",
    ".avif",
    ".heic",
    ".heif",
    ".cr2",
    ".nef",
    ".orf",
    ".sr2",
    ".arw",
    ".dng",
    ".raf",
  ];

  const fileExtension = filename
    .toLowerCase()
    .substring(filename.lastIndexOf("."));
  return validExtensions.includes(fileExtension);
};

export const handleMulterError = (
  error: any,
  req: any,
  res: any,
  next: any
) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum size allowed is 15MB.",
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Too many files. Maximum files allowed exceeded.",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: "Unexpected file field. Please check the field name.",
        });
      default:
        return res.status(400).json({
          success: false,
          message: `Upload error: ${error.message}`,
        });
    }
  }

  if (error.message.includes("Unsupported file format")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
};

