import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { Bucket } from "encore.dev/storage/objects";

const attendanceFolder = secret("ATTENDANCE_FOLDER");

// Create a bucket for storing attendance files
const attendanceFilesBucket = new Bucket("attendance-files");

export interface UploadAttendanceFileRequest {
  fileName: string;
  fileContent: string; // Base64 encoded file content
  fileType: string;
}

export interface UploadAttendanceFileResponse {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

// Uploads attendance files to the configured folder.
export const uploadAttendanceFile = api<UploadAttendanceFileRequest, UploadAttendanceFileResponse>(
  { expose: true, method: "POST", path: "/files/upload-attendance" },
  async (req) => {
    try {
      const folder = attendanceFolder();
      const fileName = `${folder}/${req.fileName}`;
      
      // Convert base64 to buffer
      const fileBuffer = Uint8Array.from(atob(req.fileContent), c => c.charCodeAt(0));
      
      // Upload to bucket
      const result = await attendanceFilesBucket.upload(fileName, Buffer.from(fileBuffer), {
        contentType: req.fileType
      });
      
      console.log(`Uploaded file: ${fileName}`);
      console.log(`File size: ${result.size} bytes`);
      
      return {
        success: true,
        fileUrl: fileName
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
);
