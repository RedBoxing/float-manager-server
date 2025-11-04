import { integer, pgTable, uuid, varchar, decimal, boolean, char } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  username: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar({ length: 255 }),
  admin: boolean().default(false)
});

export const addresses = pgTable("addresses", {
  id: uuid().primaryKey().defaultRandom(),
  city: varchar({ length: 255 }).notNull(),
  zip: char({ length: 5 }).notNull(),
  longitude: decimal().notNull(),
  latitude: decimal().notNull()
})

export const orders = pgTable("orders", {
  id: uuid().primaryKey().defaultRandom(),
  client_id: uuid().notNull().references(() => users.id),
  address_id: uuid().notNull().references(() => addresses.id),
  total_cost: decimal().notNull(),
  total_weight: decimal().notNull(),
  status: integer().notNull()
})

export const trucks = pgTable("trucks", {
  id: uuid().primaryKey().defaultRandom(),
  longitude: decimal().notNull(),
  latitude: decimal().notNull(),
  current_order_id: uuid().references(() => orders.id),
  state: integer().default(0),
  fuel_quantity: decimal().notNull(),
  fuel_capacity: decimal().notNull(),
  storage_capacity: decimal().notNull()
});

