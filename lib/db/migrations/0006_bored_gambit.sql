ALTER TABLE "users" RENAME COLUMN "protected_symmetric_key" TO "key";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "hmac";