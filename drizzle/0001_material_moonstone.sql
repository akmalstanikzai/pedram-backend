ALTER TABLE "tasks" DROP CONSTRAINT "tasks_title_check";--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_title_check" CHECK (length(trim("tasks"."title")) > 0);