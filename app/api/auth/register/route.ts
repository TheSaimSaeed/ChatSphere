import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { registerSchema } from '@/lib/validations/authSchemas';
import { hashPassword } from '@/lib/services/authService';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate Input
        const validatedData = registerSchema.safeParse(body);
        if (!validatedData.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validatedData.error.flatten() },
                { status: 400 }
            );
        }

        const { email, password, name, phone } = validatedData.data;

        // Connect to MongoDB
        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
        }

        // Hash Password
        const hashedPassword = await hashPassword(password);

        // Create New User
        const newUser = await User.create({
            email,
            password: hashedPassword,
            name,
            phone: phone || null,
        });

        // Generate JWT
        const token = signToken({ userId: newUser._id.toString(), email: newUser.email });

        // Sanitize user object
        const userToReturn = {
            _id: newUser._id.toString(),
            email: newUser.email,
            name: newUser.name,
            phone: newUser.phone,
            avatar: newUser.avatar,
            statusMessage: newUser.statusMessage,
            isOnline: newUser.isOnline,
            lastSeen: newUser.lastSeen,
        };

        // Construct response
        const response = NextResponse.json(
            { message: 'Registration successful', user: userToReturn },
            { status: 201 }
        );

        // Set secure HTTP-only cookie
        // Next 15 specific api
        ; (await cookies()).set({
            name: 'session.token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('ERROR: [auth:register]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
