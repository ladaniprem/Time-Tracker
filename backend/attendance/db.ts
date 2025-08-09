import { SQLDatabase } from "encore.dev/storage/sqldb";

export const attendanceDB = new SQLDatabase("attendance", {
  migrations: "./migrations",
});
