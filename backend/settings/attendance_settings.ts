// // import { api } from "encore.dev/api";
// // import { db as attendanceDB } from "../attendance/db";

// // export interface AttendanceSettings {
// //   id: number;
// //   workStartTime: string;
// //   workEndTime: string;
// //   lateThresholdMinutes: number;
// //   earlyLeaveThresholdMinutes: number;
// //   workingDaysPerWeek: number;
// //   weekendDays: string[];
// //   holidayDates: string[];
// //   overtimeEnabled: boolean;
// //   overtimeRate: number;
// //   breakDurationMinutes: number;
// //   updatedAt: Date;
// // }

// // export interface UpdateAttendanceSettingsRequest {
// //   workStartTime: string;
// //   workEndTime: string;
// //   lateThresholdMinutes: number;
// //   earlyLeaveThresholdMinutes: number;
// //   workingDaysPerWeek: number;
// //   weekendDays: string[];
// //   holidayDates: string[];
// //   overtimeEnabled: boolean;
// //   overtimeRate: number;
// //   breakDurationMinutes: number;
// // }

// // // Retrieves current attendance settings.
// // export const getAttendanceSettings = api<void, AttendanceSettings>(
// //   { expose: true, method: "GET", path: "/settings/attendance" },
// //   async () => {
// //     const settings = await attendanceDB.queryRow<{
// //       id: number;
// //       workStartTime: string;
// //       workEndTime: string;
// //       lateThresholdMinutes: number;
// //       earlyLeaveThresholdMinutes: number;
// //       updatedAt: Date;
// //     }>`
// //       SELECT id, work_start_time as "workStartTime", work_end_time as "workEndTime",
// //              late_threshold_minutes as "lateThresholdMinutes", 
// //              early_leave_threshold_minutes as "earlyLeaveThresholdMinutes",
// //              updated_at as "updatedAt"
// //       FROM attendance_settings WHERE id = 1
// //     `;

// //     if (!settings) {
// //       throw new Error("Attendance settings not found");
// //     }

// //     // Return settings with default values for fields not in database
// //     return {
// //       id: settings.id,
// //       workStartTime: settings.workStartTime,
// //       workEndTime: settings.workEndTime,
// //       lateThresholdMinutes: settings.lateThresholdMinutes,
// //       earlyLeaveThresholdMinutes: settings.earlyLeaveThresholdMinutes,
// //       workingDaysPerWeek: 5,
// //       weekendDays: ['Saturday', 'Sunday'],
// //       holidayDates: [],
// //       overtimeEnabled: false,
// //       overtimeRate: 1.5,
// //       breakDurationMinutes: 60,
// //       updatedAt: settings.updatedAt
// //     };
// //   }
// // );

// // // Updates attendance settings.
// // export const updateAttendanceSettings = api<UpdateAttendanceSettingsRequest, AttendanceSettings>(
// //   { expose: true, method: "PUT", path: "/settings/attendance" },
// //   async (req) => {
// //     const result = await attendanceDB.queryRow<{
// //       id: number;
// //       workStartTime: string;
// //       workEndTime: string;
// //       lateThresholdMinutes: number;
// //       earlyLeaveThresholdMinutes: number;
// //       updatedAt: Date;
// //     }>`
// //       UPDATE attendance_settings 
// //       SET work_start_time = ${req.workStartTime},
// //           work_end_time = ${req.workEndTime},
// //           late_threshold_minutes = ${req.lateThresholdMinutes},
// //           early_leave_threshold_minutes = ${req.earlyLeaveThresholdMinutes},
// //           updated_at = CURRENT_TIMESTAMP
// //       WHERE id = 1
// //       RETURNING id, work_start_time as "workStartTime", work_end_time as "workEndTime",
// //                late_threshold_minutes as "lateThresholdMinutes", 
// //                early_leave_threshold_minutes as "earlyLeaveThresholdMinutes",
// //                updated_at as "updatedAt"
// //     `;

// //     if (!result) {
// //       throw new Error("Failed to update attendance settings");
// //     }

