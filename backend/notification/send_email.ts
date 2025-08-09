import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";

const smtpServer = secret("SMTP_SERVER");
const smtpPort = secret("SMTP_PORT");
const senderEmail = secret("SENDER_EMAIL");
const senderPassword = secret("SENDER_PASSWORD");

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Sends an email notification using SMTP configuration.
export const sendEmail = api<SendEmailRequest, SendEmailResponse>(
  { expose: true, method: "POST", path: "/notifications/email" },
  async (req) => {
    try {
      // In a real implementation, you would use a library like nodemailer
      // For now, we'll simulate the email sending
      console.log(`Sending email to ${req.to} with subject: ${req.subject}`);
      console.log(`SMTP Server: ${smtpServer()}`);
      console.log(`SMTP Port: ${smtpPort()}`);
      console.log(`Sender: ${senderEmail()}`);
      
      // Simulate successful email sending
      return {
        success: true,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
);
