import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import express from 'express'
import { Server } from 'socket.io'
import { createServer, Server as HttpServer } from 'node:http';
import { addresses, truckModels, trucks } from './db/schema.ts'
import { eq, inArray, sql } from "drizzle-orm";

export class FloatManagerServer {
  private db: NodePgDatabase;
  private api: express.Application;
  private server: HttpServer;
  private io: Server;
  private connectedTrucks: string[] = [];

  constructor() {
    this.db = drizzle(Deno.env.get("DATABASE_URL")!);
    this.api = express();
    this.server = createServer(this.api);
    this.io = new Server(this.server);

    this.api.get("/health", (req, res) => {
      res.send("OK");
    })

    this.api.get("/trucks", async (req, res) => {
      if(this.connectedTrucks.length == 0) {
        res.json([]);
        return;
      }
      
      const result = (await this.db.select().from(trucks).where(inArray(trucks.id, this.connectedTrucks)))
      res.json(result);
    })

    this.io.on('connection', (socket) => {
      console.log("new connection");
      let current_id: string = "";

      socket.on('request_id', async () => {
        const models = (await this.db.select().from(truckModels).orderBy(sql`RAND()`).limit(1));
        if(models.length == 0) {
          console.error("No models founds")
        }
        const truckModel = models[0];

        const randomAddress = (await this.db.select().from(addresses).orderBy(sql`RAND()`).limit(1));
        if(models.length == 0) {
          console.error("No addresses found");
        }
        const departureAddress = randomAddress[0];

        const truck: typeof trucks.$inferInsert = {
          model: truckModel.id,
          fuel_quantity: truckModel.fuel_capacity,
          departure_address: departureAddress.id,
          longitude: "0.0",
          latitude: "0.0"
        }

        await this.db.insert(trucks).values(truck)
        current_id = truck.id!;
        this.connectedTrucks.push(current_id);

        socket.emit("truck_data", truck)
      })

      socket.on("request_data", async (data) => {
        const truck = (await this.db.select().from(trucks).where(eq(trucks.id, data.id)))[0];
        current_id = truck.id;
        this.connectedTrucks.push(current_id)
        socket.emit("truck_data", truck);
      })

      socket.on('position', (data) => {

      });

      socket.on('disconnect', () => {
        console.log("lost connection");
        this.connectedTrucks.splice(this.connectedTrucks.indexOf(current_id), 1);
      });
    });
  }

  start() {
    this.server.listen(3000, () => {
      console.log('server running at http://localhost:3000');
    });
  }
}
