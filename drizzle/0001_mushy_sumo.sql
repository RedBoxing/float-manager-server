CREATE TABLE "truckLocations" (
	"truck_id" uuid NOT NULL,
	"timestamp" timestamp NOT NULL,
	"longitude" numeric NOT NULL,
	"latitude" numeric NOT NULL,
	CONSTRAINT "truckLocations_truck_id_timestamp_pk" PRIMARY KEY("truck_id","timestamp")
);
--> statement-breakpoint
ALTER TABLE "trucks" RENAME COLUMN "model" TO "model_id";--> statement-breakpoint
ALTER TABLE "trucks" RENAME COLUMN "departure_address" TO "departure_address_id";--> statement-breakpoint
ALTER TABLE "trucks" DROP CONSTRAINT "trucks_model_truckModels_id_fk";
--> statement-breakpoint
ALTER TABLE "trucks" DROP CONSTRAINT "trucks_departure_address_addresses_id_fk";
--> statement-breakpoint
ALTER TABLE "truckModels" ADD COLUMN "name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "truckLocations" ADD CONSTRAINT "truckLocations_truck_id_trucks_id_fk" FOREIGN KEY ("truck_id") REFERENCES "public"."trucks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_model_id_truckModels_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."truckModels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_departure_address_id_addresses_id_fk" FOREIGN KEY ("departure_address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;

INSERT INTO addresses(city, zip, longitude, latitude) VALUES ('Annecy', 74150,  45.8992526, 6.1286370);
INSERT INTO "truckModels"(name, fuel_capacity, storage_capacity) VALUES ('Tiger A15', 500, 10);