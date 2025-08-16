// // This file runs in the browser
// const es = new EventSource("/realtime/attendance?userId=123");

// es.onmessage = (e) => {
//   try {
//     const data = JSON.parse(e.data);
//     console.log("Update:", data);
//   } catch (err) {
//     console.error("Failed to parse update:", err);
//   }
// };

// window.addEventListener("beforeunload", () => {
//   es.close();
// });

// es.onerror = (e) => {
//   console.error("EventSource error:", e);
//   // Optional: reconnect after a delay
// //   setTimeout(() => {
// //     window.location.reload();
// //   }, 5000);
//  };

// Client-side code to connect to Encore SSE stream

// Replace localhost:4000 with your Encore dev URL if needed
const es = new EventSource("http://localhost:4000/realtime/attendance?userId=123");

es.onmessage = (e: MessageEvent) => {
  try {
    const data = JSON.parse(e.data);
    console.log("📩 Update received:", data);
  } catch (err) {
    console.error("❌ Failed to parse update:", err);
  }
};

// Close connection before browser unloads
window.addEventListener("beforeunload", () => {
  es.close();
});

// Handle errors
es.onerror = (e) => {
  console.error("⚠️ EventSource error:", e);
};
