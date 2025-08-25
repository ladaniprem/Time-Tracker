// import { api } from "encore.dev/api";
// import { secret } from "encore.dev/config";
// import tls from "tls";

// const smtpServer = secret("SMTP_SERVER"); 
// const smtpPort = secret("SMTP_PORT");     
// const senderEmail = secret("SENDER_EMAIL");
// const senderPassword = secret("SENDER_PASSWORD");

// export interface SendEmailRequest {
//   to: string;
//   subject: string;
//   body: string;
//   isHtml?: boolean;
// }

// export interface SendEmailResponse {
//   success: boolean;
//   error?: string;
// }

// // Sends email via Gmail SMTP without external libs
// export const sendEmail = api<SendEmailRequest, SendEmailResponse>(
//   { expose: true, method: "POST", path: "/notifications/email" },
//   async (req) => {
//     try {
//       const connection = tls.connect(
//         parseInt(smtpPort(), 10),
//         smtpServer(),
//         { rejectUnauthorized: false }
//       );

//       const sendCmd = (cmd: string) =>
//         new Promise<void>((resolve) => {
//           connection.write(cmd + "\r\n");
//           connection.once("data", () => resolve());
//         });

//       await new Promise<void>((resolve) => {
//         connection.once("secureConnect", resolve);
//       });

//       await sendCmd(`EHLO ${smtpServer()}`);
//       await sendCmd(`AUTH LOGIN`);
//       await sendCmd(Buffer.from(senderEmail(), "utf-8").toString("base64"));
//       await sendCmd(Buffer.from(senderPassword(), "utf-8").toString("base64"));
//       await sendCmd(`MAIL FROM:<${senderEmail()}>`);
//       await sendCmd(`RCPT TO:<${req.to}>`);
//       await sendCmd(`DATA`);

//       const headers = [
//         `From: ${senderEmail()}`,
//         `To: ${req.to}`,
//         `Subject: ${req.subject}`,
//         `Content-Type: ${req.isHtml ? "text/html" : "text/plain"}; charset=utf-8`,
//         "",
//         req.body,
//         ".",
//       ].join("\r\n");

//       await sendCmd(headers);
//       await sendCmd(`QUIT`);

//       connection.end();

//       return { success: true };
//     } catch (err) {
//       return {
//         success: false,
//         error: err instanceof Error ? err.message : "Unknown error",
//       };
//     }
//   }
// );


import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import net from "net";
import tls from "tls";
import { getCurrentSystemSettings } from "../settings/system_settings";

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

export const sendEmail = api<SendEmailRequest, SendEmailResponse>(
  { expose: true, method: "POST", path: "/notifications/email" },
  async (req) => {
    return new Promise<SendEmailResponse>((resolve) => {
      try {
        const socket = net.connect(
          parseInt(smtpPort(), 10),
          smtpServer(),
          async () => {
            let secureSocket: tls.TLSSocket | null = null;

            const sendCmd = (cmd: string, conn: net.Socket | tls.TLSSocket) =>
              new Promise<string>((res) => {
                conn.once("data", (d) => res(d.toString()));
                conn.write(cmd + "\r\n");
              });

            // Step 1: Greet
            await sendCmd(`EHLO ${smtpServer()}`, socket);

            // Step 2: STARTTLS
            await sendCmd(`STARTTLS`, socket);

            // Step 3: Upgrade to TLS
            secureSocket = tls.connect(
              { socket, rejectUnauthorized: false },
              async () => {
                const sendSecure = (cmd: string) =>
                  new Promise<string>((res) => {
                    secureSocket!.once("data", (d) => res(d.toString()));
                    secureSocket!.write(cmd + "\r\n");
                  });

                await sendSecure(`EHLO ${smtpServer()}`);
                await sendSecure(`AUTH LOGIN`);
                await sendSecure(Buffer.from(senderEmail(), "utf-8").toString("base64"));
                await sendSecure(Buffer.from(senderPassword(), "utf-8").toString("base64"));
                await sendSecure(`MAIL FROM:<${senderEmail()}>`);
                await sendSecure(`RCPT TO:<${req.to}>`);
                await sendSecure(`DATA`);

                const formatted = formatEmailMessage({
                  to: req.to,
                  subject: req.subject,
                  body: req.body,
                  isHtml: req.isHtml === true,
                });

                await sendSecure(formatted);
                await sendSecure(`QUIT`);
                secureSocket!.end();

                resolve({ success: true });
              }
            );

            secureSocket.on("error", (err) => {
              resolve({ success: false, error: err.message });
            });
          }
        );

        socket.on("error", (err) => {
          resolve({ success: false, error: err.message });
        });
      } catch (err: any) {
        resolve({ success: false, error: err.message ?? "Unknown error" });
      }
    });
  }
);

// Non-HTTP helper for internal calls
export async function sendEmailIfEnabled(to: string, subject: string, body: string, isHtml?: boolean): Promise<void> {
  const settings = getCurrentSystemSettings();
  if (!settings.emailNotifications) return;

  const prefixedSubject = prefixSubjectWithCompany(subject, settings.companyName);
  await sendEmail({ to, subject: prefixedSubject, body: bodyWithFooter(body, settings.companyName, isHtml === true), isHtml });
}

