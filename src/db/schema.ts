import {
  integer,
  pgTable,
  uuid,
  varchar,
  numeric,
  boolean,
  char,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  username: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar({ length: 255 }),
  admin: boolean().default(false),
});

export const addressesTable = pgTable("addresses", {
  id: uuid().primaryKey().defaultRandom(),
  city: varchar({ length: 255 }).notNull(),
  zip: char({ length: 5 }).notNull(),
  longitude: numeric<"number">().notNull(),
  latitude: numeric<"number">().notNull(),
});

export const ordersTable = pgTable("orders", {
  id: uuid().primaryKey().defaultRandom(),
  client_id: uuid()
    .notNull()
    .references(() => usersTable.id),
  address_id: uuid()
    .notNull()
    .references(() => addressesTable.id),
  total_cost: numeric<"number">().notNull(),
  total_weight: numeric<"number">().notNull(),
  status: integer().notNull(),
});

export const truckModelsTable = pgTable("truckModels", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  fuel_capacity: numeric<"number">().notNull(),
  storage_capacity: numeric<"number">().notNull(),
});

export const trucksTable = pgTable("trucks", {
  id: uuid().primaryKey().defaultRandom(),
  model_id: integer()
    .notNull()
    .references(() => truckModelsTable.id),
  departure_address_id: uuid()
    .notNull()
    .references(() => addressesTable.id),
  longitude: numeric<"number">().notNull(),
  latitude: numeric<"number">().notNull(),
  current_order_id: uuid().references(() => ordersTable.id),
  state: integer().default(0),
  fuel_quantity: numeric<"number">().notNull(),
});
