CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city" varchar(255) NOT NULL,
	"zip" char(5) NOT NULL,
	"longitude" numeric NOT NULL,
	"latitude" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"address_id" uuid NOT NULL,
	"total_cost" numeric NOT NULL,
	"total_weight" numeric NOT NULL,
	"status" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "truckModels" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "truckModels_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"fuel_capacity" numeric NOT NULL,
	"storage_capacity" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trucks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model" integer NOT NULL,
	"departure_address" uuid NOT NULL,
	"longitude" numeric NOT NULL,
	"latitude" numeric NOT NULL,
	"current_order_id" uuid,
	"state" integer DEFAULT 0,
	"fuel_quantity" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"passwordHash" varchar(255),
	"admin" boolean DEFAULT false,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_model_truckModels_id_fk" FOREIGN KEY ("model") REFERENCES "public"."truckModels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_departure_address_addresses_id_fk" FOREIGN KEY ("departure_address") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_current_order_id_orders_id_fk" FOREIGN KEY ("current_order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;