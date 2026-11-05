import cors from "@fastify/cors";
import fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
} from "fastify";
import { CreateSession } from "./sessions/create-session.js";
import { InMemorySessionRepository } from "./sessions/in-memory-repository.js";
import { sessionRoutes } from "./sessions/route.js";
import { JoinSession } from "./sessions/join-session.js";
import multipart from "@fastify/multipart";
import { InMemoryPhotoRepository } from "./photos/in-memory-repository.js";
import { UploadPhoto } from "./photos/upload-photo.js";
import { photoRoutes } from "./photos/route.js";

export function buildApp(options: FastifyServerOptions = {}): FastifyInstance {
  const app = fastify(options);

  app.register(cors, {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  });

  app.register(multipart, {
    limits: {
      files: 1,
      fileSize: 5 * 1024 * 1024,
    },
  });
  app.get("/health", async () => ({ status: "ok" }));

  const repository = new InMemorySessionRepository();
  const createSession = new CreateSession(repository);
  const joinSession = new JoinSession(repository);

  app.register(sessionRoutes, { prefix: "/api", createSession, joinSession });
  const photos = new InMemoryPhotoRepository();
  const uploadPhoto = new UploadPhoto(photos, repository);
  app.register(photoRoutes, { prefix: "/api", uploadPhoto });

  return app;
}
