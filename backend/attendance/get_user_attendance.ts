import { api } from "encore.dev/api";
import fetch from 'node-fetch';
import { secret } from "encore.dev/config";
import { config as attendanceConfig } from "./config";

// Encore secrets must be declared at module scope
// Declare Encore secrets at module scope (required by Encore)
const CRM_API_URL_SECRET = secret("CRM_API_URL");
const CRM_USERNAME_SECRET = secret("CRM_USERNAME");
const CRM_PASSWORD_SECRET = secret("CRM_PASSWORD");

interface CrmLoginResponse {
  success: boolean;
  session_token?: string;
  sessionName?: string;
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

function resolveConfig() {
  // Try Encore secrets first (if present), then environment, then local config
  // Note: secret() returns a Secret wrapper; toString() yields the value
  let url = "";
  let user = "";
  let pass = "";
  try { url = CRM_API_URL_SECRET.toString(); } catch {}
  try { user = CRM_USERNAME_SECRET.toString(); } catch {}
  try { pass = CRM_PASSWORD_SECRET.toString(); } catch {}

  url = process.env.CRM_API_URL || url || attendanceConfig.CRM_API_URL;
  user = process.env.CRM_USERNAME || user || attendanceConfig.CRM_USERNAME;
  pass = process.env.CRM_PASSWORD || pass || attendanceConfig.CRM_PASSWORD;

  return { url, user, pass };
}

type LoginResult = { ok: true; token: string } | { ok: false; reason: string };

async function crm_login(username: string, password: string, apiUrl: string): Promise<LoginResult> {
  try {
    const form = new URLSearchParams();
    form.set("operation", "login");
    form.set("username", username);
    form.set("password", password);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return { ok: false, reason: `HTTP ${response.status}: ${text.slice(0, 200)}` };
    }

    const data = await response.json() as CrmLoginResponse;
    if (data.session_token || data.sessionName) {
      return { ok: true, token: (data.session_token || data.sessionName)! };
    }
    return { ok: false, reason: data.error || "No session token returned" };
  } catch (e) {
    console.error("CRM login failed:", e);
    return { ok: false, reason: (e as Error)?.message || String(e) };
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

    const cfg = resolveConfig();
    if (!cfg.url || !/^https?:\/\//i.test(cfg.url)) {
      return { success: false, message: "❌ CRM_API_URL is missing or invalid. Set secrets CRM_API_URL/CRM_USERNAME/CRM_PASSWORD or update attendance config." };
    }
    if (!cfg.user || !cfg.pass) {
      return { success: false, message: "❌ CRM credentials are missing. Set CRM_USERNAME and CRM_PASSWORD as secrets or env vars." };
    }

    const login = await crm_login(cfg.user, cfg.pass, cfg.url);
    if (!login.ok) {
      try {
        const host = new URL(cfg.url).host;
        return { success: false, message: `❌ Could not connect to CRM (${host}): ${login.reason}` };
      } catch {
        return { success: false, message: `❌ Could not connect to CRM: ${login.reason}` };
      }
    }

    const form = new URLSearchParams();
    form.set("operation", "query");
    form.set("_session", login.token);
    form.set("module", "Attendance");
    form.set("query", `SELECT * FROM Attendance WHERE employee_id='${employeeId}' AND date='${date.split('-').reverse().join('-')}'`);

    try {
      const response = await fetch(cfg.url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        return { success: false, message: `❌ CRM query failed: HTTP ${response.status} ${text.slice(0,200)}` };
      }

      const data = await response.json() as CrmQueryResponse;

      if (!data.success) {
        return { success: false, message: `❌ CRM query failed: ${data.error || 'Unknown error'}` };
      }

      const records = data.result?.records || [];

      if (records.length === 0) {
        return { success: true, message: `📭 No attendance record found for employee ${employeeId} on ${date}.` };
      }

      const rec: any = records[0] as any;

      const pick = (keys: string[], fallback: string = ""): string => {
        for (const k of keys) {
          if (rec && rec[k] !== undefined && rec[k] !== null && String(rec[k]).length > 0) {
            return String(rec[k]);
          }
        }
        return fallback;
      };

      const inTime = pick(["PunchInTime", "Punch_In_Time", "punchInTime", "CheckInTime", "check_in_time"], "N/A");
      const outTime = pick(["PunchOutTime", "Punch_Out_Time", "punchOutTime", "CheckOutTime", "check_out_time"], "N/A");
      const lateMin = pick(["LateMinutes", "Late_Punch", "LatePunchIn", "Late_Punch_In_Min", "LatePunchInMin", "Late_Punch_In_Minutes"], "0");
      const earlyMin = pick(["EarlyMinutes", "Early_Punch_Out", "EarlyPunchOut", "Early_Punch_Out_Min", "EarlyPunchOutMin"], "0");
      const workingHours = pick(["WorkingHours", "TimesheetHours", "TotalHours", "total_hours"], "0");
      const breakTime = pick(["BreakTime", "break_time"], "0");
      const otMin = pick(["OT", "OT_Min", "OTMin"], "0");
      const discipline = pick(["ShiftDiscipline", "AttendanceStatus", "status"], "");

      const msg = (
        `📅 Attendance Record\n` +
        `🗓 Date: ${date}\n` +
        `⏰ Punch In: ${inTime}\n` +
        `🕔 Punch Out: ${outTime}\n` +
        `🧮 Working Hours: ${workingHours}\n` +
        `☕ Break Time: ${breakTime}m\n` +
        `➕ OT (Min): ${otMin}\n` +
        `🚶 Late Punch In (Min): ${lateMin}\n` +
        `🏃 Early Punch Out (Min): ${earlyMin}` +
        (discipline ? `\n📌 Status: ${discipline}` : "")
      );

      return { success: true, message: msg };
    } catch (e: any) {
      return { success: false, message: `⚠️ Error retrieving attendance: ${e.message || e}` };
    }
  }
);