"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  showActions?: boolean;
  confirmVariant?: "primary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  showActions = true,
  confirmVariant = "primary",
  size = "md",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "max-w-sm";
      case "lg":
        return "max-w-lg";
      default:
        return "max-w-md";
    }
  };

  const getConfirmButtonClasses = () => {
    const baseClasses = "text-white px-4 py-2 font-medium transition-colors cursor-pointer disabled:cursor-not-allowed hover:opacity-80 flex-1 flex items-center justify-center";
    
    switch (confirmVariant) {
      case "danger":
        return `bg-red-600 hover:bg-red-700 disabled:bg-red-400 ${baseClasses}`;
      case "success":
        return `bg-green-600 hover:bg-green-700 disabled:bg-green-400 ${baseClasses}`;
      default:
        return `bg-yogreet-red hover:bg-yogreet-red/90 disabled:bg-yogreet-red/60 ${baseClasses}`;
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-black/60 backdrop-blur-none flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl ${getSizeClasses()} w-full p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          {children}
        </div>

        {showActions && (
          <div className="flex space-x-3">
            {onConfirm && (
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={getConfirmButtonClasses()}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Loading...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            )}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 px-4 py-2 font-medium transition-colors hover:opacity-80 cursor-pointer"
            >
              {cancelText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
