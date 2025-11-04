import { MqttClient, connect } from 'mqtt'
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';

class FloatManagerServer {
  private mqttClient: MqttClient; 
  private db: NodePgDatabase;
  
  constructor() {
    this.mqttClient = connect("mqtt://localhost"); 
    this.db = drizzle(Deno.env.get("DATABASE_URL")!);
  }

  start() {
    
  }
}
