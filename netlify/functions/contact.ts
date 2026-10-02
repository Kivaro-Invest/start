import { Handler } from "@netlify/functions";
import nodemailer from "nodemailer";

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const handler: Handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { firstName, lastName, email, phone, message } = JSON.parse(event.body || "{}");

    if (!firstName || !lastName || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = parseInt(process.env.SMTP_PORT || "587");
    const secure = port === 465 ? true : process.env.SMTP_SECURE === "true";

    const missingVars = [];
    if (!host) missingVars.push("SMTP_HOST");
    if (!user) missingVars.push("SMTP_USER");
    if (!pass) missingVars.push("SMTP_PASS");

    if (missingVars.length > 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: `SMTP Konfiguration fehlt: ${missingVars.join(", ")}`,
          details: "Bitte prüfen Sie die Environment Variables in Ihrem Netlify Dashboard."
        }),
      };
    }

    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure,
      auth: {
        user: user,
        pass: pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const mailOptions = {
      from: `"${firstName} ${lastName}" <${user}>`,
      to: "kontakt@kivaro-invest.de",
      replyTo: email,
      subject: `Neue Kontaktanfrage von ${firstName} ${lastName} (WEBSEITE KIVARO)`,
      text: `
Name: ${firstName} ${lastName}
E-Mail: ${email}
Telefon: ${phone || "Nicht angegeben"}

Nachricht:
${message}
      `,
      html: `
<h3>Neue Kontaktanfrage</h3>
<p><strong>Name:</strong> ${esc(firstName)} ${esc(lastName)}</p>
<p><strong>E-Mail:</strong> ${esc(email)}</p>
<p><strong>Telefon:</strong> ${esc(phone || "Nicht angegeben")}</p>
<br>
<p><strong>Nachricht:</strong></p>
<p>${esc(message).replace(/\n/g, "<br>")}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error: any) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send email", details: error.message || "Unknown error" }),
    };
  }
};

export { handler };
