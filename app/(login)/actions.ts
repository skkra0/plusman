'use server'

import { db } from '@/lib/db/drizzle';
import { setSession } from '../../lib/auth/session';
import { NewUser, users } from '@/lib/db/schema';
import { comparePasswords, getMasterPasswordHash } from '@/lib/auth/server/password.server';

export const signIn = async (email: string, clientHash: string) => {
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
        error: '',
        protectedSymmetricKey: user.protectedSymmetricKey,
    }
}

export const signUp = async (email: string, clientHash: string, protectedSymmetricKey: string) => {
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
        error: '',
    };
}