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
let currentSettings: SystemSettings = {
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
  dataRetentionDays: 365,
};

export const getCurrentSystemSettings = (): SystemSettings => currentSettings;

export const getSystemSettings = api<void, SystemSettings>(
  { expose: true, method: "GET", path: "/settings/system" },
  async () => {
    return currentSettings;
  }
);

// Updates system settings.
export const updateSystemSettings = api<UpdateSystemSettingsRequest, SystemSettings>(
  { expose: true, method: "PUT", path: "/settings/system" },
  async (req) => {
    // Persist in-memory for runtime checks
    currentSettings = { ...req };
    return currentSettings;
  }
);
