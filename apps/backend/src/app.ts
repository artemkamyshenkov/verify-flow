import cors from "@fastify/cors";
import fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
} from "fastify";
import { CreateSession } from "./sessions/create-session.js";
import { InMemorySessionRepository } from "./sessions/in-memory-repository.js";
import { sessionRoutes } from "./sessions/route.js";

export function buildApp(options: FastifyServerOptions = {}): FastifyInstance {
  const app = fastify(options);

  app.register(cors, {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  });

  app.get("/health", async () => ({ status: "ok" }));

  const repository = new InMemorySessionRepository();
  const createSession = new CreateSession(repository);

  app.register(sessionRoutes, { createSession });

  return app;
}
