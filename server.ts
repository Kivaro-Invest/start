import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Contact Form
  app.post("/api/contact", async (req, res) => {
    const { firstName, lastName, email, phone, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const smtpPort = parseInt(process.env.SMTP_PORT || "587");
      const smtpHost = process.env.SMTP_HOST;
      // Automatically use secure=true for port 465, otherwise rely on env var
      const smtpSecure = smtpPort === 465 ? true : process.env.SMTP_SECURE === "true";

      console.log(`Attempting to send email via ${smtpHost}:${smtpPort} (Secure: ${smtpSecure})`);
      
      if (smtpPort === 365) {
        console.warn("Warning: Port 365 is unusual for SMTP. Did you mean 465 (SSL) or 587 (STARTTLS)?");
      }

      // Configure Nodemailer with SMTP settings from environment variables
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000, // 10 seconds timeout
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });

      const mailOptions = {
        from: `"${firstName} ${lastName}" <${process.env.SMTP_USER}>`,
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
<p><strong>Name:</strong> ${firstName} ${lastName}</p>
<p><strong>E-Mail:</strong> ${email}</p>
<p><strong>Telefon:</strong> ${phone || "Nicht angegeben"}</p>
<br>
<p><strong>Nachricht:</strong></p>
<p>${message.replace(/\n/g, "<br>")}</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email", details: error.message || "Unknown error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
