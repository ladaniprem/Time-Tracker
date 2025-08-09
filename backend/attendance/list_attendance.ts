import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { attendanceDB } from "./db";
import type { AttendanceRecord } from "./record_attendance";

export interface ListAttendanceRequest {
  employeeId?: Query<number>;
  startDate?: Query<string>;
  endDate?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface AttendanceRecordWithEmployee extends AttendanceRecord {
  employeeName: string;
  employeeCode: string;
}

export interface ListAttendanceResponse {
  records: AttendanceRecordWithEmployee[];
  total: number;
}

// Retrieves attendance records with optional filtering and pagination.
export const listAttendance = api<ListAttendanceRequest, ListAttendanceResponse>(
  { expose: true, method: "GET", path: "/attendance" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    // Build the base query
    let query = `
      SELECT ar.id, ar.employee_id as "employeeId", ar.date, 
             ar.in_time as "inTime", ar.out_time as "outTime",
             ar.late_minutes as "lateMinutes", ar.early_minutes as "earlyMinutes", 
             ar.total_hours as "totalHours", ar.status, ar.notes,
             ar.created_at as "createdAt", ar.updated_at as "updatedAt",
             e.name as "employeeName", e.employee_id as "employeeCode"
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.id
    `;
    
    let countQuery = `
      SELECT COUNT(*) as count 
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.id
    `;
    
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    // Add conditions based on filters
    if (req.employeeId) {
      conditions.push(`ar.employee_id = $${paramIndex}`);
      params.push(req.employeeId);
      paramIndex++;
    }
    
    if (req.startDate) {
      conditions.push(`ar.date >= $${paramIndex}`);
      params.push(req.startDate);
      paramIndex++;
    }
    
    if (req.endDate) {
      conditions.push(`ar.date <= $${paramIndex}`);
      params.push(req.endDate);
      paramIndex++;
    }
    
    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }
    
    // Add ORDER BY and LIMIT/OFFSET
    query += ` ORDER BY ar.date DESC, ar.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    // Add limit and offset to params
    const queryParams = [...params, limit, offset];
    
    // Execute queries
    const records = await attendanceDB.rawQueryAll<AttendanceRecordWithEmployee>(query, ...queryParams);
    const countResult = await attendanceDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    
    return {
      records,
      total: countResult?.count || 0
    };
  }
);
