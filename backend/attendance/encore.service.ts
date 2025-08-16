import { Service } from "encore.dev/service";


export const config = {

};

export * from "./get_user_attendance";
export * from "./process_attendance_files";
export default new Service("attendance");