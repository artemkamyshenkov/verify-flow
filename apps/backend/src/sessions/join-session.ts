import { SessionRepository } from "./repository.js";
import { createSessionClient, Session } from "./session.js";
import { MobileClientAlreadyJoinedError } from "./errors.js";
import { getValidSession } from "./get-valid-session.js";

export class JoinSession {
  constructor(private readonly repository: SessionRepository) {
    this.repository = repository;
  }

  async execute(sessionId: string): Promise<Session> {
    const session = await getValidSession(this.repository, sessionId);

    if (session.mobileClient) {
      throw new MobileClientAlreadyJoinedError();
    }

    session.mobileClient = createSessionClient("mobile", new Date());
    session.status = "active";

    await this.repository.save(session);

    return session;
  }
}
