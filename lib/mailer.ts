import nodemailer from 'nodemailer';
import { env } from './env';

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(env.SMTP_PORT || '587', 10),
    secure: env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

/** Sends a 6-digit verification code to the given email address. */
export const sendVerificationEmail = async (to: string, code: string) => {
    // If SMTP_USER is not set, we'll just log the email contents.
    // This allows local development testing without real SMTP credentials.
    if (!env.SMTP_USER) {
        console.log(`\n================================`);
        console.log(`LOG: [mailer] Mock sending Email to: ${to}`);
        console.log(`Subject: Your ChatSphere verification code`);
        console.log(`Code: ${code}`);
        console.log(`================================\n`);
        return true;
    }

    try {
        await transporter.sendMail({
            from: `"ChatSphere" <${env.SMTP_FROM}>`,
            to,
            subject: 'Your ChatSphere verification code',
            text: `Your code is ${code}. It expires in 10 minutes.`,
            html: `<p>Your ChatSphere verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
        });
        console.log(`LOG: [mailer] Verification email sent to ${to}`);
        return true;
    } catch (error) {
        console.error('ERROR: [mailer] Error sending verification email', error);
        throw new Error('Failed to send verification email');
    }
};
