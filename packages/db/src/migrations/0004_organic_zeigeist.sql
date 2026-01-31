ALTER TABLE "resume_parsed" DROP CONSTRAINT IF EXISTS "resume_parsed_resume_file_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "resume_file_user_id_created_at_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "resume_parsed_user_id_idx";--> statement-breakpoint
CREATE INDEX "resume_file_user_id_created_at_idx" ON "resume_file" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "resume_parsed_user_id_idx" ON "resume_parsed" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "resume_parsed" ADD CONSTRAINT "resume_parsed_resume_file_id_unique" UNIQUE("resume_file_id");
