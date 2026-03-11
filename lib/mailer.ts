import { Resend } from 'resend';
import { env } from './env';

const resend = new Resend(env.RESEND_API_KEY);

/** Sends a 6-digit verification code to the given email address. */
export const sendVerificationEmail = async (to: string, code: string) => {
    // If RESEND_API_KEY is not set, we'll just log the email contents.
    // This allows local development testing without real credentials.
    if (!env.RESEND_API_KEY) {
        console.log(`\n================================`);
        console.log(`LOG: [mailer] Mock sending Email to: ${to}`);
        console.log(`Subject: Your ChatSphere verification code`);
        console.log(`Code: ${code}`);
        console.log(`================================\n`);
        return true;
    }

    try {
        await resend.emails.send({
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
