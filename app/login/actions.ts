'use server'

import { db } from '@/lib/db/drizzle';
import { setSession } from '../../lib/auth/session';
import { NewUser, users } from '@/lib/db/schema';
import { comparePasswords, getMasterPasswordHash } from '@/lib/auth/server/password.server';

type SignInResult = { success: false, error: string } | { success: true, protectedSymmetricKey: string, hmac: string };
export const signIn = async (email: string, clientHash: string) : Promise<SignInResult> => {
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
    if (!comparePasswords(clientHash, masterPasswordHash)) {
        return {
            success: false,
            error: 'Invalid email or password.',
        }
    }

    await setSession(user);
    
    return {
        success: true,
        protectedSymmetricKey: user.protectedSymmetricKey,
        hmac: user.hmac,
    }
}

type SignUpResult = { success: false, error: string } | { success: true };
export const signUp = async (email: string, clientHash: string, protectedSymmetricKey: string, hmac: string) : Promise<SignUpResult> => {
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
        protectedSymmetricKey,
        hmac,
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