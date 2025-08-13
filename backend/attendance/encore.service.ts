import { Service } from "encore.dev/service";


export * from "./get_user_attendance";
export * from "./process_attendance_files";
// export { config };

export default new Service("attendance");