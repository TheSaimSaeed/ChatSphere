import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations/authSchemas';
import { registerUser } from '@/lib/services/authService';

/** Handles new user registration, creating an unverified account and sending an OTP. */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const validatedData = registerSchema.safeParse(body);
        if (!validatedData.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validatedData.error.flatten() },
                { status: 400 }
            );
        }

        const result = await registerUser(validatedData.data);

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error('ERROR: [auth:register]', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: error.statusCode || 500 }
        );
    }
}