function prefixSubjectWithCompany(subject: string, companyName: string): string {
  const trimmedCompany = (companyName || "").trim();
  if (!trimmedCompany) return subject;
  const tag = `[${trimmedCompany}]`;
  if (subject.startsWith(tag)) return subject;
  return `${tag} ${subject}`;
}

function bodyWithFooter(body: string, companyName: string, isHtml: boolean): string {
  const footerText = `\n\n—\n${companyName || ""} Notifications`;
  if (!isHtml) {
    return `${body}${footerText}`;
  }
  const htmlFooter = `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/><p style="color:#6b7280;font-size:12px;margin:0;">${escapeHtml(
    companyName || ""
  )} Notifications</p>`;
  const hasHtmlWrapper = /<html[\s\S]*<\/html>/i.test(body);
  if (hasHtmlWrapper) return injectHtmlFooter(body, htmlFooter);
  return `<!doctype html><html><head><meta charset="utf-8"/></head><body style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;line-height:1.6;color:#111827;">${body}${htmlFooter}</body></html>`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function injectHtmlFooter(html: string, footer: string): string {
  const closingBodyIndex = html.toLowerCase().lastIndexOf("</body>");
  if (closingBodyIndex === -1) return html + footer;
  return html.slice(0, closingBodyIndex) + footer + html.slice(closingBodyIndex);
}

function formatEmailMessage(params: { to: string; subject: string; body: string; isHtml: boolean }): string {
  const settings = getCurrentSystemSettings();
  const company = (settings.companyName || "").trim();
  const displayFrom = company ? `${company} <${senderEmail()}>` : `${senderEmail()}`;
  const contentType = params.isHtml ? "text/html; charset=UTF-8" : "text/plain; charset=UTF-8";
  const date = new Date().toUTCString();
  const domain = (senderEmail().split("@")[1] || smtpServer()).trim();
  const messageId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@${domain}>`;

  const payload = [
    `From: ${displayFrom}`,
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    `Date: ${date}`,
    `Message-ID: ${messageId}`,
    `MIME-Version: 1.0`,
    `Content-Type: ${contentType}`,
    `Content-Transfer-Encoding: 8bit`,
    "",
    params.body,
  ].join("\r\n");

  const dotStuffed = payload
    .split(/\r?\n/)
    .map((line: string) => (line.startsWith(".") ? "." + line : line))
    .join("\r\n");

  return dotStuffed + "\r\n.";
}


// import { api } from "encore.dev/api";
// import { secret } from "encore.dev/config";
// import tls from "tls";

// const smtpServer = secret("SMTP_SERVER");
// const smtpPort = secret("SMTP_PORT");
// const senderEmail = secret("SENDER_EMAIL");
// const senderPassword = secret("SENDER_PASSWORD");

// export interface SendEmailRequest {
//   to: string;
//   subject: string;
//   body: string;
//   isHtml?: boolean;
// }

// export interface SendEmailResponse {
//   success: boolean;
//   error?: string;
// }

// export const sendEmail = api<SendEmailRequest, SendEmailResponse>(
//   { expose: true, method: "POST", path: "/notifications/email" },
//   async (req) => {
//     try {
//       const connection = tls.connect(
//         parseInt(smtpPort(), 10),
//         smtpServer(),
//         { rejectUnauthorized: false }
//       );

//       const sendCmd = (cmd: string, expectedCode: string) =>
//         new Promise<void>((resolve, reject) => {
//           connection.write(cmd + "\r\n");
//           connection.once("data", (data) => {
//             const response = data.toString();
//             if (!response.startsWith(expectedCode)) {
//               reject(new Error(`Unexpected SMTP response: ${response}`));
//             } else {
//               resolve();
//             }
//           });
//         });

//       await new Promise<void>((resolve) =>
//         connection.once("secureConnect", resolve)
//       );

//       await sendCmd(`EHLO ${smtpServer()}`, "250");
//       await sendCmd(`AUTH LOGIN`, "334");
//       await sendCmd(Buffer.from(senderEmail(), "utf-8").toString("base64"), "334");
//       await sendCmd(Buffer.from(senderPassword(), "utf-8").toString("base64"), "235");
//       await sendCmd(`MAIL FROM:<${senderEmail()}>`, "250");
//       await sendCmd(`RCPT TO:<${req.to}>`, "250");
//       await sendCmd(`DATA`, "354");

//       const headers = [
//         `From: ${senderEmail()}`,
//         `To: ${req.to}`,
//         `Subject: ${req.subject}`,
//         `Content-Type: ${req.isHtml ? "text/html" : "text/plain"}; charset=utf-8`,
//         "",
//         req.body,
//         ".",
//       ].join("\r\n");

//       await sendCmd(headers, "250");
//       await sendCmd(`QUIT`, "221");

//       connection.end();
//       return { success: true };
//     } catch (err) {
//       return {
//         success: false,
//         error: err instanceof Error ? err.message : "Unknown error",
//       };
//     }
//   }
// );
