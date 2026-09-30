import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(input: SendEmailInput) {
  await sgMail.send({
    from: process.env.EMAIL_FROM || "noreply@library.com",
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html || `<p>${input.text}</p>`,
  });
}
