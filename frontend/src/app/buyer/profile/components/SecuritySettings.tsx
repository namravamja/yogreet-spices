"use client";

import { useState } from "react";
import { Shield, Key, Bell, Eye, EyeOff, Check, Edit, Upload } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SecuritySettingsProps {
  onEdit?: () => void;
  updateData?: (updates: any) => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export default function SecuritySettings({ onEdit, updateData, isLoading: externalLoading, isEditing = false }: SecuritySettingsProps) {
  const router = useRouter();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    marketingEmails: false,
    securityAlerts: true,
  });

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsChangingPassword(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error("Failed to change password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      setIsUpdatingNotifications(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Notification settings updated successfully");
    } catch (error) {
      toast.error("Failed to update notification settings. Please try again.");
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  // Display mode - show data with Edit button
  if (!isEditing) {
    const isComplete = true; // Security settings are always considered complete
    const buttonText = isComplete ? "Edit" : "Upload";
    const ButtonIcon = isComplete ? Edit : Upload;

  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
              <Shield className="w-5 h-5 mr-2 text-yogreet-sage" />
          Security Settings
        </h2>
            <button
              onClick={() => (onEdit ? onEdit() : router.push("/buyer/profile"))}
              className="px-3 py-1.5 border border-yogreet-sage text-yogreet-sage rounded-md hover:bg-yogreet-sage/10 transition-colors cursor-pointer text-sm font-manrope flex items-center gap-1.5"
            >
              <ButtonIcon className="w-4 h-4" />
              {buttonText}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-stone-900 mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Change Password
            </h3>
            <p className="text-stone-600 text-sm">
              You can change your password to keep your account secure.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode - form for Sheet
  return (
    <div className="space-y-6">

        {/* Password Change Section */}
        <div>
          <h3 className="text-lg font-medium text-stone-900 mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Change Password
          </h3>
          
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={handlePasswordChange}
              disabled={isChangingPassword}
              className="bg-yogreet-sage hover:bg-yogreet-sage/90 disabled:bg-yogreet-sage/50 text-white px-4 py-2 font-medium transition-colors cursor-pointer disabled:cursor-not-allowed hover:opacity-80 flex items-center"
            >
              {isChangingPassword ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Changing Password...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </>
              )}
            </button>
        </div>
      </div>
    </div>
  );
}
