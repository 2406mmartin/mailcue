import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

export function getEmailClient() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
}

export const EMAIL_FROM = process.env.EMAIL_USER!;

export async function sendEmail(
  contact: string,
  subject: string,
  message: string,
  inReplyTo?: string | null,
  references?: string[],
): Promise<{ messageId: string }> {
  const mailOptions: any = {
    from: `"Not a Support Team" <${EMAIL_FROM}>`,
    to: contact,
    subject: subject,
    text: message,
  };

  if (inReplyTo) {
    mailOptions.inReplyTo = inReplyTo;
    mailOptions.references =
      references && references.length > 0 ? references : inReplyTo;
  }

  const transporter = getEmailClient();
  const info = await transporter.sendMail(mailOptions);
  return { messageId: info.messageId };
}
