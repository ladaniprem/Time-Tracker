import { api } from "encore.dev/api";
import { db as attendanceDB } from "./db";
import { sendEmailIfEnabled } from "../notification/send_email";
import { sendWhatsAppIfEnabled } from "../notification/send_whatsapp";
import { getCurrentSystemSettings } from "../settings/system_settings";

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
    // Pre-check for duplicates to return a friendly error before insert
    const dup = await attendanceDB.queryRow<{ exists_email: boolean; exists_empid: boolean }>`
      SELECT
        EXISTS(SELECT 1 FROM employees WHERE email = ${req.email}) AS exists_email,
        EXISTS(SELECT 1 FROM employees WHERE employee_id = ${req.employeeId}) AS exists_empid
    `;
    if (dup?.exists_email) {
      throw new Error("An employee with this email already exists");
    }
    if (dup?.exists_empid) {
      throw new Error("An employee with this employeeId already exists");
    }

    let result: Employee | null = null;
    try {
      result = await attendanceDB.queryRow<Employee>`
        INSERT INTO employees (employee_id, name, email, phone, department, position)
        VALUES (${req.employeeId}, ${req.name}, ${req.email}, ${req.phone}, ${req.department}, ${req.position})
        RETURNING id, employee_id as "employeeId", name, email, phone, department, position, created_at as "createdAt", updated_at as "updatedAt"
      `;
    } catch (err: any) {
      // Fallback in case of race condition against unique constraints
      const msg = typeof err?.message === "string" ? err.message : "";
      if (msg.includes("employees_email_key")) {
        throw new Error("An employee with this email already exists");
      }
      if (msg.includes("employees_employee_id_key") || msg.includes("employee_id")) {
        throw new Error("An employee with this employeeId already exists");
      }
      throw err;
    }

    const employee = result!;

    // Fire-and-forget notifications (do not block the response)
    (async () => {
      try {
        const flags = getCurrentSystemSettings();
        if (flags.emailNotifications && employee.email) {
          await sendEmailIfEnabled(
            employee.email,
            `Welcome, ${employee.name}!`,
            `Hello ${employee.name}, your employee profile (${employee.employeeId}) has been created successfully.`
          );
        }
      } catch {}
      try {
        const flags = getCurrentSystemSettings();
        if (flags.whatsappNotifications && employee.phone) {
          await sendWhatsAppIfEnabled(
            employee.phone,
            `Hi ${employee.name}, your employee profile (${employee.employeeId}) has been created.`
          );
        }
      } catch {}
    })();

    return employee;
  }
);
