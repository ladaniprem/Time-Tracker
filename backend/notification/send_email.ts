import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import tls from "tls";

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
  error?: string;
}

// Sends email via Gmail SMTP without external libs
export const sendEmail = api<SendEmailRequest, SendEmailResponse>(
  { expose: true, method: "POST", path: "/notifications/email" },
  async (req) => {
    try {
      const connection = tls.connect(
        parseInt(smtpPort(), 10),
        smtpServer(),
        { rejectUnauthorized: false }
      );

      const sendCmd = (cmd: string) =>
        new Promise<void>((resolve) => {
          connection.write(cmd + "\r\n");
          connection.once("data", () => resolve());
        });

      await new Promise<void>((resolve) => {
        connection.once("secureConnect", resolve);
      });

      await sendCmd(`EHLO ${smtpServer()}`);
      await sendCmd(`AUTH LOGIN`);
      await sendCmd(Buffer.from(senderEmail(), "utf-8").toString("base64"));
      await sendCmd(Buffer.from(senderPassword(), "utf-8").toString("base64"));
      await sendCmd(`MAIL FROM:<${senderEmail()}>`);
      await sendCmd(`RCPT TO:<${req.to}>`);
      await sendCmd(`DATA`);

      const headers = [
        `From: ${senderEmail()}`,
        `To: ${req.to}`,
        `Subject: ${req.subject}`,
        `Content-Type: ${req.isHtml ? "text/html" : "text/plain"}; charset=utf-8`,
        "",
        req.body,
        ".",
      ].join("\r\n");

      await sendCmd(headers);
      await sendCmd(`QUIT`);

      connection.end();

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }
);
