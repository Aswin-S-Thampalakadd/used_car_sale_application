import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMail = async ({ to, subject, html }) => {
  if (
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    process.env.SMTP_PASS === "your_app_password_here"
  ) {
    return;
  }

  try {
    await transporter.sendMail({
      from: `"VandiMart" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch {
    return;
  }
};
