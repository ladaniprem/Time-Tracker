import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";

const interaktApiKey = secret("INTERAKT_API_KEY");
const senderWhatsappNumber = secret("SENDER_WHATSAPP_NUMBER");

export interface SendWhatsAppRequest {
  to: string;
  message: string;
  templateName?: string;
}

export interface SendWhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Sends a WhatsApp notification using Interakt API.
export const sendWhatsApp = api<SendWhatsAppRequest, SendWhatsAppResponse>(
  { expose: true, method: "POST", path: "/notifications/whatsapp" },
  async (req) => {
    try {
      console.log(`Sending WhatsApp to ${req.to}: ${req.message}`);
      console.log(`Interakt API Key: ${interaktApiKey()}`);
      console.log(`Sender Number: ${senderWhatsappNumber()}`);
      
      // In a real implementation, you would make an HTTP request to Interakt API
      // For now, we'll simulate the WhatsApp sending
      return {
        success: true,
        messageId: `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
);
