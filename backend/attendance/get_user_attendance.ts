import { api } from "encore.dev/api";
import fetch from 'node-fetch';
import { secret } from "encore.dev/config";

const CRM_API_URL = secret("CRM_API_URL");
const CRM_USERNAME = secret("CRM_USERNAME");
const CRM_PASSWORD = secret("CRM_PASSWORD");

interface CrmLoginResponse {
  success: boolean;
  session_token?: string;
  error?: string;
}

interface CrmQueryResponse {
  success: boolean;
  result?: {
    records: Array<{
      PunchInTime: string;
      PunchOutTime: string;
      LateMinutes: string;
      EarlyMinutes: string;
    }>;
  };
  error?: string;
}

async function crm_login(username: string, password: string): Promise<string | null> {
  try {
    const response = await fetch(CRM_API_URL.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _operation: "login",
        username,
        password,
      }),
    });

    const data = await response.json() as CrmLoginResponse;
    return data.session_token || null;
  } catch (e) {
    console.error("CRM login failed:", e);
    return null;
  }
}

interface GetUserAttendanceRequest {
  employeeId: string;
  date: string;
}

interface GetUserAttendanceResponse {
  success: boolean;
  message: string;
}

export const getUserAttendance = api(
  {
    expose: true,
    method: "POST",
    path: "/attendance/user",
  },
  async (req: GetUserAttendanceRequest): Promise<GetUserAttendanceResponse> => {
    const { employeeId, date } = req;

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return { success: false, message: "⚠️ Invalid date format. Please use YYYY-MM-DD." };
    }

    const sessionToken = await crm_login(CRM_USERNAME.toString(), CRM_PASSWORD.toString());

    if (!sessionToken) {
      return { success: false, message: "❌ Could not connect to CRM." };
    }

    const payload = {
      _operation: "query",
      _session: sessionToken,
      module: "Attendance",
      query: `SELECT * FROM Attendance WHERE employee_id='${employeeId}' AND date='${date.split('-').reverse().join('-')}'`,
    };

    try {
      const response = await fetch(CRM_API_URL.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json() as CrmQueryResponse;

      if (!data.success) {
        return { success: false, message: `❌ CRM query failed: ${data.error || 'Unknown error'}` };
      }

      const records = data.result?.records || [];

      if (records.length === 0) {
        return { success: true, message: `📭 No attendance record found for employee ${employeeId} on ${date}.` };
      }

      const rec = records[0];
      const msg = (
        `📅 *Attendance Record*\n` +
        `🗓 Date: ${date}\n` +
        `⏰ In-Time: ${rec.PunchInTime || 'N/A'}\n` +
        `🕔 Out-Time: ${rec.PunchOutTime || 'N/A'}\n` +
        `🚶 Late Minutes: ${rec.LateMinutes || '0'}\n` +
        `🏃 Early Minutes: ${rec.EarlyMinutes || '0'}`
      );

      return { success: true, message: msg };
    } catch (e: any) {
      return { success: false, message: `⚠️ Error retrieving attendance: ${e.message || e}` };
    }
  }
);