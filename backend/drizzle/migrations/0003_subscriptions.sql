CREATE TYPE "public"."plan_type" AS ENUM('free', 'elite', 'pro');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "subscriptions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"plan_type" "plan_type" NOT NULL DEFAULT 'free',
	"car_limit" integer NOT NULL DEFAULT 5,
	"price" numeric(10, 2) NOT NULL DEFAULT '0',
	"start_date" timestamp NOT NULL DEFAULT now(),
	"end_date" timestamp,
	"status" "subscription_status" NOT NULL DEFAULT 'active',
	"razorpay_order_id" varchar(100),
	"razorpay_payment_id" varchar(100),
	"razorpay_signature" varchar(255),
	"payment_status" "payment_status" NOT NULL DEFAULT 'completed',
	"is_auto_renewal" boolean NOT NULL DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
