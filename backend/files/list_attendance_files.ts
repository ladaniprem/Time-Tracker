import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { Bucket } from "encore.dev/storage/objects";

const attendanceFolder = secret("ATTENDANCE_FOLDER");
const attendanceFilesBucket = new Bucket("attendance-files");

export interface ListAttendanceFilesResponse {
  success: boolean;
  files: { name: string; size: number; etag: string }[];
  error?: string;
}

export const listAttendanceFiles = api<void, ListAttendanceFilesResponse>(
  { expose: true, method: "GET", path: "/files/attendance" },
  async () => {
    try {
      const folder = attendanceFolder();
      const files: { name: string; size: number; etag: string }[] = [];

      for await (const file of attendanceFilesBucket.list({ prefix: folder })) {
        files.push({
          name: file.name,
          size: file.size ?? 0,
          etag: file.etag ?? ""
        });
      }

      console.log(`Found ${files.length} files in folder: ${folder}`);

      return { success: true, files };
    } catch (error) {
      return {
        success: false,
        files: [],
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
);


// import { api } from "encore.dev/api";
// import { secret } from "encore.dev/config";
// import { Bucket } from "encore.dev/storage/objects";

// const attendanceFolder = secret("ATTENDANCE_FOLDER");

// // Reference the same bucket
// const attendanceFilesBucket = new Bucket("attendance-files");

// export interface ListAttendanceFilesResponse {
//   success: boolean;
//   files: {
//     name: string;
//     size: number;
//     etag: string;
//   }[];
//   error?: string;
// }

// // Lists all attendance files in the configured folder.
// export const listAttendanceFiles = api<void, ListAttendanceFilesResponse>(
//   { expose: true, method: "GET", path: "/files/attendance" },
//   async () => {
//     try {
//       const folder = attendanceFolder();
//       const files = [];
      
//       // List files with the folder prefix
//       for await (const file of attendanceFilesBucket.list({ prefix: folder })) {
//         files.push({
//           name: file.name,
//           size: file.size,
//           etag: file.etag
//         });
//       }
      
//       console.log(`Found ${files.length} files in folder: ${folder}`);
      
//       return {
//         success: true,
//         files
//       };
//     } catch (error) {
//       return {
//         success: false,
//         files: [],
//         error: error instanceof Error ? error.message : "Unknown error occurred"
//       };
//     }
//   }
// );
