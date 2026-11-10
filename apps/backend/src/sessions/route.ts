import type { FastifyPluginAsync, FastifySchema } from "fastify";
import type { EventEmitter } from "node:events";
import type { CreateSession } from "./create-session.js";
import type { CreateSessionRequest, SessionResponse } from "@verify/contracts";
import type { JoinSession } from "./join-session.js";
import type { Session } from "./session.js";
import {
  MobileClientAlreadyJoinedError,
  SessionExpiredError,
  SessionNotFoundError,
} from "./errors.js";

type SessionRoutesOptions = {
  createSession: CreateSession;
  joinSession: JoinSession;
  events: EventEmitter;
};

function toSessionResponse(session: Session): SessionResponse {
  return {
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
  };
}

export const sessionRoutes: FastifyPluginAsync<SessionRoutesOptions> = async (
  app,
  { createSession, joinSession, events },
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

      return reply.code(201).send(toSessionResponse(session));
    },
  );

  const joinSessionSchema = {
    params: {
      type: "object",
      required: ["sessionId"],
      properties: {
        sessionId: { type: "string", format: "uuid" },
      },
    },
  } satisfies FastifySchema;

  app.post<{
    Params: { sessionId: string };
    Reply: {
      200: SessionResponse;
      404: { message: string };
      409: { message: string };
      410: { message: string };
    };
  }>(
    "/sessions/:sessionId/join",
    { schema: joinSessionSchema },
    async (request, reply) => {
      try {
        const session = await joinSession.execute(request.params.sessionId);
        return reply.code(200).send(toSessionResponse(session));
      } catch (error) {
        if (error instanceof SessionNotFoundError) {
          return reply.code(404).send({ message: error.message });
        }
        if (error instanceof SessionExpiredError) {
          return reply.code(410).send({ message: error.message });
        }
        if (error instanceof MobileClientAlreadyJoinedError) {
          return reply.code(409).send({ message: error.message });
        }
        throw error;
      }
    },
  );

  app.get<{ Params: { sessionId: string } }>("/sessions/:sessionId/events", async (request, reply) => {
    const eventName = `photo-uploaded:${request.params.sessionId}`;
    const onPhotoUploaded = () => {
      if (!reply.raw.destroyed && !reply.raw.writableEnded) {
        reply.raw.write("event: photo-uploaded\ndata: {}\n\n");
      }
    };

    events.on(eventName, onPhotoUploaded);
    reply.raw.once("close", () => {
      events.off(eventName, onPhotoUploaded);
    });

    reply.hijack();

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    });

    reply.raw.write(
      'event: connected\ndata: {"message":"Соединение открыто"}\n\n',
    );
  });
};
