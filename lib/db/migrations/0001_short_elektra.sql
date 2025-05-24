ALTER TABLE "users" ADD COLUMN "salt" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "protected_symmetric_key" text NOT NULL;