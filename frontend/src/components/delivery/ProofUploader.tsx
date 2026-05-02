"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProofUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  eventType: "pickup" | "delivery";
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
}

const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export function ProofUploader({
  onUpload,
  eventType,
  maxFiles = 5,
  maxSizeMB = 10,
  className,
}: ProofUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_FORMATS.includes(file.type)) {
      return `${file.name}: Invalid format. Only JPEG, PNG, and WebP are allowed.`;
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return `${file.name}: File too large. Maximum size is ${maxSizeMB}MB.`;
    }

    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newErrors: string[] = [];
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    // Check total file count
    if (selectedFiles.length + files.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed.`);
      setErrors(newErrors);
      return;
    }

    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === validFiles.length) {
            setPreviews((prev) => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    setErrors(newErrors);
    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setErrors([]);

    try {
      await onUpload(selectedFiles);
      // Clear files after successful upload
      setSelectedFiles([]);
      setPreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : "Upload failed. Please try again.",
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging
            ? "border-yogreet-sage bg-yogreet-sage/5"
            : "border-stone-300 hover:border-stone-400",
          selectedFiles.length > 0 && "bg-stone-50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_EXTENSIONS.join(",")}
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-yogreet-sage/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-yogreet-sage" />
          </div>

          <div>
            <p className="text-sm font-manrope font-medium text-yogreet-charcoal mb-1">
              Upload {eventType === "pickup" ? "Pickup" : "Delivery"} Proof
            </p>
            <p className="text-xs text-stone-500 font-inter">
              Drag and drop or{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-yogreet-sage hover:text-yogreet-sage/80 font-medium"
                disabled={isUploading}
              >
                browse files
              </button>
            </p>
          </div>

          <p className="text-xs text-stone-400 font-inter">
            JPEG, PNG, WebP • Max {maxSizeMB}MB • Up to {maxFiles} files
          </p>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              {errors.map((error, index) => (
                <p key={index} className="text-xs text-red-600 font-inter">
                  {error}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div>
          <p className="text-sm font-manrope font-medium text-yogreet-charcoal mb-3">
            Selected Images ({selectedFiles.length}/{maxFiles})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {previews.map((preview, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-lg overflow-hidden border border-stone-200"
              >
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs text-white font-inter truncate">
                    {selectedFiles[index].name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          className={cn(
            "w-full py-3 px-4 rounded-lg font-manrope font-medium transition-colors",
            "bg-yogreet-sage text-white hover:bg-yogreet-sage/90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center gap-2"
          )}
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload {selectedFiles.length} {selectedFiles.length === 1 ? "Image" : "Images"}
            </>
          )}
        </button>
      )}
    </div>
  );
}
