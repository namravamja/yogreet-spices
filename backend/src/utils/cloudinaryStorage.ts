import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

interface CloudinaryStorageOptions {
  cloudinary: typeof cloudinary;
  params?: (req: any, file: Express.Multer.File) => Promise<any> | any;
}

/**
 * Custom Cloudinary Storage Engine for multer
 * Compatible with cloudinary v2
 */
export class CloudinaryStorage implements multer.StorageEngine {
  private cloudinary: typeof cloudinary;
  private params: (req: any, file: Express.Multer.File) => Promise<any> | any;

  constructor(options: CloudinaryStorageOptions) {
    this.cloudinary = options.cloudinary;
    this.params = options.params || (() => ({}));
  }

  _handleFile(
    req: any,
    file: Express.Multer.File,
    callback: (error?: any, info?: Partial<Express.Multer.File>) => void
  ): void {
    // Get upload parameters
    const paramsPromise = Promise.resolve(this.params(req, file));

    paramsPromise
      .then((params) => {
        // Convert buffer to stream for cloudinary upload
        const bufferStream = new Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null); // End the stream

        // Upload to cloudinary using upload_stream
        const uploadStream = this.cloudinary.uploader.upload_stream(
          params,
          (error: any, result: any) => {
            if (error) {
              callback(error);
            } else {
              callback(null, {
                filename: result.public_id,
                path: result.secure_url,
                size: result.bytes,
                mimetype: file.mimetype,
                fieldname: file.fieldname,
                originalname: file.originalname,
                encoding: file.encoding,
              });
            }
          }
        );

        // Pipe the buffer stream to cloudinary upload stream
        bufferStream.pipe(uploadStream);
      })
      .catch((error) => {
        callback(error);
      });
  }

  _removeFile(
    req: any,
    file: Express.Multer.File,
    callback: (error: Error | null) => void
  ): void {
    // Extract public_id from file path or filename
    let publicId: string | undefined;
    
    if (file.path) {
      // Extract public_id from cloudinary URL
      // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
      const urlParts = file.path.split("/upload/");
      if (urlParts.length > 1) {
        const pathAfterUpload = urlParts[1];
        // Remove version if present (v1234567890/)
        const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, "");
        // Get public_id (everything before the last dot)
        publicId = pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf("."));
      }
    } else if (file.filename) {
      publicId = file.filename;
    }
    
    if (publicId) {
      this.cloudinary.uploader.destroy(publicId, (error: any) => {
        callback(error || null);
      });
    } else {
      callback(null);
    }
  }
}

