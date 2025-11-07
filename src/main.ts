import { FloatManagerAPIServer, FloatWorkerNode } from "./server.ts";
import { Command } from "commander";

const program = new Command();
program
  .command("start-api")
  .description("Start as an API server")
  .action((str, options) => {
    const server = new FloatManagerAPIServer();
    server.start();
  });

program
  .command("start-worker")
  .description("Start as a worker node")
  .action(async (str, option) => {
    const worker = new FloatWorkerNode();
    await worker.start();
  });

program.parse();
