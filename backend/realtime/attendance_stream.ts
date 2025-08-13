import { api, StreamOut } from "encore.dev/api";
import { db } from "../attendance/db";
import { config } from "../attendance/encore.service";

export interface AttendanceUpdate {
  type: "checkin" | "checkout" | "update";
  employeeId: number;
  employeeName: string;
  timestamp: string; // safer as string for JSON
  data: any;
}

export interface RealtimeHandshake {
  userId: string;
}

const connectedStreams: Set<StreamOut<AttendanceUpdate>> = new Set();

export const attendanceUpdates = api.streamOut<RealtimeHandshake, AttendanceUpdate>(
  { expose: true, path: "/realtime/attendance" },
  async (handshake, stream) => {
    console.log(`User ${handshake.userId} connected to attendance stream`);
    connectedStreams.add(stream);

    const keepAlive = setInterval(() => {
      stream.send({
        type: "update",
        employeeId: -1,
        employeeName: "heartbeat",
        timestamp: new Date().toISOString(),
        data: null
      }).catch(() => {});
    }, 30000);

    // Set onClose immediately to avoid missing the event
    stream.close = async () => {
      clearInterval(keepAlive);
      connectedStreams.delete(stream);
      console.log(`User ${handshake.userId} disconnected from attendance stream`);
    };

    // Keep open forever until closed
    await new Promise<void>(() => {});
  }
);

export const broadcastAttendanceUpdate = api<AttendanceUpdate, { success: boolean }>(
  { expose: true, method: "POST", path: "/realtime/broadcast" },
  async (update) => {
    console.log(`Broadcasting attendance update for employee ${update.employeeName}`);
    
    for (const stream of connectedStreams) {
      try {
        await stream.send(update);
      } catch (error) {
        console.error("Failed to send update to stream:", error);
        connectedStreams.delete(stream);
      }
    }

    return { success: true };
  }
);
