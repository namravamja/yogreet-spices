"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import ProfileProgress from "./components/ProfileProgress";
import AccountDetails from "./components/AccountDetails";
import ShippingAddresses from "./components/ShippingAddresses";
import SecuritySettings from "./components/SecuritySettings";
import AccountInfo from "./components/AccountInfo";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { X } from "lucide-react";
import { useGetBuyerQuery, useUpdateBuyerMutation } from "@/services/api/buyerApi";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

// Helper function to format date for display
const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error formatting date for display:", error);
    return "";
  }
};

export default function BuyerProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, user: authUser } = useAuth("buyer");
  const { data: buyerData, isLoading: isDataLoading, isError, error, refetch } = useGetBuyerQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [updateBuyer, { isLoading: isSaving }] = useUpdateBuyerMutation();
  const [editor, setEditor] = React.useState<null | "account" | "address" | "security">(null);
  const [localData, setLocalData] = React.useState<any>({});
  const [uploadedFiles, setUploadedFiles] = React.useState<Record<string, File | File[]>>({});

  const isLoading = isAuthLoading || isDataLoading;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yogreet-sage mx-auto mb-4"></div>
              <p className="text-stone-600 font-inter">Loading profile data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated || isError) {
    return (
      <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center py-16">
            <User className="w-24 h-24 mx-auto text-stone-300 mb-6" />
            <h1 className="text-3xl font-poppins font-light text-yogreet-charcoal mb-4">
              {isError ? "Error Loading Profile" : "Login Required"}
            </h1>
            <p className="text-stone-600 mb-8 font-inter">
              {isError 
                ? error && "status" in error
                  ? `Error ${error.status}: ${typeof error.data === "object" && error.data && "error" in error.data ? error.data.error : "Failed to load profile"}`
                  : "Failed to load buyer profile. Please try again."
                : "Please login to view your buyer profile."}
            </p>
            <div className="flex gap-4 justify-center">
              {isError && (
                <button
                  onClick={() => refetch()}
                  className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer rounded-md"
                >
                  Retry
                </button>
              )}
              {!isAuthenticated && (
                <button
                  onClick={() => router.push('/')}
                  className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer rounded-md"
                >
                  Go to Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle no data state (data is null but no error)
  if (!buyerData) {
    return (
      <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <User className="w-24 h-24 mx-auto text-stone-300 mb-6" />
              <p className="text-stone-600 mb-4 font-inter text-lg">No profile data found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const user = {
      id: buyerData.id,
      email: buyerData.email || "",
      firstName: buyerData.firstName || "",
      lastName: buyerData.lastName || "",
      phone: buyerData.phone || "",
      avatar: buyerData.avatar || "",
      dateOfBirth: buyerData.dateOfBirth ? formatDateForDisplay(buyerData.dateOfBirth) : "",
      gender: buyerData.gender || "",
      addresses: buyerData.addresses || [],
      createdAt: buyerData.createdAt,
      updatedAt: buyerData.updatedAt,
      isVerified: buyerData.isVerified,
      isAuthenticated: buyerData.isAuthenticated,
    };

  const openEditor = (type: typeof editor) => {
    setLocalData(buyerData);
    setUploadedFiles({});
    setEditor(type);
  };

  const updateData = (updates: any) => {
    setLocalData((prev: any) => ({ ...prev, ...updates }));
  };

  const formatDateForAPI = (dateString: string): string | null => {
    if (!dateString) return null;
    try {
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split("-").map(Number);
        const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        return utcDate.toISOString();
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    } catch (error) {
      return null;
    }
  };

  const handleSave = async () => {
    try {
      const hasAvatarFile = uploadedFiles.avatar && uploadedFiles.avatar instanceof File;
      
      if (hasAvatarFile) {
        const formData = new FormData();
        formData.append("avatar", uploadedFiles.avatar as File);
        
        // Add JSON fields
        const payload: any = {};
        if (editor === "account") {
          const dateOfBirth = localData.dateOfBirth ? formatDateForAPI(localData.dateOfBirth) : null;
          Object.assign(payload, {
            firstName: localData.firstName || "",
            lastName: localData.lastName || "",
            phone: localData.phone || "",
            gender: localData.gender || "",
          });
          if (dateOfBirth) payload.dateOfBirth = dateOfBirth;
        }
        
        Object.entries(payload).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (typeof v === "object") formData.append(k, JSON.stringify(v));
          else formData.append(k, String(v));
        });
        
        await updateBuyer(formData).unwrap();
      } else {
        // JSON path
        let payload: any = {};
        if (editor === "account") {
          const dateOfBirth = localData.dateOfBirth ? formatDateForAPI(localData.dateOfBirth) : null;
          payload = {
            firstName: localData.firstName || "",
            lastName: localData.lastName || "",
            phone: localData.phone || "",
            gender: localData.gender || "",
          };
          if (dateOfBirth) payload.dateOfBirth = dateOfBirth;
        }
        
        await updateBuyer(payload).unwrap();
      }
      
      toast.success("Saved successfully");
      setEditor(null);
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.error || e?.data?.message || "Failed to save");
  }
  };

    return (
    <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 max-w-4/5">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-sm md:text-base font-manrope text-stone-600">
                <span className="text-xl">&gt;</span> Home / buyer / profile
            </h1>
            </div>
          </div>
        </div>

        {/* Two-column layout: left larger, right smaller */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Main content (larger) */}
          <div className="lg:col-span-2 space-y-6">
            <AccountDetails buyerData={buyerData as any} onEdit={() => openEditor("account")} />
            <SecuritySettings onEdit={() => openEditor("security")} />
            <AccountInfo user={user} />
          </div>
          {/* Right - Sidebar (smaller) */}
          <div className="lg:col-span-1 space-y-6">
          <ProfileProgress
            user={{
              ...user,
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              dateOfBirth: user.dateOfBirth
                ? formatDateForDisplay(user.dateOfBirth)
                : "",
              addresses: user.addresses.map((addr: any) => ({
                id: addr.id || "",
                firstName: addr.firstName || "",
                lastName: addr.lastName || "",
                addressLine1: addr.street || addr.addressLine1 || "",
                city: addr.city || "",
                state: addr.state || "",
                postalCode: addr.postalCode || "",
                country: addr.country || "",
                phone: addr.phone || "",
                isDefault: addr.isDefault || false,
              })),
            }}
          />
            <ShippingAddresses buyerData={buyerData as any} onEdit={() => openEditor("address")} />
          </div>
        </div>
      </div>
      
      <Sheet open={!!editor} onOpenChange={(o) => !o && setEditor(null)}>
        <SheetContent side="right" className="sm:max-w-lg md:max-w-xl">
          <SheetHeader className="px-10 py-5 border-b border-stone-200">
            <div className="flex items-center justify-between gap-4">
              <SheetTitle>
                {editor === "account" && "Edit Account Details"}
                {editor === "address" && "Edit Shipping Addresses"}
                {editor === "security" && "Edit Security Settings"}
              </SheetTitle>
              <SheetClose
                aria-label="Close editor"
                className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                Close
              </SheetClose>
            </div>
          </SheetHeader>
          <div className="px-10 py-6 overflow-y-auto space-y-8">
            {editor === "account" && (
              <AccountDetails
                buyerData={localData}
                updateData={updateData}
                setUploadedFiles={setUploadedFiles}
                isLoading={isSaving}
                isEditing={true}
              />
            )}
            {editor === "address" && (
              <ShippingAddresses
                buyerData={buyerData}
                updateData={updateData}
                isLoading={isSaving}
                isEditing={true}
                onSaveComplete={() => {
                  setEditor(null);
                  refetch();
                }}
              />
            )}
            {editor === "security" && (
              <SecuritySettings
                updateData={updateData}
                isLoading={isSaving}
                isEditing={true}
              />
            )}
          </div>
          {editor !== "address" && (
            <div className="px-10 py-5 border-t border-stone-200 flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-yogreet-sage text-white rounded-md hover:bg-yogreet-sage/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditor(null)}
                className="px-4 py-2 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}