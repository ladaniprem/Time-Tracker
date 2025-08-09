import { api } from "encore.dev/api";


import { attendanceDB } from "./db";

export interface CreateEmployeeRequest {
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
}

export interface Employee {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new employee record.
export const createEmployee = api<CreateEmployeeRequest, Employee>(
  { expose: true, method: "POST", path: "/employees" },
  async (req) => {
    const result = await attendanceDB.queryRow<Employee>`
      INSERT INTO employees (employee_id, name, email, phone, department, position)
      VALUES (${req.employeeId}, ${req.name}, ${req.email}, ${req.phone}, ${req.department}, ${req.position})
      RETURNING id, employee_id as "employeeId", name, email, phone, department, position, created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    return result!;
  }
);
