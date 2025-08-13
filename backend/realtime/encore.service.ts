 import { Service } from "encore.dev/service";

 export default new Service("realtime");
// const es = new EventSource("/realtime/attendance?userId=123");

// es.onmessage = (e) => console.log("Update:", JSON.parse(e.data));

// window.addEventListener("beforeunload", () => {
//   es.close(); 
// });

// es.onerror = (e) => {
//   console.error("EventSource error:", e);
// };

export * from "./attendance_stream";
