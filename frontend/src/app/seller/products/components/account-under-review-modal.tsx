"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, CheckCircle } from "lucide-react";

interface AccountUnderReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AccountUnderReviewModal({
  open,
  onOpenChange,
}: AccountUnderReviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-yellow-100 rounded-full">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-poppins font-semibold text-yogreet-charcoal text-center">
            Account Under Review
          </DialogTitle>
          <DialogDescription className="text-base text-stone-600 font-inter pt-4 text-center">
            All required documents have been uploaded. Your account is under surveillance and will be verified in a short time.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-inter font-medium text-green-800">
                  Your profile and documents are complete
                </p>
                <p className="text-xs text-green-700 mt-1 font-inter">
                  Our team is reviewing your account. You'll be able to add products once verification is complete.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-6 py-2.5 bg-yogreet-sage text-white rounded-lg font-manrope font-medium text-sm hover:bg-yogreet-sage/90 transition-colors cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

