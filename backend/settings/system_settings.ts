import { api } from "encore.dev/api";

export interface SystemSettings {
  companyName: string;
  companyLogo?: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  language: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  autoBackup: boolean;
  backupFrequency: string;
  dataRetentionDays: number;
}

export interface UpdateSystemSettingsRequest {
  companyName: string;
  companyLogo?: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  language: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  autoBackup: boolean;
  backupFrequency: string;
  dataRetentionDays: number;
}

// Retrieves current system settings.
export const getSystemSettings = api<void, SystemSettings>(
  { expose: true, method: "GET", path: "/settings/system" },
  async () => {
    // In a real implementation, these would be stored in the database
    const settings: SystemSettings = {
      companyName: " Corp",
      companyLogo: "",
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      currency: "USD",
      language: "en",
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: true,
      autoBackup: true,
      backupFrequency: "daily",
      dataRetentionDays: 365
    };

    return settings;
  }
);

// Updates system settings.
export const updateSystemSettings = api<UpdateSystemSettingsRequest, SystemSettings>(
  { expose: true, method: "PUT", path: "/settings/system" },
  async (req) => {
    // In a real implementation, you would update these in the database
    console.log("Updating system settings:", req);
    
    return req;
  }
);
