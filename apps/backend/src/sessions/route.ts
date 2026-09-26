import type { FastifyPluginAsync, FastifySchema } from "fastify";
import type { CreateSession } from "./create-session.js";
import type { ClientType } from "./session.js";

type SessionRoutesOptions = {
  createSession: CreateSession;
};

type CreateSessionBody = {
  clientType: ClientType;
};

export const sessionRoutes: FastifyPluginAsync<SessionRoutesOptions> = async (
  app,
  { createSession },
) => {
  const createSessionSchema = {
    body: {
      type: "object",
      additionalProperties: false,
      required: ["clientType"],
      properties: {
        clientType: {
          type: "string",
          enum: ["desktop", "mobile"],
        },
      },
    },
  } satisfies FastifySchema;

  app.post<{ Body: CreateSessionBody }>(
    "/sessions",
    { schema: createSessionSchema },
    async (request, reply) => {
      const session = await createSession.execute({
        clientType: request.body.clientType,
      });

      return reply.code(201).send(session);
    },
  );
};
