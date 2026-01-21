
import { api } from "@/lib/apiClient";
import { toast } from "sonner";

export const updateUserProfile = async (userId: string, userData: any) => {
  try {
    const response = await api.updateUser(userId, userData);
    toast.success("Profile updated successfully");
    return { success: true, user: response.user };
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    toast.error(error.message || "Failed to update profile");
    throw error;
  }
};

export const updatePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  try {
    await api.request(`/api/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
    toast.success("Password updated successfully");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating password:", error);
    toast.error(error.message || "Failed to update password");
    throw error;
  }
};

export const updateNotificationPreferences = async (userId: string, preferences: any) => {
  try {
    await api.updateNotificationPreferences(preferences);
    toast.success("Notification preferences updated");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating notification preferences:", error);
    toast.error(error.message || "Failed to update preferences");
    throw error;
  }
};

export const deleteUserAccount = async (userId: string) => {
  try {
    await api.request(`/api/users/${userId}`, { method: 'DELETE' });
    toast.success("Account deleted successfully");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting account:", error);
    toast.error(error.message || "Failed to delete account");
    throw error;
  }
};
