// import { SQLDatabase } from "encore.dev/storage/sqldb";


// export const attendanceDB = new SQLDatabase("attendance", {
//   migrations: "./migrations",
 
// });
import { SQLDatabase } from "encore.dev/storage/sqldb";
import {config} from "./encore.service";


// Declare the DB with migrations folder
export const db = new SQLDatabase("attendance", {
  migrations: "./migrations",

});

