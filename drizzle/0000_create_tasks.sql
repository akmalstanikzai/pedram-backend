CREATE TABLE IF NOT EXISTS "tasks" (
  "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "title" text NOT NULL,
  "completed" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "tasks_title_check" CHECK (length(trim("title")) > 0)
);
