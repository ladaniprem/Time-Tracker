import { api } from "encore.dev/api";
import { attendanceDB } from "../attendance/db";

export interface AttendanceSettings {
  id: number;
  workStartTime: string;
  workEndTime: string;
  lateThresholdMinutes: number;
  earlyLeaveThresholdMinutes: number;
  workingDaysPerWeek: number;
  weekendDays: string[];
  holidayDates: string[];
  overtimeEnabled: boolean;
  overtimeRate: number;
  breakDurationMinutes: number;
  updatedAt: Date;
}

export interface UpdateAttendanceSettingsRequest {
  workStartTime: string;
  workEndTime: string;
  lateThresholdMinutes: number;
  earlyLeaveThresholdMinutes: number;
  workingDaysPerWeek: number;
  weekendDays: string[];
  holidayDates: string[];
  overtimeEnabled: boolean;
  overtimeRate: number;
  breakDurationMinutes: number;
}

// Retrieves current attendance settings.
export const getAttendanceSettings = api<void, AttendanceSettings>(
  { expose: true, method: "GET", path: "/settings/attendance" },
  async () => {
    const settings = await attendanceDB.queryRow<{
      id: number;
      workStartTime: string;
      workEndTime: string;
      lateThresholdMinutes: number;
      earlyLeaveThresholdMinutes: number;
      updatedAt: Date;
    }>`
      SELECT id, work_start_time as "workStartTime", work_end_time as "workEndTime",
             late_threshold_minutes as "lateThresholdMinutes", 
             early_leave_threshold_minutes as "earlyLeaveThresholdMinutes",
             updated_at as "updatedAt"
      FROM attendance_settings WHERE id = 1
    `;

    if (!settings) {
      throw new Error("Attendance settings not found");
    }

    // Return settings with default values for fields not in database
    return {
      id: settings.id,
      workStartTime: settings.workStartTime,
      workEndTime: settings.workEndTime,
      lateThresholdMinutes: settings.lateThresholdMinutes,
      earlyLeaveThresholdMinutes: settings.earlyLeaveThresholdMinutes,
      workingDaysPerWeek: 5,
      weekendDays: ['Saturday', 'Sunday'],
      holidayDates: [],
      overtimeEnabled: false,
      overtimeRate: 1.5,
      breakDurationMinutes: 60,
      updatedAt: settings.updatedAt
    };
  }
);

// Updates attendance settings.
export const updateAttendanceSettings = api<UpdateAttendanceSettingsRequest, AttendanceSettings>(
  { expose: true, method: "PUT", path: "/settings/attendance" },
  async (req) => {
    const result = await attendanceDB.queryRow<{
      id: number;
      workStartTime: string;
      workEndTime: string;
      lateThresholdMinutes: number;
      earlyLeaveThresholdMinutes: number;
      updatedAt: Date;
    }>`
      UPDATE attendance_settings 
      SET work_start_time = ${req.workStartTime},
          work_end_time = ${req.workEndTime},
          late_threshold_minutes = ${req.lateThresholdMinutes},
          early_leave_threshold_minutes = ${req.earlyLeaveThresholdMinutes},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
      RETURNING id, work_start_time as "workStartTime", work_end_time as "workEndTime",
               late_threshold_minutes as "lateThresholdMinutes", 
               early_leave_threshold_minutes as "earlyLeaveThresholdMinutes",
               updated_at as "updatedAt"
    `;

    if (!result) {
      throw new Error("Failed to update attendance settings");
    }

    // Return updated settings with the request values for fields not in database
    return {
      id: result.id,
      workStartTime: result.workStartTime,
      workEndTime: result.workEndTime,
      lateThresholdMinutes: result.lateThresholdMinutes,
      earlyLeaveThresholdMinutes: result.earlyLeaveThresholdMinutes,
      workingDaysPerWeek: req.workingDaysPerWeek,
      weekendDays: req.weekendDays,
      holidayDates: req.holidayDates,
      overtimeEnabled: req.overtimeEnabled,
      overtimeRate: req.overtimeRate,
      breakDurationMinutes: req.breakDurationMinutes,
      updatedAt: result.updatedAt
    };
  }
);
