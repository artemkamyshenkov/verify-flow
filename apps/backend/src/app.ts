import fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
} from "fastify";
import { CreateSession } from "./sessions/create-session.js";
import { InMemorySessionRepository } from "./sessions/in-memory-repository.js";
import { sessionRoutes } from "./sessions/route.js";

export function buildApp(options: FastifyServerOptions = {}): FastifyInstance {
  const app = fastify(options);

  app.get("/health", async () => ({ status: "ok" }));

  const repository = new InMemorySessionRepository();
  const createSession = new CreateSession(repository);

  app.register(sessionRoutes, { createSession });

  return app;
}
