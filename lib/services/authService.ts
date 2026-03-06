import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import User from '@/lib/models/User';
import Otp from '@/lib/models/Otp';
import { RegisterInput, LoginInput, VerifyEmailInput, ResendOtpInput } from '@/lib/validations/authSchemas';
import { sendVerificationEmail } from '@/lib/mailer';
import { connectDB } from '@/lib/db';

/** Hashes a plain text password using bcrypt. */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcryptjs.genSalt(10);
    return bcryptjs.hash(password, salt);
}

/** Compares a plain text password with a hashed password. */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
}

/** Generates a random 6 digit numeric code. */
function generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
}

/** Registers a user as unverified and sends an OTP. */
export async function registerUser(input: RegisterInput) {
    await connectDB();
    const { email, password, name, phone } = input;

    let user = await User.findOne({ email });

    if (user) {
        if (user.isVerified) {
            const error: any = new Error('Email already in use');
            error.statusCode = 409;
            throw error;
        }
        // If unverified, we update their details and resend OTP
        const hashedPassword = await hashPassword(password);
        user.password = hashedPassword;
        user.name = name;
        user.phone = phone || null;
        await user.save();
    } else {
        const hashedPassword = await hashPassword(password);
        user = await User.create({
            email,
            password: hashedPassword,
            name,
            phone: phone || null,
            isVerified: false,
        });
    }

    // Delete any existing OTPs for the user
    await Otp.deleteMany({ userId: user._id });

    // Generate new OTP
    const code = generateOTP();
    await Otp.create({
        userId: user._id,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send email
    await sendVerificationEmail(user.email, code);

    return { message: 'Verification code sent to email', userId: user._id.toString() };
}

/** Verifies the email with the given OTP code and marks the user as verified. */
export async function verifyEmail(input: VerifyEmailInput) {
    await connectDB();
    const { email, code } = input;

    const user = await User.findOne({ email });
    if (!user) {
        const error: any = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    if (user.isVerified) {
        const error: any = new Error('Email is already verified');
        error.statusCode = 400;
        throw error;
    }

    const otpDocument = await Otp.findOne({
        userId: user._id,
        code,
        expiresAt: { $gt: new Date() },
    });

    if (!otpDocument) {
        const error: any = new Error('Invalid or expired code');
        error.statusCode = 400;
        throw error;
    }

    user.isVerified = true;
    await user.save();

    await Otp.deleteOne({ _id: otpDocument._id });

    const userToReturn = {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        statusMessage: user.statusMessage,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        isVerified: user.isVerified,
    };

    return userToReturn;
}

/** Resends a new OTP to the unverified user. */
export async function resendOtp(input: ResendOtpInput) {
    await connectDB();
    const { email } = input;

    const user = await User.findOne({ email });
    if (!user) {
        // Obfuscate whether email exists
        return { message: 'If the email is registered, a code has been sent.' };
    }

    if (user.isVerified) {
        // Obfuscate whether email is verified or just resent
        return { message: 'If the email is registered, a code has been sent.' };
    }

    await Otp.deleteMany({ userId: user._id });

    const code = generateOTP();
    await Otp.create({
        userId: user._id,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendVerificationEmail(user.email, code);

    return { message: 'A new code has been sent to your email.' };
}

/** Authenticates a user and checks if they are verified. */
export async function loginUser(input: LoginInput) {
    await connectDB();
    const { email, password } = input;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        const error: any = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    const isValid = await comparePassword(password, user.password as string);
    if (!isValid) {
        const error: any = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    if (!user.isVerified) {
        // Generate a fresh OTP and send it automatically
        await resendOtp({ email });
        const error: any = new Error('Account not verified');
        error.statusCode = 403; // Need a way to tell client to redirect
        error.isUnverified = true;
        throw error;
    }

    user.isOnline = true;
    await user.save();

    const userToReturn = {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        statusMessage: user.statusMessage,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        isVerified: user.isVerified,
    };

    return userToReturn;
}
