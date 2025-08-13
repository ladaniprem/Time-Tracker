// import { api } from "encore.dev/api";
// import { promises as fs } from "fs";
// import path from "path";
// import ExcelJS from 'exceljs';
// import { sendEmail } from "../notification/send_email";
// import { sendWhatsApp } from "../notification/send_whatsapp";
// import { secret } from "encore.dev/config";

// // Define constants
// const PROCESSED_FILE_PATH = "processed_files.json";

// // Interfaces for data structures
// interface EmployeeAttendance {
//   "Staff Name": string;
//   "In-Time": string | null;
//   "Out-Time": string | null;
//   late_minutes: number;
//   early_minutes: number;
// }

// interface CrmLoginResponse {
//   result?: {
//     login?: {
//       session: string;
//     };
//   };
// }

// interface CrmSaveRecordResponse {
//   success: boolean;
//   message?: string;
// }

// // Helper functions
// async function loadProcessedFiles(): Promise<Set<string>> {
//   try {
//     const data = await fs.readFile(PROCESSED_FILE_PATH, "utf-8");
//     return new Set(JSON.parse(data));
//   } catch (error) {
//     if (error.code === 'ENOENT') {
//       return new Set(); // File not found, return empty set
//     }
//     console.error("Error loading processed files:", error);
//     return new Set();
//   }
// }

// async function saveProcessedFiles(files: Set<string>): Promise<void> {
//   await fs.writeFile(PROCESSED_FILE_PATH, JSON.stringify(Array.from(files)));
// }

// async function crmLogin(): Promise<string | undefined> {
//   const payload = new URLSearchParams({
//     _operation: "loginAndFetchModules",
//     username: secret("CRM_USERNAME").toString(),
//     password: secret("CRM_PASSWORD"),
//   });

//   try {
//     const response = await fetch(secret("CRM_API_URL").toString(), {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: payload.toString(),
//     });
//     const data = (await response.json()) as CrmLoginResponse;
//     return data.result?.login?.session;
//   } catch (error) {
//     console.error("CRM login failed:", error);
//     return undefined;
//   }
// }

// async function uploadToCrm(
//   session: string,
//   emp: EmployeeAttendance,
//   date_str: string
// ): Promise<CrmSaveRecordResponse> {
//   const data = {
//     _operation: "saveRecord",
//     _session: session,
//     module: "Attendance",
//     values: {
//       name: emp["Staff Name"],
//       date: new Date(date_str).toLocaleDateString("en-GB"), // Format as DD-MM-YYYY
//       punch_in_time: emp["In-Time"] || "",
//       punch_out_time: emp["Out-Time"] || "",
//       late_minutes: emp.late_minutes || 0,
//       early_minutes: emp.early_minutes || 0,
//       assigned_user_id: "19x5",
//     },
//   };

//   try {
//     const response = await fetch(config.CRM_API_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });
//     return (await response.json()) as CrmSaveRecordResponse;
//   } catch (error) {
//     console.error("Error uploading to CRM:", error);
//     return { success: false, message: "Failed to upload to CRM" };
//   }
// }

// async function readAttendance(filePath: string): Promise<EmployeeAttendance[]> {
//   const workbook = new ExcelJS.Workbook();
//   await workbook.xlsx.readFile(filePath);
//   const worksheet = workbook.getWorksheet('Details');
//   const employees: EmployeeAttendance[] = [];

//   if (worksheet) {
//     worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
//       if (rowNumber === 1) return; // Skip header row

//       const staffName = row.getCell(1).value?.toString() || "";
//       const inTime = row.getCell(2).value;
//       const outTime = row.getCell(3).value;
//       const lateMinutes = parseFloat(row.getCell(4).value?.toString() || "0");
//       const earlyMinutes = parseFloat(row.getCell(5).value?.toString() || "0");

//       employees.push({
//         "Staff Name": staffName,
//         "In-Time": inTime ? new Date(inTime.toString()).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : null,
//         "Out-Time": outTime ? new Date(outTime.toString()).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : null,
//         late_minutes: lateMinutes,
//         early_minutes: earlyMinutes,
//       });
//     });
//   }
//   return employees;
// }

// function extractDate(filename: string): string {
//   const match = filename.match(/\d{4}-\d{2}-\d{2}/);
//   return match ? match[0] : new Date().toISOString().split('T')[0];
// }

// // Main processing function
// export const processAttendanceFiles = api<{}, { success: boolean; message: string }>(
//   { expose: true, method: "POST", path: "/attendance/process-files" },
//   async () => {
//     const processed = await loadProcessedFiles();
//     const session = await crmLogin();

