"use client";

import type React from "react";

import { Upload, X, FileImage } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

// Define UploadedFile type locally
type UploadedFile = {
  file: File;
  preview: string;
  name: string;
};

interface ProfileData {
  businessAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  warehouseAddress: {
    sameAsBusiness: boolean;
    street: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  bankAccountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  gstNumber: string;
  panNumber: string;
}

interface Step2Props {
  data: ProfileData & Record<string, any>; // Allow additional properties from database
  updateData: (updates: Partial<ProfileData>) => void;
  updateNestedField: (
    parent: keyof ProfileData,
    field: string,
    value: any
  ) => void;
  setUploadedFiles: React.Dispatch<React.SetStateAction<Record<string, File>>>;
  onSave?: () => Promise<boolean>;
  isLoading?: boolean;
}

export default function Step2AddressBanking({
  data,
  updateData,
  updateNestedField,
  setUploadedFiles,
  onSave,
  isLoading = false,
}: Step2Props) {
  const [uploadedDocuments, setUploadedDocuments] = useState<
    Record<string, UploadedFile>
  >({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Add state for existing documents from database
  const [existingDocuments, setExistingDocuments] = useState<
    Record<string, string>
  >({});

  // Add useEffect to handle existing documents from database
  useEffect(() => {
    try {
      // Map database fields to display fields - handle multiple possible field structures
      const dbDocuments: Record<string, string> = {};

      // Check for existing documents in the data - try multiple possible field names
      // Direct fields on data object
      if (data?.gstCertificate && typeof data.gstCertificate === "string") {
        dbDocuments["gst-upload"] = data.gstCertificate;
      }
      if (data?.panCard && typeof data.panCard === "string") {
        dbDocuments["pan-upload"] = data.panCard;
      }
      if (data?.businessLicense && typeof data.businessLicense === "string") {
        dbDocuments["license-upload"] = data.businessLicense;
      }
      if (data?.canceledCheque && typeof data.canceledCheque === "string") {
        dbDocuments["cheque-upload"] = data.canceledCheque;
      }

      // Check nested documents object if it exists
      if (data?.documents && typeof data.documents === "object") {
        const docs = data.documents as any;
        if (docs.gstCertificate && typeof docs.gstCertificate === "string") {
          dbDocuments["gst-upload"] = docs.gstCertificate;
        }
        if (docs.panCard && typeof docs.panCard === "string") {
          dbDocuments["pan-upload"] = docs.panCard;
        }
        if (docs.businessLicense && typeof docs.businessLicense === "string") {
          dbDocuments["license-upload"] = docs.businessLicense;
        }
        if (docs.canceledCheque && typeof docs.canceledCheque === "string") {
          dbDocuments["cheque-upload"] = docs.canceledCheque;
        }
      }

      // Alternative field names that might be used in your API
      const alternativeFields = {
        "gst-upload": ["gst_certificate", "gstDocument", "gst_doc"],
        "pan-upload": ["pan_card", "panDocument", "pan_doc"],
        "license-upload": [
          "business_license",
          "licenseDocument",
          "license_doc",
        ],
        "cheque-upload": [
          "canceled_cheque",
          "chequeDocument",
          "cheque_doc",
          "cancelled_cheque",
        ],
      };

      // Check for alternative field names
      Object.entries(alternativeFields).forEach(([uploadId, altNames]) => {
        if (!dbDocuments[uploadId]) {
          // Only if not already found
          altNames.forEach((altName) => {
            if (data && typeof data === "object" && altName in data) {
              const value = (data as any)[altName];
              if (value && typeof value === "string") {
                dbDocuments[uploadId] = value;
              }
            }
          });
        }
      });

      setExistingDocuments(dbDocuments);
    } catch (error) {
      console.error("Error loading existing documents:", error);
      // Don't show error to user, just log it
      setExistingDocuments({});
    }
  }, [data]);

  // Add useEffect to sync warehouse address when sameAsBusiness changes
  useEffect(() => {
    if (data?.warehouseAddress?.sameAsBusiness && data?.businessAddress) {
      // Copy business address to warehouse address
      updateNestedField(
        "warehouseAddress",
        "street",
        data.businessAddress.street
      );
      updateNestedField("warehouseAddress", "city", data.businessAddress.city);
      updateNestedField(
        "warehouseAddress",
        "state",
        data.businessAddress.state
      );
      updateNestedField(
        "warehouseAddress",
        "country",
        data.businessAddress.country
      );
      updateNestedField(
        "warehouseAddress",
        "pinCode",
        data.businessAddress.pinCode
      );
    }
  }, [data?.warehouseAddress?.sameAsBusiness, data?.businessAddress]);

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    updateData({ [field]: value });
  };

  const handleNestedFieldChange = (
    parent: keyof ProfileData,
    field: string,
    value: any
  ) => {
    updateNestedField(parent, field, value);

    // If business address is changed and warehouse is same as business, sync warehouse address
    if (
      parent === "businessAddress" &&
      data?.warehouseAddress?.sameAsBusiness
    ) {
      updateNestedField("warehouseAddress", field, value);
    }
  };

  const handleFileUpload = (inputId: string, file: File | null) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedDocuments((prev) => ({
          ...prev,
          [inputId]: {
            file,
            preview: result,
            name: file.name,
          },
        }));
      };
      reader.readAsDataURL(file);

      // Store the file for document upload
      setUploadedFiles((prev: Record<string, File>) => ({
        ...prev,
        [inputId]: file,
      }));

      toast.success(`Document uploaded: ${file.name}`);
    }
  };

  const removeDocument = (inputId: string) => {
    setUploadedDocuments((prev) => {
      const newDocs = { ...prev };
      delete newDocs[inputId];
      return newDocs;
    });

    // Also clear existing documents
    setExistingDocuments((prev) => {
      const newDocs = { ...prev };
      delete newDocs[inputId];
      return newDocs;
    });

    // Clear the file input
    if (fileInputRefs.current[inputId]) {
      fileInputRefs.current[inputId]!.value = "";
    }

    // Remove from uploaded files only
    setUploadedFiles((prev: Record<string, File>) => {
      const newFiles = { ...prev };
      delete newFiles[inputId];
      return newFiles;
    });

    toast.success("Document removed");
  };

  const triggerFileUpload = (inputId: string) => {
    fileInputRefs.current[inputId]?.click();
  };

  const renderFileUpload = (doc: {
    id: string;
    label: string;
    required: boolean;
  }) => {
    const uploadedDoc = uploadedDocuments[doc.id];
    const existingDoc = existingDocuments[doc.id];

    return (
      <div>
        {/* Hidden file input */}
        <input
          ref={(el) => {
            fileInputRefs.current[doc.id] = el;
          }}
          type="file"
          accept="image/*"
          onChange={(e) =>
            handleFileUpload(doc.id, e.target.files?.[0] || null)
          }
          className="hidden"
        />

        {uploadedDoc || existingDoc ? (
          <div className="mt-1 p-3 border-2 border-dashed border-stone-300 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {existingDoc && !uploadedDoc ? (
                  // Display existing document from database
                  <>
                    <div className="w-16 h-16 flex items-center justify-center bg-stone-100 rounded border">
                      <img
                        src={existingDoc || "/Profile.jpg"}
                        alt={doc.label}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          // If image fails to load, show file icon instead
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML =
                              '<svg class="w-8 h-8 text-terracotta-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>';
                          }
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-700">
                        {doc.label}
                      </p>
                      <p className="text-xs text-stone-500">
                        Existing document
                      </p>
                    </div>
                  </>
                ) : (
                  // Display newly uploaded document
                  <>
                    <FileImage className="w-8 h-8 text-terracotta-600" />
                    <div>
                      <p className="text-sm font-medium text-stone-700">
                        {uploadedDoc?.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        {uploadedDoc
                          ? (uploadedDoc.file.size / 1024).toFixed(1) + " KB"
                          : ""}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => removeDocument(doc.id)}
                className="text-red-500 hover:text-red-700 p-1"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => triggerFileUpload(doc.id)}
            className="mt-1 flex justify-center px-3 sm:px-6 pt-3 sm:pt-5 pb-3 sm:pb-6 border-2 border-dashed border-stone-300 rounded-md hover:border-terracotta-400 transition-colors cursor-pointer"
          >
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-6 sm:h-8 w-6 sm:w-8 text-stone-400" />
              <div className="flex flex-col sm:flex-row text-sm text-stone-600 justify-center">
                <span className="font-medium text-terracotta-600 hover:text-terracotta-500">
                  Upload a photo
                </span>
                <p className="sm:pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-stone-500">PNG, JPG up to 5MB</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-light text-stone-900 mb-4 sm:mb-6">
        Address, Banking & Tax Details
      </h2>

      <div className="mb-8">
        <h3 className="text-base sm:text-lg font-medium text-stone-900 mb-3 sm:mb-4">
          Business Address
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data?.businessAddress?.street || ""}
              onChange={(e) =>
                handleNestedFieldChange(
                  "businessAddress",
                  "street",
                  e.target.value
                )
              }
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data?.businessAddress?.city || ""}
              onChange={(e) =>
                handleNestedFieldChange(
                  "businessAddress",
                  "city",
                  e.target.value
                )
              }
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data?.businessAddress?.state || ""}
              onChange={(e) =>
                handleNestedFieldChange(
                  "businessAddress",
                  "state",
                  e.target.value
                )
              }
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data?.businessAddress?.country || ""}
              onChange={(e) =>
                handleNestedFieldChange(
                  "businessAddress",
                  "country",
                  e.target.value
                )
              }
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              PIN Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data?.businessAddress?.pinCode || ""}
              onChange={(e) =>
                handleNestedFieldChange(
                  "businessAddress",
                  "pinCode",
                  e.target.value
                )
              }
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              required
            />
          </div>
        </div>
      </div>

      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
          <h3 className="text-base sm:text-lg font-medium text-stone-900">
            Warehouse / Pickup Address
          </h3>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sameAsBusiness"
              checked={data?.warehouseAddress?.sameAsBusiness ?? true}
              onChange={(e) =>
                handleNestedFieldChange(
                  "warehouseAddress",
                  "sameAsBusiness",
                  e.target.checked
                )
              }
              className="h-4 w-4 text-terracotta-600 focus:ring-terracotta-500 border-stone-300 rounded"
            />
            <label
              htmlFor="sameAsBusiness"
              className="ml-2 text-sm text-stone-700"
            >
              Same as Business Address
            </label>
          </div>
        </div>

        {!data?.warehouseAddress?.sameAsBusiness && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={data?.warehouseAddress?.street || ""}
                onChange={(e) =>
                  handleNestedFieldChange(
                    "warehouseAddress",
                    "street",
                    e.target.value
                  )
                }
                className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={data?.warehouseAddress?.city || ""}
                onChange={(e) =>
                  handleNestedFieldChange(
                    "warehouseAddress",
                    "city",
                    e.target.value
                  )
                }
                className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={data?.warehouseAddress?.state || ""}
                onChange={(e) =>
                  handleNestedFieldChange(
                    "warehouseAddress",
                    "state",
                    e.target.value
                  )
                }
                className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={data?.warehouseAddress?.country || ""}
                onChange={(e) =>
                  handleNestedFieldChange(
                    "warehouseAddress",
                    "country",
                    e.target.value
                  )
                }
                className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                PIN Code
              </label>
              <input
                type="text"
                value={data?.warehouseAddress?.pinCode || ""}
                onChange={(e) =>
                  handleNestedFieldChange(
                    "warehouseAddress",
                    "pinCode",
                    e.target.value
                  )
                }
                className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-stone-900 mb-4">
          Banking Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Bank Account Holder Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data?.bankAccountName || ""}
              onChange={(e) =>
                handleInputChange("bankAccountName", e.target.value)
              }
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data?.bankName || ""}
              onChange={(e) => handleInputChange("bankName", e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data?.accountNumber || ""}
              onChange={(e) =>
                handleInputChange("accountNumber", e.target.value)
              }
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              IFSC / SWIFT Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data?.ifscCode || ""}
              onChange={(e) => handleInputChange("ifscCode", e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              UPI ID (optional)
            </label>
            <input
              type="text"
              value={data?.upiId || ""}
              onChange={(e) => handleInputChange("upiId", e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-stone-900 mb-4">Tax Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              GST Number (if applicable)
            </label>
            <input
              type="text"
              value={data?.gstNumber || ""}
              onChange={(e) => handleInputChange("gstNumber", e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              PAN Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data?.panNumber || ""}
              onChange={(e) => handleInputChange("panNumber", e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              required
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-stone-900 mb-4">
          Upload Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              id: "gst-upload",
              label: "GST Certificate (if applicable)",
              required: false,
            },
            { id: "pan-upload", label: "PAN Card", required: true },
            {
              id: "license-upload",
              label: "Business License / Incorporation Certificate",
              required: true,
            },
            {
              id: "cheque-upload",
              label: "Canceled Cheque or Passbook",
              required: true,
            },
          ].map((doc) => (
            <div key={doc.id}>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                {doc.label}{" "}
                {doc.required && <span className="text-red-500">*</span>}
              </label>
              {renderFileUpload(doc)}
            </div>
          ))}
        </div>
      </div>

      {/* Add save button at the end */}
      {onSave && (
        <div className="mt-6 pt-4 border-t border-stone-200">
          <button
            onClick={onSave}
            disabled={isLoading}
            className="px-4 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Step 2 Data"}
          </button>
        </div>
      )}
    </div>
  );
}
