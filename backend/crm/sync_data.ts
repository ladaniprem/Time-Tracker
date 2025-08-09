import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";

const crmApiUrl = secret("CRM_API_URL");
const crmUsername = secret("CRM_USERNAME");
const crmPassword = secret("CRM_PASSWORD");

export interface SyncDataRequest {
  dataType: "employees" | "attendance";
  data: any[];
}

export interface SyncDataResponse {
  success: boolean;
  syncedCount: number;
  error?: string;
}

// Syncs data with external CRM system.
export const syncData = api<SyncDataRequest, SyncDataResponse>(
  { expose: true, method: "POST", path: "/crm/sync" },
  async (req) => {
    try {
      console.log(`Syncing ${req.dataType} data to CRM`);
      console.log(`CRM API URL: ${crmApiUrl()}`);
      console.log(`CRM Username: ${crmUsername()}`);
      console.log(`Data count: ${req.data.length}`);
      
      // In a real implementation, you would make HTTP requests to the CRM API
      // For now, we'll simulate the sync operation
      return {
        success: true,
        syncedCount: req.data.length
      };
    } catch (error) {
      return {
        success: false,
        syncedCount: 0,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
);
