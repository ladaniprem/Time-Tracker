import { Service } from "encore.dev/service";


export const config = {
  ATTENDANCE_FOLDER: "past_files",
  CRM_API_URL: "https://ecs.targetcrm.co.in/modules/Mobile/api.php",
  CRM_USERNAME: "ecsapi",
  CRM_PASSWORD: "123456",
  INTERAKT_API_KEY: "OHZVa1VIQkt6cFliTmRpc3NDWXM2dWd6Q0U0LTZUQTZBbFREWHlab2I2UTo=",
  SENDER_WHATSAPP_NUMBER: "8160017115",
  SMTP_SERVER: "smtp.gmail.com",
  SMTP_PORT: 587,
  SENDER_EMAIL: "dcp6996@gmail.com",
  SENDER_PASSWORD: "oxghfwezxzqoiaqp",
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