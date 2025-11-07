/*
  Warnings:

  - You are about to drop the `addresses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `truckLocations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `truckModels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trucks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_address_id_addresses_id_fk";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_client_id_users_id_fk";

-- DropForeignKey
ALTER TABLE "truckLocations" DROP CONSTRAINT "truckLocations_truck_id_trucks_id_fk";

-- DropForeignKey
ALTER TABLE "trucks" DROP CONSTRAINT "trucks_current_order_id_orders_id_fk";

-- DropForeignKey
ALTER TABLE "trucks" DROP CONSTRAINT "trucks_departure_address_id_addresses_id_fk";

-- DropForeignKey
ALTER TABLE "trucks" DROP CONSTRAINT "trucks_model_id_truckModels_id_fk";

-- DropTable
DROP TABLE "addresses";

-- DropTable
DROP TABLE "orders";

-- DropTable
DROP TABLE "truckLocations";

-- DropTable
DROP TABLE "truckModels";

-- DropTable
DROP TABLE "trucks";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "address" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "city" VARCHAR(255) NOT NULL,
    "zip" CHAR(5) NOT NULL,
    "longitude" DECIMAL NOT NULL,
    "latitude" DECIMAL NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "client_id" UUID NOT NULL,
    "address_id" UUID NOT NULL,
    "total_cost" DECIMAL NOT NULL,
    "total_weight" DECIMAL NOT NULL,
    "status" INTEGER NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "truckLocation" (
    "truck_id" UUID NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL,
    "longitude" DECIMAL NOT NULL,
    "latitude" DECIMAL NOT NULL,

    CONSTRAINT "truckLocations_truck_id_timestamp_pk" PRIMARY KEY ("truck_id","timestamp")
);

-- CreateTable
CREATE TABLE "truckModel" (
    "id" SERIAL NOT NULL,
    "fuel_capacity" DECIMAL NOT NULL,
    "storage_capacity" DECIMAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "truckModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "truck" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "model_id" INTEGER NOT NULL,
    "departure_address_id" UUID NOT NULL,
    "longitude" DECIMAL NOT NULL,
    "latitude" DECIMAL NOT NULL,
    "current_order_id" UUID,
    "state" INTEGER NOT NULL DEFAULT 0,
    "fuel_quantity" DECIMAL NOT NULL,

    CONSTRAINT "truck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255),
    "admin" BOOLEAN DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_unique" ON "user"("email");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "orders_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "orders_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "truckLocation" ADD CONSTRAINT "truckLocations_truck_id_trucks_id_fk" FOREIGN KEY ("truck_id") REFERENCES "truck"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "truck" ADD CONSTRAINT "trucks_current_order_id_orders_id_fk" FOREIGN KEY ("current_order_id") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "truck" ADD CONSTRAINT "trucks_departure_address_id_addresses_id_fk" FOREIGN KEY ("departure_address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "truck" ADD CONSTRAINT "trucks_model_id_truckModels_id_fk" FOREIGN KEY ("model_id") REFERENCES "truckModel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