//     if (!session) {
//       return { success: false, message: "Failed to log in to CRM." };
//     }

//     let files;
//     try {
//       files = await fs.readdir(config.ATTENDANCE_FOLDER);
//     } catch (error) {
//       console.error("Error reading attendance folder:", error);
//       return { success: false, message: "Failed to read attendance folder." };
//     }

//     const xlsxFiles = files.filter(f => f.endsWith(".xlsx"));

//     const STAFF_EMAILS: { [key: string]: string } = {"Prem Ladani": "premladani33453@gmail.com"};
//     const STAFF_WHATSAPP_NUMBERS: { [key: string]: string } = {"Prem Ladani": "9173178270"};

//     for (const file of xlsxFiles) {
//       const filePath = path.join(.ATTENDANCE_FOLDER, file);
//       if (processed.has(filePath)) {
//         console.log(`Skipping processed file ${file}`);
//         continue;
//       }

//       const date_str = extractDate(file);
//       let employees: EmployeeAttendance[] = [];
//       try {
//         employees = await readAttendance(filePath);
//       } catch (error) {
//         console.error(`Error reading attendance file ${file}:`, error);
//         continue;
//       }

//       for (const emp of employees) {
//         const crmResp = await uploadToCrm(session, emp, date_str);
//         console.log(`Uploaded ${emp["Staff Name"]} to CRM:`, crmResp);

//         const email = STAFF_EMAILS[emp["Staff Name"]];
//         if (email) {
//           const body = `Hello ${emp["Staff Name"]},\nAttendance for ${date_str}:\nLate: ${emp.late_minutes} min\nEarly leave: ${emp.early_minutes} min`;
//           await sendEmail({ to: email, subject: "Attendance Notification", body: body });
//         }

//         const whatsappNum = STAFF_WHATSAPP_NUMBERS[emp["Staff Name"]];
//         if (whatsappNum) {
//           const msg = `${emp["Staff Name"]}, your attendance on ${date_str}: In - ${emp["In-Time"]}, Out - ${emp["Out-Time"]}, Late - ${emp.late_minutes} min, Early - ${emp.early_minutes} min.`;
//           await sendWhatsApp({ to: whatsappNum, message: msg });
//         }
//       }

//       processed.add(filePath);
//       await saveProcessedFiles(processed);
//       console.log(`Processed and saved ${file}`);
//     }

//     return { success: true, message: "Attendance files processed successfully." };
//   }
// );

// // Add the new service to the attendance service
// // This file is already a service module through encore.dev/api

// services/attendance/process.ts

import { api } from "encore.dev/api";
import { promises as fs } from "fs";
import path from "path";
import ExcelJS from "exceljs";
import { sendEmail } from "../notification/send_email";
import { sendWhatsApp } from "../notification/send_whatsapp";
import { secret } from "encore.dev/config";

// --- Secrets ---
const ATTENDANCE_FOLDER = secret("ATTENDANCE_FOLDER");
const CRM_API_URL = secret("CRM_API_URL");
const CRM_USERNAME = secret("CRM_USERNAME");
const CRM_PASSWORD = secret("CRM_PASSWORD");

// --- Local file to track processed attendance files ---
const PROCESSED_FILE_PATH = "processed_files.json";

// --- Interfaces ---
interface EmployeeAttendance {
  "Staff Name": string;
  "In-Time": string | null;
  "Out-Time": string | null;
  late_minutes: number;
  early_minutes: number;
}

interface CrmLoginResponse {
  result?: {
    login?: {
      session: string;
    };
  };
}

interface CrmSaveRecordResponse {
  success: boolean;
  message?: string;
}

// --- Helpers ---
async function loadProcessedFiles(): Promise<Set<string>> {
  try {
    const data = await fs.readFile(PROCESSED_FILE_PATH, "utf-8");
    return new Set(JSON.parse(data));
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return new Set(); // File not found
    }
    console.error("Error loading processed files:", error);
    return new Set();
  }
}

async function saveProcessedFiles(files: Set<string>): Promise<void> {
  await fs.writeFile(PROCESSED_FILE_PATH, JSON.stringify(Array.from(files)));
}

async function crmLogin(): Promise<string | undefined> {
  const payload = new URLSearchParams({
    _operation: "loginAndFetchModules",
    username: CRM_USERNAME.toString(),
    password: CRM_PASSWORD.toString(),
  });

  try {
    const response = await fetch(CRM_API_URL.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload.toString(),
    });
    const data = (await response.json()) as CrmLoginResponse;
    return data.result?.login?.session;
  } catch (error) {
    console.error("CRM login failed:", error);
    return undefined;
  }
}

