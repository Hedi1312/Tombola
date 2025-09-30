import nodemailer, { SendMailOptions } from "nodemailer";

type Attachment = NonNullable<SendMailOptions["attachments"]>[number];

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export const sendEmail = async (
    to: string,
    subject: string,
    html: string,
    text?: string,
    attachments?: Attachment[],
    replyTo?: string
) => {
    await transporter.sendMail({
        from: `"🎟️ Marocola" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
        text,
        attachments,
        replyTo,
    });

};
