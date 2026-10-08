-- Add review_type enum and new columns to reviews table
CREATE TYPE "public"."review_type" AS ENUM('app', 'dealer');--> statement-breakpoint

ALTER TABLE "reviews"
  ADD COLUMN "review_type" "review_type" NOT NULL DEFAULT 'dealer',
  ADD COLUMN "dealer_id" bigint,
  ADD COLUMN "reply_text" text,
  ADD COLUMN "reply_at" timestamp;--> statement-breakpoint

-- Make car_id nullable (app reviews don't belong to a car)
ALTER TABLE "reviews" ALTER COLUMN "car_id" DROP NOT NULL;--> statement-breakpoint

ALTER TABLE "reviews"
  ADD CONSTRAINT "reviews_dealer_id_dealers_id_fk"
  FOREIGN KEY ("dealer_id") REFERENCES "public"."dealers"("id") ON DELETE cascade ON UPDATE no action;
