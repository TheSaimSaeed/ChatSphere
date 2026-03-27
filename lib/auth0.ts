import { Auth0Client } from '@auth0/nextjs-auth0/server';

/** 
 * Auth0Client configuration for both Edge (Middleware) and Node.js environments.
 * Updated to use standard V4 properties.
 */
export const auth0 = new Auth0Client({
    domain: process.env.AUTH0_DOMAIN!,
    clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    secret: process.env.AUTH0_SECRET!,
    appBaseUrl: process.env.AUTH0_BASE_URL || "http://localhost:3000",
});