import { randomUUID } from "node:crypto";
import type { ClientType } from "@verify/contracts";
import { createSessionClient, type Session } from "./session.js";
import { SessionRepository } from "./repository.js";

const SESSION_TTL_MS = 15 * 60 * 1000;

export type CreateSessionCommand = {
  clientType: ClientType;
};

export class CreateSession {
  constructor(private readonly repository: SessionRepository) {
    this.repository = repository;
  }

  async execute(command: CreateSessionCommand): Promise<Session> {
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + SESSION_TTL_MS);

    const session: Session = {
      id: randomUUID(),
      status: command.clientType === "mobile" ? "active" : "created",
      createdAt,
      expiresAt,
      desktopClient:
        command.clientType === "desktop"
          ? createSessionClient("desktop", createdAt)
          : null,
      mobileClient:
        command.clientType === "mobile"
          ? createSessionClient("mobile", createdAt)
          : null,
    };

    await this.repository.save(session);

    return session;
  }
}
