import { SessionRepository } from "./repository.js";
import { Session } from "./session.js";
export class InMemorySessionRepository implements SessionRepository {
  private readonly sessions = new Map<string, Session>();

  async save(session: Session): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async findById(id: string): Promise<Session | null> {
    return this.sessions.get(id) ?? null;
  }
}
