import { Service } from "encore.dev/service";


export const config = {
};

// Ensure all attendance APIs are loaded and exposed under this service
export * from "./create_employee";
export * from "./list_employees";
export * from "./record_attendance";
export * from "./list_attendance";
export * from "./get_dashboard_stats";
export * from "./get_user_attendance";
export * from "./process_attendance_files";
export default new Service("attendance");