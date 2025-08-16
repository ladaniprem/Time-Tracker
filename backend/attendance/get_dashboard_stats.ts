import { api } from "encore.dev/api";
import { db as attendanceDB } from "./db";

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  averageWorkingHours: number;
}

// Retrieves dashboard statistics for today's attendance.
export const getDashboardStats = api<void, DashboardStats>(
  { expose: true, method: "GET", path: "/dashboard/stats" },
  async () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Total employees
    const totalEmployeesResult = await attendanceDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM employees
    `;
    
    // Present today (employees with check-in)
    const presentTodayResult = await attendanceDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count 
      FROM attendance_records 
      WHERE date = ${today} AND in_time IS NOT NULL
    `;
    
    // Late today (employees with late_minutes > 0)
    const lateTodayResult = await attendanceDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count 
      FROM attendance_records 
      WHERE date = ${today} AND late_minutes > 0
    `;
    
    // Average working hours for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    
    const avgHoursResult = await attendanceDB.queryRow<{ avg: number }>`
      SELECT AVG(total_hours) as avg 
      FROM attendance_records 
      WHERE date >= ${sevenDaysAgoStr} AND total_hours > 0
    `;
    
    const totalEmployees = totalEmployeesResult?.count || 0;
    const presentToday = presentTodayResult?.count || 0;
    const lateToday = lateTodayResult?.count || 0;
    const absentToday = totalEmployees - presentToday;
    
    return {
      totalEmployees,
      presentToday,
      lateToday,
      absentToday,
      averageWorkingHours: Math.round((avgHoursResult?.avg || 0) * 100) / 100
    };
  }
);

// import { api } from "encore.dev/api";
// import { db as attendanceDB } from "./db";

// export interface DashboardStats {
//   totalEmployees: number;
//   presentToday: number;
//   lateToday: number;
//   absentToday: number;
//   averageWorkingHours: number;
// }

// // Retrieves dashboard statistics for today's attendance.
// export const getDashboardStats = api<void, DashboardStats>(
//   { expose: true, method: "GET", path: "/dashboard/stats" },
//   async () => {
//     const today = new Date().toISOString().split('T')[0];
    
//     // Total employees
//     const totalEmployeesResult = await attendanceDB.queryRow<{ count: number }>`
//       SELECT COUNT(*) as count FROM employees
//     `;
    
//     // Present today (employees with check-in)
//     const presentTodayResult = await attendanceDB.queryRow<{ count: number }>`
//       SELECT COUNT(*) as count 
//       FROM attendance_records 
//       WHERE date = ${today} AND in_time IS NOT NULL
//     `;
    
//     // Late today (employees with late_minutes > 0)
//     const lateTodayResult = await attendanceDB.queryRow<{ count: number }>`
//       SELECT COUNT(*) as count 
//       FROM attendance_records 
//       WHERE date = ${today} AND late_minutes > 0
//     `;
    
//     // Average working hours for the last 7 days
//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
//     const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    
//     const avgHoursResult = await attendanceDB.queryRow<{ avg: number }>`
//       SELECT AVG(total_hours) as avg 
//       FROM attendance_records 
//       WHERE date >= ${sevenDaysAgoStr} AND total_hours > 0
//     `;
    
//     const totalEmployees = totalEmployeesResult?.count || 0;
//     const presentToday = presentTodayResult?.count || 0;
//     const lateToday = lateTodayResult?.count || 0;
//     const absentToday = totalEmployees - presentToday;
    
//     return {
//       totalEmployees,
//       presentToday,
//       lateToday,
//       absentToday,
//       averageWorkingHours: Math.round((avgHoursResult?.avg || 0) * 100) / 100
//     };
//   }
// );
