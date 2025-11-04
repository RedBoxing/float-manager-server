import { connect } from 'mqtt'
import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(Deno.env.get("DATABASE_URL")!);

const client = connect("mqtt://localhost")
