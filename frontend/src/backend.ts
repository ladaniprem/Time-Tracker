import Client, { Local } from "../encore-client";

// Determine backend base URL: Vite env overrides, else Encore local
export const BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || Local;

const backend = new Client(BASE_URL);

export default backend;

// Optionally re-export namespaces for types if needed by callers
export * from "../encore-client";


// Temporary helpers for endpoints not present in the generated client yet
export async function updateEmployee(params: {
  id: number;
  employeeId?: string;
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
}) {
  let resp = await fetch(`${BASE_URL}/employees/${params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      employeeId: params.employeeId,
      name: params.name,
      email: params.email,
      phone: params.phone,
      department: params.department,
      position: params.position,
    }),
  });
  if (!resp.ok) {
    const alt = await fetch(`${BASE_URL}/attendance/employees/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: params.employeeId,
        name: params.name,
        email: params.email,
        phone: params.phone,
        department: params.department,
        position: params.position,
      }),
    });
    if (!alt.ok) {
      const text = await alt.text();
      throw new Error(text || `Failed to update employee (${alt.status})`);
    }
    const altText = await alt.text();
    return altText ? JSON.parse(altText) : {};
  }
  const text = await resp.text();
  return text ? JSON.parse(text) : {};
}

export async function deleteEmployee(params: { id: number }) {
  let resp = await fetch(`${BASE_URL}/employees/${params.id}`, {
    method: "DELETE",
  });
  if (!resp.ok) {
    const alt = await fetch(`${BASE_URL}/attendance/employees/${params.id}`, { method: "DELETE" });
    if (!alt.ok) {
      const text = await alt.text();
      throw new Error(text || `Failed to delete employee (${alt.status})`);
    }
    const altText = await alt.text();
    return altText ? JSON.parse(altText) : {};
  }
  const text = await resp.text();
  return text ? JSON.parse(text) : {};
}


