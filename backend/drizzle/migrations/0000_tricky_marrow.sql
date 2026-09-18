CREATE TYPE "public"."car_condition" AS ENUM('excellent', 'good', 'fair');--> statement-breakpoint
CREATE TYPE "public"."car_status" AS ENUM('draft', 'active', 'sold', 'reserved', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."fuel_type" AS ENUM('petrol', 'diesel', 'electric', 'hybrid', 'cng', 'lpg');--> statement-breakpoint
CREATE TYPE "public"."transmission" AS ENUM('manual', 'automatic', 'amt', 'cvt', 'dct');--> statement-breakpoint
CREATE TYPE "public"."enquiry_status" AS ENUM('new', 'contacted', 'closed');--> statement-breakpoint
CREATE TABLE "car_feature_mappings" (
	"car_id" bigint NOT NULL,
	"feature_id" bigint NOT NULL,
	CONSTRAINT "car_feature_mappings_car_id_feature_id_pk" PRIMARY KEY("car_id","feature_id")
);
--> statement-breakpoint
CREATE TABLE "car_features" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "car_features_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "car_features_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "car_images" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "car_images_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"car_id" bigint NOT NULL,
	"image_url" varchar(1000) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cars" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cars_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"dealer_id" bigint NOT NULL,
	"make" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"variant" varchar(150),
	"year" integer NOT NULL,
	"registration_year" integer,
	"fuel_type" "fuel_type" NOT NULL,
	"transmission" "transmission" NOT NULL,
	"kilometers_driven" integer NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"color" varchar(50),
	"condition" "car_condition",
	"description" text,
	"registration_number" varchar(30),
	"is_negotiable" boolean DEFAULT true NOT NULL,
	"status" "car_status" DEFAULT 'draft' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"views_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dealers" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "dealers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"dealership_name" varchar(200) NOT NULL,
	"description" text,
	"logo" varchar(500),
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(100),
	"pincode" varchar(20),
	"latitude" varchar(30),
	"longitude" varchar(30),
	"gst_number" varchar(50),
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dealers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "enquiries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"car_id" bigint NOT NULL,
	"customer_id" bigint NOT NULL,
	"dealer_id" bigint NOT NULL,
	"message" text,
	"status" "enquiry_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favourites" (
	"user_id" bigint NOT NULL,
	"car_id" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favourites_user_id_car_id_pk" PRIMARY KEY("user_id","car_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"email" varchar(256) NOT NULL,
	"phone" varchar(20),
	"password_hash" varchar(255),
	"profile_image" varchar(500),
	"user_type_id" bigint NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"fcm_token" varchar(500),
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "user_types" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" varchar(256) NOT NULL,
	CONSTRAINT "uq_user_types_name" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "car_feature_mappings" ADD CONSTRAINT "car_feature_mappings_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_feature_mappings" ADD CONSTRAINT "car_feature_mappings_feature_id_car_features_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."car_features"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_images" ADD CONSTRAINT "car_images_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_dealer_id_users_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealers" ADD CONSTRAINT "dealers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_dealer_id_users_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_user_type_id_user_types_id_fk" FOREIGN KEY ("user_type_id") REFERENCES "public"."user_types"("id") ON DELETE no action ON UPDATE no action;