import { api } from "encore.dev/api";
import { db as attendanceDB } from "./db";

export interface UpdateEmployeeRequest {
  id: number;
  employeeId?: string;
  name?: string;
  email?: string;
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

// Updates an existing employee record.
export const updateEmployee = api<UpdateEmployeeRequest, Employee>(
  { expose: true, method: "PUT", path: "/employees/:id" },
  async (req) => {
    // Check if employee exists
    const existingEmployee = await attendanceDB.queryRow<Employee>`
      SELECT id, employee_id as "employeeId", name, email, phone, department, position, created_at as "createdAt", updated_at as "updatedAt"
      FROM employees WHERE id = ${req.id}
    `;
    
    if (!existingEmployee) {
      throw new Error("Employee not found");
    }

    // If updating email or employeeId, check for duplicates
    if (req.email && req.email !== existingEmployee.email) {
      const emailExists = await attendanceDB.queryRow<{ exists: boolean }>`
        SELECT EXISTS(SELECT 1 FROM employees WHERE email = ${req.email} AND id != ${req.id}) AS exists
      `;
      if (emailExists?.exists) {
        throw new Error("An employee with this email already exists");
      }
    }

    if (req.employeeId && req.employeeId !== existingEmployee.employeeId) {
      const employeeIdExists = await attendanceDB.queryRow<{ exists: boolean }>`
        SELECT EXISTS(SELECT 1 FROM employees WHERE employee_id = ${req.employeeId} AND id != ${req.id}) AS exists
      `;
      if (employeeIdExists?.exists) {
        throw new Error("An employee with this employee ID already exists");
      }
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (req.employeeId !== undefined) {
      updateFields.push(`employee_id = $${paramIndex++}`);
      updateValues.push(req.employeeId);
    }
    if (req.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(req.name);
    }
    if (req.email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(req.email);
    }
    if (req.phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      updateValues.push(req.phone);
    }
    if (req.department !== undefined) {
      updateFields.push(`department = $${paramIndex++}`);
      updateValues.push(req.department);
    }
    if (req.position !== undefined) {
      updateFields.push(`position = $${paramIndex++}`);
      updateValues.push(req.position);
    }

    if (updateFields.length === 0) {
      throw new Error("No fields to update");
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add employee id for WHERE clause
    updateValues.push(req.id);

    const updateQuery = `
      UPDATE employees 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, employee_id as "employeeId", name, email, phone, department, position, created_at as "createdAt", updated_at as "updatedAt"
    `;

    try {
      const result = await attendanceDB.queryRow<Employee>(updateQuery, ...updateValues);
      if (!result) {
        throw new Error("Failed to update employee");
      }
      return result;
    } catch (err: any) {
      const msg = typeof err?.message === "string" ? err.message : "";
      if (msg.includes("employees_email_key")) {
        throw new Error("An employee with this email already exists");
      }
      if (msg.includes("employees_employee_id_key")) {
        throw new Error("An employee with this employee ID already exists");
      }
      throw err;
    }
  }
);
