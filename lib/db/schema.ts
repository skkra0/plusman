import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    protectedSymmetricKey: text('protected_symmetric_key').notNull(),
    hmac: text('hmac').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const sessions = pgTable('sessions', {
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    expiresAt: timestamp('expires_at').notNull(),
});

export type Session = typeof sessions.$inferSelect;