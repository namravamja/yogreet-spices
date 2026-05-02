"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProofUploader } from "./ProofUploader";

export type IssueType =
  | "address_not_found"
  | "recipient_unavailable"
  | "refused_delivery"
  | "damaged_package"
  | "incorrect_address"
  | "weather_delay"
  | "vehicle_breakdown"
  | "customs_hold"
  | "other";

interface IssueModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: IssueType;
    description: string;
    images?: File[];
  }) => Promise<void>;
  className?: string;
}

const issueTypes: { value: IssueType; label: string; description: string }[] = [
  {
    value: "address_not_found",
    label: "Address Not Found",
    description: "Unable to locate the delivery address",
  },
  {
    value: "recipient_unavailable",
    label: "Recipient Unavailable",
    description: "Recipient not available to receive package",
  },
  {
    value: "refused_delivery",
    label: "Refused Delivery",
    description: "Recipient refused to accept the package",
  },
  {
    value: "damaged_package",
    label: "Damaged Package",
    description: "Package was damaged during transit",
  },
  {
    value: "incorrect_address",
    label: "Incorrect Address",
    description: "Address provided is incorrect or incomplete",
  },
  {
    value: "weather_delay",
    label: "Weather Delay",
    description: "Delivery delayed due to weather conditions",
  },
  {
    value: "vehicle_breakdown",
    label: "Vehicle Breakdown",
    description: "Delivery vehicle experienced mechanical issues",
  },
  {
    value: "customs_hold",
    label: "Customs Hold",
    description: "Package held by customs for inspection",
  },
  {
    value: "other",
    label: "Other",
    description: "Other delivery issue",
  },
];

export function IssueModal({
  orderId,
  isOpen,
  onClose,
  onSubmit,
  className,
}: IssueModalProps) {
  const [selectedType, setSelectedType] = useState<IssueType | "">("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showUploader, setShowUploader] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedType) {
      setError("Please select an issue type");
      return;
    }

    if (!description.trim()) {
      setError("Please provide a description");
      return;
    }

    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        type: selectedType as IssueType,
        description: description.trim(),
        images: images.length > 0 ? images : undefined,
      });

      // Reset form
      setSelectedType("");
      setDescription("");
      setImages([]);
      setShowUploader(false);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to report issue. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    setImages(files);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-poppins font-medium text-yogreet-charcoal">
                Report Delivery Issue
              </h2>
              <p className="text-sm text-stone-500 font-inter">
                Order #{orderId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Issue Type */}
            <div>
              <label className="block text-sm font-manrope font-medium text-yogreet-charcoal mb-3">
                Issue Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {issueTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedType(type.value)}
                    className={cn(
                      "text-left p-4 rounded-lg border-2 transition-all",
                      selectedType === type.value
                        ? "border-yogreet-sage bg-yogreet-sage/5"
                        : "border-stone-200 hover:border-stone-300"
                    )}
                    disabled={isSubmitting}
                  >
                    <p className="text-sm font-manrope font-medium text-yogreet-charcoal mb-1">
                      {type.label}
                    </p>
                    <p className="text-xs text-stone-500 font-inter">
                      {type.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-manrope font-medium text-yogreet-charcoal mb-2"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide detailed information about the issue..."
                rows={4}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border font-inter text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-yogreet-sage/20 focus:border-yogreet-sage",
                  "placeholder:text-stone-400",
                  "disabled:bg-stone-50 disabled:cursor-not-allowed"
                )}
                disabled={isSubmitting}
                required
                minLength={10}
              />
              <p className="text-xs text-stone-500 font-inter mt-1">
                Minimum 10 characters
              </p>
            </div>

            {/* Optional Images */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-manrope font-medium text-yogreet-charcoal">
                  Proof Images (Optional)
                </label>
                {!showUploader && (
                  <button
                    type="button"
                    onClick={() => setShowUploader(true)}
                    className="text-sm text-yogreet-sage hover:text-yogreet-sage/80 font-manrope font-medium flex items-center gap-1"
                    disabled={isSubmitting}
                  >
                    <Upload className="w-4 h-4" />
                    Add Images
                  </button>
                )}
              </div>

              {showUploader && (
                <ProofUploader
                  onUpload={handleImageUpload}
                  eventType="delivery"
                  maxFiles={5}
                  maxSizeMB={10}
                />
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 font-inter">{error}</p>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-manrope font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedType || !description.trim()}
            className={cn(
              "px-6 py-2.5 rounded-lg font-manrope font-medium transition-colors",
              "bg-red-600 text-white hover:bg-red-700",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-2"
            )}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Report Issue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
