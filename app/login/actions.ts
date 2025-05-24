'use server'

import { getDb } from '@/lib/db/drizzle';
import { setSession } from '../../lib/auth/session';
import { NewUser, users } from '@/lib/db/schema';
import { comparePasswords, getMasterPasswordHash } from '@/lib/auth/server/password.server';

type SignInResult = { success: false, error: string } | { success: true, key: string };
export const signIn = async (email: string, clientHash: string) : Promise<SignInResult> => {
    const db = getDb();
    const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email)
    });

    if (!user) {
        return {
            success: false,
            error: 'Invalid email or password.',
        }
    }
    const masterPasswordHash = user.passwordHash;
    const decoded = Buffer.from(clientHash, 'base64')
    const res = await comparePasswords(decoded, masterPasswordHash);
    if (!res) {
        return {
            success: false,
            error: 'Invalid email or password.',
        }
    }

    await setSession(user);
    
    return {
        success: true,
        key: user.key,
    }
}

type SignUpResult = { success: false, error: string } | { success: true };
export const signUp = async (email: string, clientHash: string, key: string) : Promise<SignUpResult> => {
    const db = getDb();
    const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email)
    });

    if (existingUser) {
        return {
            success: false,
            error: 'A user with this email already exists.',
        };
    }

    const passwordHash = await getMasterPasswordHash(clientHash);
    const newUser: NewUser = {
        email,
        passwordHash,
        key
    };

    const [createdUser] = await db.insert(users).values(newUser).returning();

    if (!createdUser) {
        return {
            success: false,
            error: 'Failed to create user.',
        };
    }

    await setSession(createdUser);

    return {
        success: true,
    };
}