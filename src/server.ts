import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import express from "express";
import { Server, Socket } from "socket.io";
import { createServer, Server as HttpServer } from "node:http";
import { addresses, truckModels, trucks } from "./db/schema.ts";
import { eq, inArray, sql } from "drizzle-orm";

export class FloatManagerServer {
  private db: NodePgDatabase;
  private api: express.Application;
  private server: HttpServer;
  private io: Server;
  private connectedTrucks: string[] = [];
  private connectedClients: Socket[] = [];

  constructor() {
    this.db = drizzle(Deno.env.get("DATABASE_URL")!);

    migrate(this.db, { migrationsFolder: "./drizzle" });

    this.api = express();
    this.server = createServer(this.api);
    this.io = new Server(this.server);

    this.api.get("/health", (req, res) => {
      res.send("OK");
    });

    this.api.get("/version", (req, res) => {
      const isProduction =
        Deno.env.get("NODE_ENV") === "production" ||
        Deno.env.get("DENO_ENV") === "production" ||
        Deno.env.get("APP_ENV") === "production";

      let version: string;
      if (isProduction) {
        version = Deno.env.get("VERSION") || "v0.0.0";
      } else {
        version = Deno.env.get("GIT_COMMIT") || "dev";
      }

      res.json({ version });
    });

    this.api.get("/trucks", async (req, res) => {
      if (this.connectedTrucks.length == 0) {
        res.json([]);
        return;
      }

      const result = await this.db
        .select()
        .from(trucks)
        .where(inArray(trucks.id, this.connectedTrucks));
      res.json(result);
    });

    this.io.on("connection", (socket) => {
      console.log("new connection");
      let current_id: string = "";

      socket.on("setup_client", () => {
        this.connectedClients.push(socket);
      });

      socket.on("request_id", async () => {
        const models = await this.db
          .select()
          .from(truckModels)
          .orderBy(sql`RAND()`)
          .limit(1);
        if (models.length == 0) {
          console.error("No models founds");
        }
        const truckModel = models[0];

        const randomAddress = await this.db
          .select()
          .from(addresses)
          .orderBy(sql`RAND()`)
          .limit(1);
        if (models.length == 0) {
          console.error("No addresses found");
        }
        const departureAddress = randomAddress[0];

        const truck: typeof trucks.$inferInsert = {
          model: truckModel.id,
          fuel_quantity: truckModel.fuel_capacity,
          departure_address: departureAddress.id,
          longitude: "0.0",
          latitude: "0.0",
        };

        await this.db.insert(trucks).values(truck);
        current_id = truck.id!;
        this.connectedTrucks.push(current_id);

        socket.emit("truck_data", truck);
      });

      socket.on("request_data", async (data) => {
        const truck = (
          await this.db.select().from(trucks).where(eq(trucks.id, data.id))
        )[0];
        current_id = truck.id;
        this.connectedTrucks.push(current_id);
        socket.emit("truck_data", truck);
      });

      socket.on("position", async (data) => {
        if (current_id == "") {
          return;
        }

        await this.db
          .update(trucks)
          .set({ longitude: data.longitude, latitude: data.latitude })
          .where(eq(trucks.id, current_id));

        for (const sock of this.connectedClients) {
          sock.emit("truck_update", {
            id: current_id,
            longitude: data.longitude,
            latitude: data.latitude,
          });
        }
      });

      socket.on("disconnect", () => {
        console.log("lost connection");

        let index = this.connectedTrucks.indexOf(current_id);
        if (index >= 0) {
          this.connectedTrucks.splice(index, 1);
        }

        index = this.connectedClients.indexOf(socket);
        if (index >= 0) {
          this.connectedClients.splice(index, 1);
        }
      });
    });
  }

  start() {
    this.server.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  }
}
