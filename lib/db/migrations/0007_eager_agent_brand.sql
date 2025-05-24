ALTER TABLE "logins" RENAME TO "items";--> statement-breakpoint
ALTER TABLE "items" DROP CONSTRAINT "logins_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;