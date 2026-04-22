import Fastify from "fastify";
import { weighInRoutes } from "./routes/weighIns";
import { workerRoutes } from "./routes/workers";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  app.register(weighInRoutes, { prefix: "/api" });
  app.register(workerRoutes, { prefix: "/api" });

  

  return app;
}