// //     // Return updated settings with the request values for fields not in database
// //     return {
// //       id: result.id,
// //       workStartTime: result.workStartTime,
// //       workEndTime: result.workEndTime,
// //       lateThresholdMinutes: result.lateThresholdMinutes,
// //       earlyLeaveThresholdMinutes: result.earlyLeaveThresholdMinutes,
// //       workingDaysPerWeek: req.workingDaysPerWeek,
// //       weekendDays: req.weekendDays,
// //       holidayDates: req.holidayDates,
// //       overtimeEnabled: req.overtimeEnabled,
// //       overtimeRate: req.overtimeRate,
// //       breakDurationMinutes: req.breakDurationMinutes,
// //       updatedAt: result.updatedAt
// //     };
// //   }
// // );

// import { api } from "encore.dev/api";
// import { db as attendanceDB } from "../attendance/db";

// export interface AttendanceSettings {
//   id: number;
//   workStartTime: string;
//   workEndTime: string;
//   lateThresholdMinutes: number;
//   earlyLeaveThresholdMinutes: number;
//   workingDaysPerWeek: number;
//   weekendDays: string[];
//   holidayDates: string[];
//   overtimeEnabled: boolean;
//   overtimeRate: number;
//   breakDurationMinutes: number;
//   updatedAt: Date;
// }

// export interface UpdateAttendanceSettingsRequest {
//   workStartTime: string;
//   workEndTime: string;
//   lateThresholdMinutes: number;
//   earlyLeaveThresholdMinutes: number;
//   workingDaysPerWeek: number;
//   weekendDays: string[];
//   holidayDates: string[];
//   overtimeEnabled: boolean;
//   overtimeRate: number;
//   breakDurationMinutes: number;
// }


// // --- GET: Retrieve current attendance settings ---
// export const getAttendanceSettings = api<void, AttendanceSettings>(
//   { expose: true, method: "GET", path: "/settings/attendance" },
//   async () => {
//     const settings = await attendanceDB.queryRow<{
//       id: number;
//       workStartTime: string;
//       workEndTime: string;
//       lateThresholdMinutes: number;
//       earlyLeaveThresholdMinutes: number;
//       updatedAt: Date;
//     }>`
//       SELECT id, work_start_time as "workStartTime", work_end_time as "workEndTime",
//              late_threshold_minutes as "lateThresholdMinutes", 
//              early_leave_threshold_minutes as "earlyLeaveThresholdMinutes",
//              updated_at as "updatedAt"
//       FROM attendance_settings WHERE id = 1
//     `;

//     if (!settings) {
//       throw new Error("Attendance settings not found");
//     }

//     return {
//       id: settings.id,
//       workStartTime: settings.workStartTime,
//       workEndTime: settings.workEndTime,
//       lateThresholdMinutes: settings.lateThresholdMinutes,
//       earlyLeaveThresholdMinutes: settings.earlyLeaveThresholdMinutes,
//       workingDaysPerWeek: 5,
//       weekendDays: ["Saturday", "Sunday"],
//       holidayDates: [],
//       overtimeEnabled: false,
//       overtimeRate: 1.5,
//       breakDurationMinutes: 60,
//       updatedAt: settings.updatedAt,
//     };
//   }
// );

// // --- PUT: Update attendance settings ---
// export const updateAttendanceSettings = api<
//   UpdateAttendanceSettingsRequest,
//   AttendanceSettings
// >(
//   { expose: true, method: "PUT", path: "/settings/attendance" },
//   async (req) => {
//     const result = await attendanceDB.queryRow<{
//       id: number;
//       workStartTime: string;
//       workEndTime: string;
//       lateThresholdMinutes: number;
//       earlyLeaveThresholdMinutes: number;
//       updatedAt: Date;
//     }>`
//       UPDATE attendance_settings 
//       SET work_start_time = ${req.workStartTime},
//           work_end_time = ${req.workEndTime},
//           late_threshold_minutes = ${req.lateThresholdMinutes},
//           early_leave_threshold_minutes = ${req.earlyLeaveThresholdMinutes},
//           updated_at = CURRENT_TIMESTAMP
//       WHERE id = 1
//       RETURNING id, work_start_time as "workStartTime", work_end_time as "workEndTime",
//                late_threshold_minutes as "lateThresholdMinutes", 
//                early_leave_threshold_minutes as "earlyLeaveThresholdMinutes",
//                updated_at as "updatedAt"
//     `;

