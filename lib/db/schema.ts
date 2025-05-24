import { pgTable, serial, varchar, text, timestamp, integer, json } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    key: text('key').notNull(),
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

export const items = pgTable('items', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    name: varchar('name', { length: 255 }).notNull(),
    data: json().notNull().$type<{
        url?: string,
        username?: string,
        password?: string,
        note?: string
    }>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type DataField = 'url' | 'username' | 'password' | 'note';