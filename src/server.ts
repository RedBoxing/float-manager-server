import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import express from "express";
import { createServer, Server as HttpServer } from "node:http";
import {
  addressesTable,
  truckLocationsTable,
  truckModelsTable,
  trucksTable,
} from "./db/schema.ts";
import { eq, sql } from "drizzle-orm";
import { Kafka, Consumer } from "kafkajs";
import {
  Truck,
  TruckModel,
  WithOneAddress,
  WithOneModel,
} from "@kaplego/floatcommon";
import cors from "cors";

export class FloatManagerBaseServer {
  protected db: NodePgDatabase;

  constructor() {
    this.db = drizzle(Deno.env.get("DATABASE_URL")!);
    migrate(this.db, { migrationsFolder: "./drizzle" });
  }

  async get_truck(id: string): Promise<Truck | null> {
    const trucks = await this.db
      .select()
      .from(trucksTable)
      .where(eq(trucksTable.id, id));

    if (trucks.length == 0) {
      return null;
    }

    return trucks[0] as Truck;
  }

  async get_all_trucks(): Promise<Truck[]> {
    const trucks = await this.db.select().from(trucksTable);
    return trucks as Truck[];
  }
}

export class FloatManagerAPIServer extends FloatManagerBaseServer {
  private api: express.Application;
  private server: HttpServer;

  constructor() {
    super();

    this.api = express();
    this.server = createServer(this.api);
    this.api.use(cors());

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

    this.api.post("/trucks/models", async (req, res) => {
      try {
        const data: TruckModel = req.body;
        const model: typeof truckModelsTable.$inferInsert = data;
        await this.db.insert(truckModelsTable).values(model);
        res.json(model);
      } catch (err) {
        res.json({
          error: true,
          message: err,
        });
      }
    });

    this.api.get("/trucks/models", async (req, res) => {
      try {
        res.json(await this.db.select().from(truckModelsTable));
      } catch (err) {
        res.json({
          error: true,
          message: err,
        });
      }
    });

    this.api.get("/trucks", async (req, res) => {
      res.json(await this.get_all_trucks());
    });

    this.api.get("/truck/:truck_id", async (req, res) => {
      const { truck_id } = req.params;
      const truck = await this.get_truck(truck_id);
      res.json(truck as WithOneModel<WithOneAddress<Truck>>);
    });

    this.api.post("/truck", async (req, res) => {
      const models = await this.db
        .select()
        .from(truckModelsTable)
        .orderBy(sql`random()`)
        .limit(1);
      if (models.length == 0) {
        console.error("No models founds");
      }
      const truckModel = models[0];

      const randomAddress = await this.db
        .select()
        .from(addressesTable)
        .orderBy(sql`random()`)
        .limit(1);
      if (models.length == 0) {
        console.error("No addresses found");
      }
      const departureAddress = randomAddress[0];

      const truck: typeof trucksTable.$inferInsert = {
        model_id: truckModel.id,
        fuel_quantity: truckModel.fuel_capacity,
        departure_address_id: departureAddress.id,
        longitude: 0.0,
        latitude: 0.0,
      };

      await this.db.insert(trucksTable).values(truck);
      res.json(truck as WithOneModel<WithOneAddress<Truck>>);
    });
  }

  start() {
    console.log("Starting API server");

    this.server.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  }
}

export class FloatWorkerNode extends FloatManagerBaseServer {
  private kafka: Kafka;
  private kafkaConsumer: Consumer;

  constructor() {
    super();

    this.kafka = new Kafka({
      clientId: Deno.env.get("HOSTNAME") || "float-manager-server",
      brokers: (Deno.env.get("KAFKA_BROKERS") || "").split(";"),
      ssl: {
        rejectUnauthorized: false,
        ca: [Deno.readTextFileSync("certs/ca.crt")],
        key: Deno.readTextFileSync("certs/privkey.pem"),
        cert: Deno.readTextFileSync("certs/fullchain.pem"),
      },
    });

    this.kafkaConsumer = this.kafka.consumer({
      groupId: "float-manager-server",
    });
  }

  async start() {
    console.log("Starting worker");

    await this.kafkaConsumer.connect();
    await this.kafkaConsumer.subscribe({
      topics: ["truck-telemetry"],
    });

    await this.kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(`[${partition}] [${topic}] ${message.value?.toString()}`);

        if (message.value == null) {
          console.log("Got empty message!");
          return;
        }

        const data = JSON.parse(message.value.toString());
        const { truck_id } = data;

        if (truck_id == undefined) {
          console.log("Got message without any truck_id!");
          return;
        }

        switch (topic) {
          case "truck-telemetry": {
            const { longitude, latitude, state, fuel_quantity, timestamp } =
              data;

            await this.db
              .update(trucksTable)
              .set({ longitude, latitude, state, fuel_quantity })
              .where(eq(trucksTable.id, truck_id));

            const location: typeof truckLocationsTable.$inferInsert = {
              truck_id: truck_id,
              timestamp: timestamp,
              longitude,
              latitude,
            };

            await this.db.insert(truckLocationsTable).values(location);
            break;
          }
        }
      },
    });
  }
}