//     if (!result) {
//       throw new Error("Failed to update attendance settings");
//     }

//     return {
//       id: result.id,
//       workStartTime: result.workStartTime,
//       workEndTime: result.workEndTime,
//       lateThresholdMinutes: result.lateThresholdMinutes,
//       earlyLeaveThresholdMinutes: result.earlyLeaveThresholdMinutes,
//       workingDaysPerWeek: req.workingDaysPerWeek,
//       weekendDays: req.weekendDays,
//       holidayDates: req.holidayDates,
//       overtimeEnabled: req.overtimeEnabled,
//       overtimeRate: req.overtimeRate,
//       breakDurationMinutes: req.breakDurationMinutes,
//       updatedAt: result.updatedAt,
//     };
//   }
// );


import { api } from "encore.dev/api";
import { db } from "../attendance/db";

// =====================
// Request/Response Types
// =====================
export interface UpdateAttendanceSettingsRequest {
  workStartTime: string;
  workEndTime: string;
  lateThresholdMinutes: number;
  earlyLeaveThresholdMinutes: number;
  workingDaysPerWeek: number;
  weekendDays: string[];
  holidayDates: string[]; // store as ISO date strings
  overtimeEnabled: boolean;
  overtimeRate: number;
  breakDurationMinutes: number;
}

export interface AttendanceSettings extends UpdateAttendanceSettingsRequest {
  id: number;
  updatedAt: Date;
}

// =====================
// DB Connection: use db directly
// =====================

// =====================
// Update Attendance Settings
// =====================
export const updateAttendanceSettings = api<
  UpdateAttendanceSettingsRequest,
  AttendanceSettings
>(
  { expose: true, method: "PUT", path: "/settings/attendance" },
  async (req: UpdateAttendanceSettingsRequest): Promise<AttendanceSettings> => {
    const result = await db.queryRow<AttendanceSettings>`
      UPDATE attendance_settings
      SET work_start_time = ${req.workStartTime}::time,
          work_end_time = ${req.workEndTime}::time,
          late_threshold_minutes = ${req.lateThresholdMinutes},
          early_leave_threshold_minutes = ${req.earlyLeaveThresholdMinutes},
          working_days_per_week = ${req.workingDaysPerWeek},
          weekend_days = ${req.weekendDays}::text[],
          holiday_dates = ${req.holidayDates}::date[],
          overtime_enabled = ${req.overtimeEnabled},
          overtime_rate = ${req.overtimeRate},
          break_duration_minutes = ${req.breakDurationMinutes},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
      RETURNING id,
                work_start_time as "workStartTime",
                work_end_time as "workEndTime",
                late_threshold_minutes as "lateThresholdMinutes",
                early_leave_threshold_minutes as "earlyLeaveThresholdMinutes",
                working_days_per_week as "workingDaysPerWeek",
                weekend_days as "weekendDays",
                holiday_dates as "holidayDates",
                overtime_enabled as "overtimeEnabled",
                overtime_rate as "overtimeRate",
                break_duration_minutes as "breakDurationMinutes",
                updated_at as "updatedAt"
    `;
    if (!result) {
      throw new Error("Failed to update attendance settings");
    }
    return result;
  }
);

// =====================
// Get Attendance Settings
// =====================
export const getAttendanceSettings = api<{}, AttendanceSettings>(
  { expose: true, method: "GET", path: "/settings/attendance" },
  async () => {
    const result = await db.queryRow<AttendanceSettings>`
      SELECT id,
             work_start_time as "workStartTime",
             work_end_time::time as "workEndTime",
             late_threshold_minutes as "lateThresholdMinutes",
             early_leave_threshold_minutes as "earlyLeaveThresholdMinutes",
             working_days_per_week as "workingDaysPerWeek",
             weekend_days as "weekendDays",
             holiday_dates as "holidayDates",
             overtime_enabled as "overtimeEnabled",
             overtime_rate as "overtimeRate",
             break_duration_minutes as "breakDurationMinutes",
             updated_at as "updatedAt"
      FROM attendance_settings
      WHERE id = 1
    `;
    if (!result) {
      throw new Error("Attendance settings not found");
    }
    return result;
  }
);
