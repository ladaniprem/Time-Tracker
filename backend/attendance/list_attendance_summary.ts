import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { db as attendanceDB } from "./db";

export interface AttendanceEmployeeSummaryRequest {
  employeeId?: Query<number>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface AttendanceEmployeeSummaryItem {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  total: number;
}

export interface AttendanceEmployeeSummaryResponse {
  summaries: AttendanceEmployeeSummaryItem[];
  total: number;
}

// Lists employees who have attendance records, including total records per employee
export const listAttendanceEmployeeSummary = api<AttendanceEmployeeSummaryRequest, AttendanceEmployeeSummaryResponse>(
  { expose: true, method: "GET", path: "/attendance/summary" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    const base = `
      FROM employees e
      JOIN attendance_records ar ON ar.employee_id = e.id
    `;

    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (req.employeeId) {
      conditions.push(`e.id = $${idx++}`);
      params.push(req.employeeId);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const dataQuery = `
      SELECT e.id as "employeeId", e.employee_id as "employeeCode", e.name as "employeeName", COUNT(ar.id) as total
      ${base}
      ${where}
      GROUP BY e.id, e.employee_id, e.name
      ORDER BY e.name
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as count FROM (
        SELECT e.id
        ${base}
        ${where}
        GROUP BY e.id
      ) t
    `;

    const summaries = await attendanceDB.rawQueryAll<AttendanceEmployeeSummaryItem>(dataQuery, ...params, limit, offset);
    const countResult = await attendanceDB.rawQueryRow<{ count: number }>(countQuery, ...params);

    return {
      summaries,
      total: countResult?.count || 0,
    };
  }
);


