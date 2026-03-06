import jwt from 'jsonwebtoken';
import { env } from './env';

export interface JWTPayload {
    userId: string;
    email: string;
}

/** Signs a new JWT token for a user with a 7-day expiration. */
export function signToken(payload: JWTPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

/** Verifies a JWT token and returns the decoded payload. */
export function verifyToken(token: string): JWTPayload {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}
