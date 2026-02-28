"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { FiCheck, FiX, FiLoader, FiAlertCircle, FiShield } from "react-icons/fi";
import { useVerifyDocumentMutation, useSaveVerificationStatusMutation, DocumentType } from "@/services/api/verificationApi";
import { cn } from "@/lib/utils";

export interface VerificationStatus {
  status: "idle" | "verifying" | "verified" | "failed" | "format-only";
  message: string;
  data?: Record<string, any>;
}

interface VerifiableInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  documentType: DocumentType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  crossCheckData?: Record<string, string>;
  onVerificationChange?: (status: VerificationStatus) => void;
  className?: string;
  autoVerifyOnBlur?: boolean;
  minLengthToVerify?: number;
  formatHint?: string;
  showVerificationBadge?: boolean;
  // Initial stored verification status from database
  initialStoredStatus?: {
    verified: boolean;
    verifiedAt?: string;
    details?: string;
    bankName?: string;
    branchName?: string;
  };
}

/**
 * VerifiableInput - Input field with automatic document verification
 * 
 * Features:
 * - Auto-verify on blur (when user leaves the field)
 * - Real-time format validation
 * - Visual feedback with icons and colors
 * - Cross-verification support (e.g., PAN-GST matching)
 */
export function VerifiableInput({
  id,
  label,
  value,
  onChange,
  documentType,
  placeholder,
  required = false,
  disabled = false,
  crossCheckData,
  onVerificationChange,
  className,
  autoVerifyOnBlur = true,
  minLengthToVerify = 3,
  formatHint,
  showVerificationBadge = true,
  initialStoredStatus,
}: VerifiableInputProps) {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(() => {
    // Initialize from stored status if available and verified
    if (initialStoredStatus?.verified) {
      return {
        status: "verified",
        message: initialStoredStatus.details || "Previously verified",
        data: initialStoredStatus.bankName ? {
          bank: initialStoredStatus.bankName,
          branch: initialStoredStatus.branchName,
        } : undefined,
      };
    }
    return { status: "idle", message: "" };
  });
  const [isFocused, setIsFocused] = useState(false);
  const lastVerifiedValue = useRef<string>("");
  
  const [verifyDocument, { isLoading }] = useVerifyDocumentMutation();
  const [saveVerificationStatus] = useSaveVerificationStatusMutation();

  // Update from stored status when it becomes available (e.g., after data fetch)
  useEffect(() => {
    if (initialStoredStatus?.verified && verificationStatus.status === "idle" && value) {
      setVerificationStatus({
        status: "verified",
        message: initialStoredStatus.details || "Previously verified",
        data: initialStoredStatus.bankName ? {
          bank: initialStoredStatus.bankName,
          branch: initialStoredStatus.branchName,
        } : undefined,
      });
      lastVerifiedValue.current = value;
    }
  }, [initialStoredStatus, value, verificationStatus.status]);

  // Update verification status and notify parent
  const updateStatus = useCallback((status: VerificationStatus) => {
    setVerificationStatus(status);
    onVerificationChange?.(status);
  }, [onVerificationChange]);

  // Perform verification
  const performVerification = useCallback(async () => {
    if (!value || value.length < minLengthToVerify) {
      updateStatus({ status: "idle", message: "" });
      return;
    }

    // Skip if same value already verified
    if (value === lastVerifiedValue.current && verificationStatus.status === "verified") {
      return;
    }

    updateStatus({ status: "verifying", message: "Verifying..." });

    try {
      const result = await verifyDocument({
        documentType,
        value,
        crossCheckData,
      }).unwrap();

      lastVerifiedValue.current = value;

      if (result.verified) {
        updateStatus({
          status: result.autoVerified ? "verified" : "format-only",
          message: result.message,
          data: result.data,
        });
        
        // Save verification status to database
        try {
          await saveVerificationStatus({
            documentType,
            value,
            verified: result.verified,
            details: result.message,
            bankName: result.data?.bank,
            branchName: result.data?.branch,
          }).unwrap();
        } catch (saveError) {
          console.error("Failed to save verification status:", saveError);
          // Don't fail the UI operation if save fails
        }
      } else {
        updateStatus({
          status: "failed",
          message: result.message,
        });
      }
    } catch (error: any) {
      updateStatus({
        status: "failed",
        message: error?.data?.message || "Verification failed",
      });
    }
  }, [value, documentType, crossCheckData, verifyDocument, saveVerificationStatus, updateStatus, minLengthToVerify, verificationStatus.status]);

  // Auto-verify on blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (autoVerifyOnBlur && value && value.length >= minLengthToVerify) {
      performVerification();
    }
  }, [autoVerifyOnBlur, value, minLengthToVerify, performVerification]);

  // Reset verification when value changes significantly
  useEffect(() => {
    if (value !== lastVerifiedValue.current && verificationStatus.status !== "idle" && verificationStatus.status !== "verifying") {
      updateStatus({ status: "idle", message: "" });
    }
  }, [value, verificationStatus.status, updateStatus]);

  // Get status icon
  const getStatusIcon = () => {
    if (isLoading || verificationStatus.status === "verifying") {
      return <FiLoader className="w-5 h-5 text-yogreet-sage animate-spin" />;
    }
    
    switch (verificationStatus.status) {
      case "verified":
        return <FiCheck className="w-5 h-5 text-green-600" />;
      case "format-only":
        return <FiShield className="w-5 h-5 text-amber-500" />;
      case "failed":
        return <FiX className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  // Get border color based on status
  const getBorderClass = () => {
    if (isFocused) return "border-yogreet-sage ring-1 ring-yogreet-sage";
    
    switch (verificationStatus.status) {
      case "verified":
        return "border-green-500";
      case "format-only":
        return "border-amber-400";
      case "failed":
        return "border-red-400";
      default:
        return "border-stone-300";
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    if (!showVerificationBadge) return null;

    switch (verificationStatus.status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded-full">
            <FiCheck className="w-3 h-3" />
            Verified
          </span>
        );
      case "format-only":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full">
            <FiShield className="w-3 h-3" />
            Format Valid
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 rounded-full">
            <FiX className="w-3 h-3" />
            Invalid
          </span>
        );
      case "verifying":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-stone-100 text-stone-600 rounded-full">
            <FiLoader className="w-3 h-3 animate-spin" />
            Verifying
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Label with badge */}
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="block text-sm font-medium text-stone-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {getStatusBadge()}
      </div>

      {/* Input with status icon */}
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={cn(
            "w-full px-4 py-3 pr-12 border rounded-md transition-all duration-200",
            "focus:outline-none",
            getBorderClass(),
            disabled && "bg-stone-100 cursor-not-allowed",
            className
          )}
        />
        
        {/* Status icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>

      {/* Status message */}
      {verificationStatus.message && verificationStatus.status !== "idle" && (
        <div className={cn(
          "mt-2 flex items-start gap-2 text-sm",
          verificationStatus.status === "verified" && "text-green-600",
          verificationStatus.status === "format-only" && "text-amber-600",
          verificationStatus.status === "failed" && "text-red-600",
          verificationStatus.status === "verifying" && "text-stone-500"
        )}>
          {verificationStatus.status === "failed" && <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
          <span>{verificationStatus.message}</span>
        </div>
      )}

      {/* Format hint */}
      {formatHint && verificationStatus.status === "idle" && !value && (
        <p className="mt-1.5 text-xs text-stone-400">{formatHint}</p>
      )}

      {/* Additional data display */}
      {verificationStatus.status === "verified" && verificationStatus.data && (
        <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-100">
          {Object.entries(verificationStatus.data).map(([key, val]) => (
            <div key={key} className="text-xs text-green-700">
              <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
              <span>{String(val)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Hook to track multiple field verification statuses
 */
export function useVerificationTracker(requiredFields: string[]) {
  const [statuses, setStatuses] = useState<Record<string, VerificationStatus>>({});

  const updateFieldStatus = useCallback((field: string, status: VerificationStatus) => {
    setStatuses(prev => ({ ...prev, [field]: status }));
  }, []);

  const isFieldVerified = useCallback((field: string) => {
    const status = statuses[field];
    return status?.status === "verified" || status?.status === "format-only";
  }, [statuses]);

  const areAllFieldsVerified = useCallback(() => {
    return requiredFields.every(field => isFieldVerified(field));
  }, [requiredFields, isFieldVerified]);

  const getUnverifiedFields = useCallback(() => {
    return requiredFields.filter(field => !isFieldVerified(field));
  }, [requiredFields, isFieldVerified]);

  const hasAnyFailures = useCallback(() => {
    return Object.values(statuses).some(s => s.status === "failed");
  }, [statuses]);

  return {
    statuses,
    updateFieldStatus,
    isFieldVerified,
    areAllFieldsVerified,
    getUnverifiedFields,
    hasAnyFailures,
  };
}

export default VerifiableInput;
