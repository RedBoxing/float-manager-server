-- CreateTable
CREATE TABLE "addresses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "city" VARCHAR(255) NOT NULL,
    "zip" CHAR(5) NOT NULL,
    "longitude" DECIMAL NOT NULL,
    "latitude" DECIMAL NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "client_id" UUID NOT NULL,
    "address_id" UUID NOT NULL,
    "total_cost" DECIMAL NOT NULL,
    "total_weight" DECIMAL NOT NULL,
    "status" INTEGER NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "truckLocations" (
    "truck_id" UUID NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL,
    "longitude" DECIMAL NOT NULL,
    "latitude" DECIMAL NOT NULL,

    CONSTRAINT "truckLocations_truck_id_timestamp_pk" PRIMARY KEY ("truck_id","timestamp")
);

-- CreateTable
CREATE TABLE "truckModels" (
    "id" SERIAL NOT NULL,
    "fuel_capacity" DECIMAL NOT NULL,
    "storage_capacity" DECIMAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "truckModels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trucks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "model_id" INTEGER NOT NULL,
    "departure_address_id" UUID NOT NULL,
    "longitude" DECIMAL NOT NULL,
    "latitude" DECIMAL NOT NULL,
    "current_order_id" UUID,
    "state" INTEGER NOT NULL DEFAULT 0,
    "fuel_quantity" DECIMAL NOT NULL,

    CONSTRAINT "trucks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255),
    "admin" BOOLEAN DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_unique" ON "users"("email");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "truckLocations" ADD CONSTRAINT "truckLocations_truck_id_trucks_id_fk" FOREIGN KEY ("truck_id") REFERENCES "trucks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_current_order_id_orders_id_fk" FOREIGN KEY ("current_order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_departure_address_id_addresses_id_fk" FOREIGN KEY ("departure_address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_model_id_truckModels_id_fk" FOREIGN KEY ("model_id") REFERENCES "truckModels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
