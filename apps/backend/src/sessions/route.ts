import type { FastifyPluginAsync, FastifySchema } from "fastify";
import type { CreateSession } from "./create-session.js";
import type { CreateSessionRequest, SessionResponse } from "@verify/contracts";

type SessionRoutesOptions = {
  createSession: CreateSession;
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

  app.post<{ Body: CreateSessionRequest; Reply: SessionResponse }>(
    "/sessions",
    { schema: createSessionSchema },
    async (request, reply) => {
      const session = await createSession.execute({
        clientType: request.body.clientType,
      });

      return reply.code(201).send({
        ...session,
        createdAt: session.createdAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
        desktopClient: session.desktopClient
          ? {
              ...session.desktopClient,
              joinedAt: session.desktopClient.joinedAt.toISOString(),
            }
          : null,
        mobileClient: session.mobileClient
          ? {
              ...session.mobileClient,
              joinedAt: session.mobileClient.joinedAt.toISOString(),
            }
          : null,
      });
    },
  );
};
