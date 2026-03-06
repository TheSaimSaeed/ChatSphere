import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });

        // Clear session cookie
        ; (await cookies()).set({
            name: 'session.token',
            value: '',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0), // expire immediately
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('ERROR: [auth:logout]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
