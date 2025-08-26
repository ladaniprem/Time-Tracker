import { api } from "encore.dev/api";
import { db as attendanceDB } from "./db";
import { sendEmailIfEnabled } from "../notification/send_email";

export interface DeleteEmployeeRequest {
  id: number;
}

export interface DeleteEmployeeResponse {
  success: boolean;
  message: string;
  deletedEmployeeId?: string;
}

// Deletes an employee record and all associated attendance records.
export const deleteEmployee = api<DeleteEmployeeRequest, DeleteEmployeeResponse>(
  { expose: true, method: "DELETE", path: "/employees/:id" },
  async (req) => {
    // Check if employee exists and get their details
    const existingEmployee = await attendanceDB.queryRow<{ id: number; employeeId: string; name: string; email: string | null }>`
      SELECT id, employee_id as "employeeId", name, email
      FROM employees WHERE id = ${req.id}
    `;
    
    if (!existingEmployee) {
      throw new Error("Employee not found");
    }

    try {
      // Delete the employee (attendance records will be cascaded due to ON DELETE CASCADE)
      await attendanceDB.query`
        DELETE FROM employees WHERE id = ${req.id}
      `;
      // Fire-and-forget email notification
      (async () => {
        try {
          if (existingEmployee.email) {
            await sendEmailIfEnabled(
              existingEmployee.email,
              `Employee profile deleted (${existingEmployee.employeeId})`,
              `Hello ${existingEmployee.name}, your employee profile (${existingEmployee.employeeId}) has been removed from the system. If you believe this is a mistake, please contact support.`,
              false
            );
          }
        } catch {}
      })();

      return {
        success: true,
        message: `Employee ${existingEmployee.name} (${existingEmployee.employeeId}) has been deleted successfully.`,
        deletedEmployeeId: existingEmployee.employeeId
      };
    } catch (err: any) {
      console.error('Failed to delete employee:', err);
      throw new Error("Failed to delete employee. Please try again.");
    }
  }
);
