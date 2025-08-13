// This file runs in the browser
const es = new EventSource("/realtime/attendance?userId=123");

es.onmessage = (e) => {
  try {
    const data = JSON.parse(e.data);
    console.log("Update:", data);
  } catch (err) {
    console.error("Failed to parse update:", err);
  }
};

window.addEventListener("beforeunload", () => {
  es.close();
});

es.onerror = (e) => {
  console.error("EventSource error:", e);
  // Optional: reconnect after a delay
//   setTimeout(() => {
//     window.location.reload();
//   }, 5000);
 };