async function uploadToCrm(
  session: string,
  emp: EmployeeAttendance,
  date_str: string
): Promise<CrmSaveRecordResponse> {
  const data = {
    _operation: "saveRecord",
    _session: session,
    module: "Attendance",
    values: {
      name: emp["Staff Name"],
      date: new Date(date_str).toLocaleDateString("en-GB"),
      punch_in_time: emp["In-Time"] || "",
      punch_out_time: emp["Out-Time"] || "",
      late_minutes: emp.late_minutes || 0,
      early_minutes: emp.early_minutes || 0,
      assigned_user_id: "19x5",
    },
  };

  try {
    const response = await fetch(CRM_API_URL.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return (await response.json()) as CrmSaveRecordResponse;
  } catch (error) {
    console.error("Error uploading to CRM:", error);
    return { success: false, message: "Failed to upload to CRM" };
  }
}

async function readAttendance(filePath: string): Promise<EmployeeAttendance[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet("Details");
  const employees: EmployeeAttendance[] = [];

  if (worksheet) {
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const staffName = row.getCell(1).value?.toString() || "";
      const inTime = row.getCell(2).value;
      const outTime = row.getCell(3).value;
      const lateMinutes = parseFloat(row.getCell(4).value?.toString() || "0");
      const earlyMinutes = parseFloat(row.getCell(5).value?.toString() || "0");

      employees.push({
        "Staff Name": staffName,
        "In-Time": inTime
          ? new Date(inTime.toString()).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : null,
        "Out-Time": outTime
          ? new Date(outTime.toString()).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : null,
        late_minutes: lateMinutes,
        early_minutes: earlyMinutes,
      });
    });
  }
  return employees;
}

function extractDate(filename: string): string {
  const match = filename.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : new Date().toISOString().split("T")[0];
}

// --- Main API ---
export const processAttendanceFiles = api<{}, { success: boolean; message: string }>(
  { expose: true, method: "POST", path: "/attendance/process-files" },
  async () => {
    const processed = await loadProcessedFiles();
    const session = await crmLogin();

    if (!session) {
      return { success: false, message: "Failed to log in to CRM." };
    }

    let files: string[];
    try {
      files = await fs.readdir(ATTENDANCE_FOLDER.toString());
    } catch (error) {
      console.error("Error reading attendance folder:", error);
      return { success: false, message: "Failed to read attendance folder." };
    }

    const xlsxFiles = files.filter((f) => f.endsWith(".xlsx"));

    const STAFF_EMAILS: Record<string, string> = {
      "Prem Ladani": "premladani33453@gmail.com",
    };
    const STAFF_WHATSAPP_NUMBERS: Record<string, string> = {
      "Prem Ladani": "9173178270",
    };

    for (const file of xlsxFiles) {
      const filePath = path.join(ATTENDANCE_FOLDER.toString(), file);
      if (processed.has(filePath)) {
        console.log(`Skipping processed file ${file}`);
        continue;
      }

      const date_str = extractDate(file);
      let employees: EmployeeAttendance[] = [];
      try {
        employees = await readAttendance(filePath);
      } catch (error) {
        console.error(`Error reading attendance file ${file}:`, error);
        continue;
      }

      for (const emp of employees) {
        const crmResp = await uploadToCrm(session, emp, date_str);
        console.log(`Uploaded ${emp["Staff Name"]} to CRM:`, crmResp);

        const email = STAFF_EMAILS[emp["Staff Name"]];
        if (email) {
          const body = `Hello ${emp["Staff Name"]},\nAttendance for ${date_str}:\nLate: ${emp.late_minutes} min\nEarly leave: ${emp.early_minutes} min`;
          await sendEmail({ to: email, subject: "Attendance Notification", body });
        }

        const whatsappNum = STAFF_WHATSAPP_NUMBERS[emp["Staff Name"]];
        if (whatsappNum) {
          const msg = `${emp["Staff Name"]}, your attendance on ${date_str}: In - ${emp["In-Time"]}, Out - ${emp["Out-Time"]}, Late - ${emp.late_minutes} min, Early - ${emp.early_minutes} min.`;
          await sendWhatsApp({ to: whatsappNum, message: msg });
        }
      }

      processed.add(filePath);
      await saveProcessedFiles(processed);
      console.log(`Processed and saved ${file}`);
    }

    return { success: true, message: "Attendance files processed successfully." };
  }
);
