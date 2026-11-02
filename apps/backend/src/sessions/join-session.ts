import { SessionRepository } from "./repository.js";
import { createSessionClient, Session } from "./session.js";
import {
  MobileClientAlreadyJoinedError,
  SessionExpiredError,
  SessionNotFoundError,
} from "./errors.js";

export class JoinSession {
  constructor(private readonly repository: SessionRepository) {
    this.repository = repository;
  }

  async execute(sessionId: string): Promise<Session> {
    const session = await this.repository.findById(sessionId);

    if (!session) {
      throw new SessionNotFoundError();
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new SessionExpiredError();
    }

    if (session.mobileClient) {
      throw new MobileClientAlreadyJoinedError();
    }

    session.mobileClient = createSessionClient("mobile", new Date());
    session.status = "active";

    await this.repository.save(session);

    return session;
  }
}
