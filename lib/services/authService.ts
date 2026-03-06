import bcryptjs from 'bcryptjs';

/**
 * Hashes a plain text password using bcrypt.
 * @param password The plain text password to hash
 * @returns The hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcryptjs.genSalt(10);
    return bcryptjs.hash(password, salt);
}

/**
 * Compares a plain text password with a hashed password.
 * @param password The plain text password
 * @param hash The hashed password to compare against
 * @returns True if the passwords match, false otherwise
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
}
