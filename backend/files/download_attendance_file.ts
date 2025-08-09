import { api } from "encore.dev/api";
import { Bucket } from "encore.dev/storage/objects";

// Reference the same bucket
const attendanceFilesBucket = new Bucket("attendance-files");

export interface DownloadAttendanceFileRequest {
  fileName: string;
}

export interface DownloadAttendanceFileResponse {
  success: boolean;
  fileContent?: string; // Base64 encoded file content
  contentType?: string;
  error?: string;
}

// Downloads an attendance file from storage.
export const downloadAttendanceFile = api<DownloadAttendanceFileRequest, DownloadAttendanceFileResponse>(
  { expose: true, method: "POST", path: "/files/download-attendance" },
  async (req) => {
    try {
      // Check if file exists
      const exists = await attendanceFilesBucket.exists(req.fileName);
      if (!exists) {
        return {
          success: false,
          error: "File not found"
        };
      }
      
      // Get file attributes
      const attrs = await attendanceFilesBucket.attrs(req.fileName);
      
      // Download file content
      const fileBuffer = await attendanceFilesBucket.download(req.fileName);
      
      // Convert to base64
      const fileContent = fileBuffer.toString('base64');
      
      console.log(`Downloaded file: ${req.fileName}`);
      console.log(`File size: ${attrs.size} bytes`);
      
      return {
        success: true,
        fileContent,
        contentType: attrs.contentType
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
);
