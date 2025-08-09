import { api } from "encore.dev/api";
import { attendanceDB } from "./db";

export interface RecordAttendanceRequest {
  employeeId: number;
  type: "in" | "out";
  timestamp?: Date;
  notes?: string;
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  date: Date;
  inTime?: Date;
  outTime?: Date;
  lateMinutes: number;
  earlyMinutes: number;
  totalHours: number;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Records attendance check-in or check-out for an employee.
export const recordAttendance = api<RecordAttendanceRequest, AttendanceRecord>(
  { expose: true, method: "POST", path: "/attendance/record" },
  async (req) => {
    const timestamp = req.timestamp || new Date();
    const date = new Date(timestamp.toDateString());
    
    // Get attendance settings
    const settings = await attendanceDB.queryRow<{
      workStartTime: string;
      workEndTime: string;
      lateThresholdMinutes: number;
      earlyLeaveThresholdMinutes: number;
    }>`
      SELECT work_start_time as "workStartTime", work_end_time as "workEndTime",
             late_threshold_minutes as "lateThresholdMinutes", 
             early_leave_threshold_minutes as "earlyLeaveThresholdMinutes"
      FROM attendance_settings WHERE id = 1
    `;
    
    if (!settings) {
      throw new Error("Attendance settings not found");
    }
    
    // Check if record exists for today
    const existingRecord = await attendanceDB.queryRow<AttendanceRecord>`
      SELECT id, employee_id as "employeeId", date, in_time as "inTime", out_time as "outTime",
             late_minutes as "lateMinutes", early_minutes as "earlyMinutes", 
             total_hours as "totalHours", status, notes,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM attendance_records 
      WHERE employee_id = ${req.employeeId} AND date = ${date}
    `;
    
    if (req.type === "in") {
      if (existingRecord && existingRecord.inTime) {
        throw new Error("Employee has already checked in today");
      }
      
      // Calculate late minutes
      const workStart = new Date(`${date.toDateString()} ${settings.workStartTime}`);
      const lateMinutes = timestamp > workStart ? 
        Math.floor((timestamp.getTime() - workStart.getTime()) / (1000 * 60)) : 0;
      
      if (existingRecord) {
        // Update existing record
        const result = await attendanceDB.queryRow<AttendanceRecord>`
          UPDATE attendance_records 
          SET in_time = ${timestamp}, late_minutes = ${lateMinutes}, 
              notes = ${req.notes}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${existingRecord.id}
          RETURNING id, employee_id as "employeeId", date, in_time as "inTime", out_time as "outTime",
                   late_minutes as "lateMinutes", early_minutes as "earlyMinutes", 
                   total_hours as "totalHours", status, notes,
                   created_at as "createdAt", updated_at as "updatedAt"
        `;
        return result!;
      } else {
        // Create new record
        const result = await attendanceDB.queryRow<AttendanceRecord>`
          INSERT INTO attendance_records (employee_id, date, in_time, late_minutes, notes)
          VALUES (${req.employeeId}, ${date}, ${timestamp}, ${lateMinutes}, ${req.notes})
          RETURNING id, employee_id as "employeeId", date, in_time as "inTime", out_time as "outTime",
                   late_minutes as "lateMinutes", early_minutes as "earlyMinutes", 
                   total_hours as "totalHours", status, notes,
                   created_at as "createdAt", updated_at as "updatedAt"
        `;
        return result!;
      }
    } else {
      // Check out
      if (!existingRecord || !existingRecord.inTime) {
        throw new Error("Employee must check in first");
      }
      
      if (existingRecord.outTime) {
        throw new Error("Employee has already checked out today");
      }
      
      // Calculate early leave minutes and total hours
      const workEnd = new Date(`${date.toDateString()} ${settings.workEndTime}`);
      const earlyMinutes = timestamp < workEnd ? 
        Math.floor((workEnd.getTime() - timestamp.getTime()) / (1000 * 60)) : 0;
      
      const totalHours = (timestamp.getTime() - existingRecord.inTime.getTime()) / (1000 * 60 * 60);
      
      const result = await attendanceDB.queryRow<AttendanceRecord>`
        UPDATE attendance_records 
        SET out_time = ${timestamp}, early_minutes = ${earlyMinutes}, 
            total_hours = ${totalHours}, notes = ${req.notes}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingRecord.id}
        RETURNING id, employee_id as "employeeId", date, in_time as "inTime", out_time as "outTime",
                 late_minutes as "lateMinutes", early_minutes as "earlyMinutes", 
                 total_hours as "totalHours", status, notes,
                 created_at as "createdAt", updated_at as "updatedAt"
      `;
      return result!;
    }
  }
);
