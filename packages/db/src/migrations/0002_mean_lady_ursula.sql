CREATE TABLE "resume_parsed" (
	"id" text PRIMARY KEY NOT NULL,
	"resume_file_id" text NOT NULL,
	"user_id" text NOT NULL,
	"raw_text" text,
	"page_count" integer,
	"status" text NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
ALTER TABLE "resume_parsed" ADD CONSTRAINT "resume_parsed_resume_file_id_resume_file_id_fk" FOREIGN KEY ("resume_file_id") REFERENCES "public"."resume_file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_parsed" ADD CONSTRAINT "resume_parsed_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "resume_parsed" ADD CONSTRAINT "resume_parsed_resume_file_id_unique" UNIQUE ("resume_file_id");
--> statement-breakpoint
CREATE INDEX "resume_parsed_user_id_idx" ON "resume_parsed" ("user_id");
--> statement-breakpoint
CREATE INDEX "resume_file_user_id_created_at_idx" ON "resume_file" ("user_id","created_at");
