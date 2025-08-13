// import { api } from "encore.dev/api";
// import { Query } from "encore.dev/api";
// import { db as attendanceDB } from "./db";
// import type { Employee } from "./create_employee";

// export interface ListEmployeesRequest {
//   limit?: Query<number>;
//   offset?: Query<number>;
//   department?: Query<string>;
// }

// export interface ListEmployeesResponse {
//   employees: Employee[];
//   total: number;
// }

// // Retrieves all employees with optional filtering and pagination.
// export const listEmployees = api<ListEmployeesRequest, ListEmployeesResponse>(
//   { expose: true, method: "GET", path: "/employees" },
//   async (req) => {
//     const limit = req.limit || 50;
//     const offset = req.offset || 0;
    
//     if (req.department) {
//       // Query with department filter
//       const employees = await attendanceDB.rawQueryAll<Employee>(
//         `SELECT id, employee_id as "employeeId", name, email, phone, department, position, 
//                 created_at as "createdAt", updated_at as "updatedAt"
//          FROM employees 
//          WHERE department = $1
//          ORDER BY name
//          LIMIT $2 OFFSET $3`,
//         req.department, limit, offset
//       );
      
//       const countResult = await attendanceDB.rawQueryRow<{ count: number }>(
//         `SELECT COUNT(*) as count FROM employees WHERE department = $1`,
//         req.department
//       );
      
//       console.log("Employees with department filter:", employees);
//       console.log("Employees without department filter:", employees);
//       return {
//         employees,
//         total: countResult?.count || 0
//       };
//     } else {
//       // Query without department filter
//       const employees = await attendanceDB.rawQueryAll<Employee>(
//         `SELECT id, employee_id as "employeeId", name, email, phone, department, position, 
//                 created_at as "createdAt", updated_at as "updatedAt"
//          FROM employees 
//          ORDER BY name
//          LIMIT $1 OFFSET $2`,
//         limit, offset
//       );
      
//       const countResult = await attendanceDB.queryRow<{ count: number }>`
//         SELECT COUNT(*) as count FROM employees
//       `;
      
//       return {
//         employees,
//         total: countResult?.count || 0
//       };
//     }
//   }
// );

import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { db as attendanceDB } from "./db";
import type { Employee } from "./create_employee";

export interface ListEmployeesRequest {
  limit?: Query<number>;
  offset?: Query<number>;
  department?: Query<string>;
}

export interface ListEmployeesResponse {
  employees: Employee[];
  total: number;
}

// Retrieves all employees with optional filtering and pagination.
export const listEmployees = api<ListEmployeesRequest, ListEmployeesResponse>(
  { expose: true, method: "GET", path: "/employees" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    if (req.department) {
      // Query with department filter
      const employees = await attendanceDB.rawQueryAll<Employee>(
        `SELECT id, employee_id as "employeeId", name, email, phone, department, position, 
                created_at as "createdAt", updated_at as "updatedAt"
         FROM employees 
         WHERE department = $1
         ORDER BY name
         LIMIT $2 OFFSET $3`,
        req.department, limit, offset
      );
      
      const countResult = await attendanceDB.rawQueryRow<{ count: number }>(
        `SELECT COUNT(*) as count FROM employees WHERE department = $1`,
        req.department
      );
      
      return {
        employees,
        total: countResult?.count || 0
      };
    } else {
      // Query without department filter
      const employees = await attendanceDB.rawQueryAll<Employee>(
        `SELECT id, employee_id as "employeeId", name, email, phone, department, position, 
                created_at as "createdAt", updated_at as "updatedAt"
         FROM employees 
         ORDER BY name
         LIMIT $1 OFFSET $2`,
        limit, offset
      );
      
      const countResult = await attendanceDB.queryRow<{ count: number }>`
        SELECT COUNT(*) as count FROM employees
      `;
      
      return {
        employees,
        total: countResult?.count || 0
      };
    }
  }
);
