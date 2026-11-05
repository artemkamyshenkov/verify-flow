import type { SessionRepository } from "./repository.js";
import type { Session } from "./session.js";
import { SessionExpiredError, SessionNotFoundError } from "./errors.js";

export async function getValidSession(
  repository: SessionRepository,
  sessionId: string,
): Promise<Session> {
  const session = await repository.findById(sessionId);

  if (!session) {
    throw new SessionNotFoundError();
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    throw new SessionExpiredError();
  }

  return session;
}
