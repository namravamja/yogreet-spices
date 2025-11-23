"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserCircle, FileCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CompleteProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileProgress: number;
  documentVerificationProgress: number;
}

export default function CompleteProfileModal({
  open,
  onOpenChange,
  profileProgress,
  documentVerificationProgress,
}: CompleteProfileModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-poppins font-semibold text-yogreet-charcoal">
            Complete Your Profile & Verification
          </DialogTitle>
          <DialogDescription className="text-base text-stone-600 font-inter pt-2">
            To add products, you need to complete both your profile and document verification to 100%.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Profile Completion Card */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="p-4 bg-blue-500/10 rounded-xl mb-4">
                <UserCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-manrope font-semibold text-yogreet-charcoal mb-2">
                Profile Completion
              </h3>
              <p className="text-sm text-stone-600 font-inter leading-relaxed">
                {profileProgress < 100
                  ? "Complete your profile to continue"
                  : "Profile is complete"}
              </p>
            </div>
            
            <div className="mt-auto space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-inter font-medium text-stone-700">
                  Progress
                </span>
                <span className="text-lg font-manrope font-semibold text-blue-600">
                  {profileProgress}%
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                  style={{ width: `${profileProgress}%` }}
                />
              </div>
              {profileProgress < 100 && (
                <Link
                  href="/seller/edit-profile"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex items-center justify-center w-full mt-5 px-4 py-2.5 bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-manrope font-medium text-sm transition-all duration-300 group"
                >
                  Complete Profile
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>

          {/* Verification Status Card */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="p-4 bg-yogreet-red/10 rounded-xl mb-4">
                <FileCheck className="w-8 h-8 text-yogreet-red" />
              </div>
              <h3 className="text-xl font-manrope font-semibold text-yogreet-charcoal mb-2">
                Verification Status
              </h3>
              <p className="text-sm text-stone-600 font-inter leading-relaxed">
                {documentVerificationProgress < 100
                  ? "Complete verification to start selling"
                  : "Verification is complete"}
              </p>
            </div>
            
            <div className="mt-auto space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-inter font-medium text-stone-700">
                  Progress
                </span>
                <span className="text-lg font-manrope font-semibold text-yogreet-red">
                  {documentVerificationProgress}%
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full bg-yogreet-red transition-all duration-500 rounded-full"
                  style={{ width: `${documentVerificationProgress}%` }}
                />
              </div>
              {documentVerificationProgress < 100 && (
                <Link
                  href="/seller/verify-document"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex items-center justify-center w-full mt-5 px-4 py-2.5 bg-yogreet-red/10 text-yogreet-red hover:bg-yogreet-red hover:text-white rounded-lg font-manrope font-medium text-sm transition-all duration-300 group"
                >
                  Complete Verification
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

