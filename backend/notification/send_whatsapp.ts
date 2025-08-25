// import { api } from "encore.dev/api";
// import { secret } from "encore.dev/config";

// const interaktApiKey = secret("INTERAKT_API_KEY");
// const senderWhatsappNumber = secret("SENDER_WHATSAPP_NUMBER");

// export interface SendWhatsAppRequest {
//   to: string;
//   message: string;
//   templateName?: string;
// }

// export interface SendWhatsAppResponse {
//   success: boolean;
//   messageId?: string;
//   error?: string;
// }

// // Sends a WhatsApp notification using Interakt API.
// export const sendWhatsApp = api<SendWhatsAppRequest, SendWhatsAppResponse>(
//   { expose: true, method: "POST", path: "/notifications/whatsapp" },
//   async (req) => {
//     try {
//       console.log(`Sending WhatsApp to ${req.to}: ${req.message}`);
//       console.log(`Interakt API Key: ${interaktApiKey()}`);
//       console.log(`Sender Number: ${senderWhatsappNumber()}`);
      
//       // In a real implementation, you would make an HTTP request to Interakt API
//       // For now, we'll simulate the WhatsApp sending
//       return {
//         success: true,
//         messageId: `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
//       };
//     } catch (error) {
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : "Unknown error occurred"
//       };
//     }
//   }
// );

// send_whatsapp.ts
import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { getCurrentSystemSettings } from "../settings/system_settings";

const interaktApiKey = secret("INTERAKT_API_KEY");
const senderWhatsappNumber = secret("SENDER_WHATSAPP_NUMBER");

export interface SendWhatsAppRequest {
  to: string; // e.g. "+919876543210"
  message: string;
  templateName?: string;
}

export interface SendWhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Simulates sending WhatsApp message
export const sendWhatsApp = api<SendWhatsAppRequest, SendWhatsAppResponse>(
  { expose: true, method: "POST", path: "/notifications/whatsapp" },
  async (req) => {
    try {
      const settings = getCurrentSystemSettings();
      const normalizedTo = normalizePhone(req.to);
      const message = formatWhatsAppMessage(req.message, settings.companyName);

      console.log(`(MOCK) Sending WhatsApp to ${normalizedTo}: ${message}`);
      console.log(`Using Interakt API Key: ${interaktApiKey()}`);
      console.log(`Sender Number: ${senderWhatsappNumber()}`);

      return {
        success: true,
        messageId: `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
);

// Non-HTTP helper for internal calls respecting feature flags
export async function sendWhatsAppIfEnabled(to: string, message: string): Promise<void> {
  const settings = getCurrentSystemSettings();
  if (!settings.whatsappNotifications) return;
  await sendWhatsApp({ to: normalizePhone(to), message: formatWhatsAppMessage(message, settings.companyName) });
}

function normalizePhone(input: string): string {
  const digits = input.replace(/\D+/g, "");
  if (digits.startsWith("00")) return "+" + digits.slice(2);
  if (digits.startsWith("0") && digits.length > 10) return "+" + digits.slice(1);
  if (digits.startsWith("91") && digits.length === 12) return "+" + digits; // common India case
  if (digits.length === 10) return "+91" + digits; // fallback default country code if missing
  return input.startsWith("+") ? input : "+" + digits;
}

function formatWhatsAppMessage(text: string, companyName: string): string {
  const company = (companyName || "").trim();
  const header = company ? `*${company}*\n` : "";
  const footer = "\n—\nThis is an automated message.";
  return `${header}${text}${footer}`;
}