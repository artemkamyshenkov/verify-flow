import { Session } from "./session.js";

export type SessionRepository = {
  save(session: Session): Promise<void>;
  findById(id: string): Promise<Session | null>;
};
