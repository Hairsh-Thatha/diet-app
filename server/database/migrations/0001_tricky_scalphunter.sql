CREATE TABLE "diet_plan_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"gender" text NOT NULL,
	"age" integer NOT NULL,
	"height" numeric NOT NULL,
	"height_unit" text NOT NULL,
	"weight" numeric NOT NULL,
	"weight_unit" text NOT NULL,
	"activity_level" text NOT NULL,
	"goal" text NOT NULL,
	"dietary_preference" text DEFAULT 'no_preference' NOT NULL,
	"allergies" text DEFAULT '' NOT NULL,
	"foods_to_avoid" text DEFAULT '' NOT NULL,
	"meals_per_day" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diet_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"request_key" uuid NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"goal" text NOT NULL,
	"daily_calorie_target" integer NOT NULL,
	"plan_data" jsonb NOT NULL,
	"profile_snapshot" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "diet_plans_request_key_unique" UNIQUE("request_key")
);
--> statement-breakpoint
CREATE TABLE "diet_plan_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"diet_plan_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diet_plan_meals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"diet_plan_day_id" uuid NOT NULL,
	"meal_type" text NOT NULL,
	"meal_name" text NOT NULL,
	"description" text NOT NULL,
	"ingredients" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"serving_size" text NOT NULL,
	"calories" numeric NOT NULL,
	"protein" numeric NOT NULL,
	"carbohydrates" numeric NOT NULL,
	"fat" numeric NOT NULL,
	"suggested_time" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diet_plan_adherence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"diet_plan_id" uuid NOT NULL,
	"date" date NOT NULL,
	"followed" boolean,
	"completed_meals" integer DEFAULT 0 NOT NULL,
	"total_meals" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "diet_plan_profiles" ADD CONSTRAINT "diet_plan_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "diet_plans" ADD CONSTRAINT "diet_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "diet_plan_days" ADD CONSTRAINT "diet_plan_days_diet_plan_id_diet_plans_id_fk" FOREIGN KEY ("diet_plan_id") REFERENCES "public"."diet_plans"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "diet_plan_meals" ADD CONSTRAINT "diet_plan_meals_diet_plan_day_id_diet_plan_days_id_fk" FOREIGN KEY ("diet_plan_day_id") REFERENCES "public"."diet_plan_days"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "diet_plan_adherence" ADD CONSTRAINT "diet_plan_adherence_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "diet_plan_adherence" ADD CONSTRAINT "diet_plan_adherence_diet_plan_id_diet_plans_id_fk" FOREIGN KEY ("diet_plan_id") REFERENCES "public"."diet_plans"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "diet_plan_profile_user_idx" ON "diet_plan_profiles" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "diet_plan_user_status_idx" ON "diet_plans" USING btree ("user_id","status");
--> statement-breakpoint
CREATE INDEX "diet_plan_user_generated_idx" ON "diet_plans" USING btree ("user_id","generated_at");
--> statement-breakpoint
CREATE UNIQUE INDEX "diet_plan_day_number_idx" ON "diet_plan_days" USING btree ("diet_plan_id","day_number");
--> statement-breakpoint
CREATE INDEX "diet_plan_day_date_idx" ON "diet_plan_days" USING btree ("date");
--> statement-breakpoint
CREATE UNIQUE INDEX "diet_plan_meal_type_idx" ON "diet_plan_meals" USING btree ("diet_plan_day_id","sort_order");
--> statement-breakpoint
CREATE INDEX "diet_plan_meal_day_idx" ON "diet_plan_meals" USING btree ("diet_plan_day_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "diet_plan_adherence_plan_date_idx" ON "diet_plan_adherence" USING btree ("diet_plan_id","date");
--> statement-breakpoint
CREATE INDEX "diet_plan_adherence_user_date_idx" ON "diet_plan_adherence" USING btree ("user_id","date");
