'use server'
import { Session, sessions, User } from "@/lib/db/schema";
import { randomBytes } from "crypto";
import { getDb } from "@/lib/db/drizzle";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { PostgresError } from "postgres";

const UNIQUE_VIOLATION = "23505";
const createSession = async (user: User) => {
    const db = getDb();
    while (true) {
        const expires15min = new Date(Date.now() + 15 * 60 * 1000);
        const sessionId = randomBytes(32).toString('hex');
        const newSession: Session = {
            id: sessionId,
            userId: user.id,
            expiresAt: expires15min,
        };
        try {
            const [res] = await db.insert(sessions)
                .values(newSession)
                .returning();
            return res;
        } catch (e) {
            if ((e as PostgresError).code === UNIQUE_VIOLATION) {
                continue;
            }
            throw e;
        }
    }
}

export const setSession = async (user: User) => {
    const newSession = await createSession(user);
    (await cookies()).set('session', newSession.id, {
        expires: newSession.expiresAt,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
    });
}

export const getSession = async () => {
    const db = getDb();
    const cookie = (await cookies()).get('session')?.value;
    if (!cookie) {
        return null;
    }
    const sessionData = await db.query.sessions.findFirst({
        where: (sessions, { eq }) => eq(sessions.id, cookie)
    });

    if (!sessionData) {
        return null;
    }

    if (sessionData.expiresAt.getTime() < Date.now()) {
        await db.delete(sessions).where(eq(sessions.id, sessionData.id));
        return null;
    }
    return sessionData;
}

export const clearSession = async () => {
    const db = getDb();
    const cookieStore = await cookies();
    const cookie = cookieStore.get('session')?.value;
    if (!cookie) return;
    cookieStore.delete('session');
    await db.delete(sessions).where(eq(sessions.id, cookie));
}