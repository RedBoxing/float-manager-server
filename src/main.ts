import { FloatManagerServer } from "./server.ts";
import { Command } from "commander";

const program = new Command();
program
  .command("start-api")
  .description("Start as an API server")
  .action((str, options) => {
    const server = new FloatManagerServer();
    server.start_api();
  });

program
  .command("start-worker")
  .description("Start as a worker node")
  .action(async (str, option) => {
    const server = new FloatManagerServer();
    await server.start_worker();
  });

program.parse();
