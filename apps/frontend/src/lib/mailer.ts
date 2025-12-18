import * as nodemailer from "nodemailer";
import { MailOptions } from "@/lib/types/mails.types";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

export async function sendMail(mailOptions: MailOptions) {
  const info = await transporter.sendMail(mailOptions);
  return info;
}
