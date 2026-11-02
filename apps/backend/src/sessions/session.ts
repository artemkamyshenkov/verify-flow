import type { ClientType, SessionStatus } from "@verify/contracts";
import { randomUUID } from "crypto";

export type SessionClient<Role extends ClientType> = {
  id: string;
  role: Role;
  joinedAt: Date;
};

export type Session = {
  id: string;
  status: SessionStatus;
  createdAt: Date;
  expiresAt: Date;
  desktopClient: SessionClient<"desktop"> | null;
  mobileClient: SessionClient<"mobile"> | null;
};

export function createSessionClient<Role extends ClientType>(
  role: Role,
  joinedAt: Date,
): SessionClient<Role> {
  return {
    id: randomUUID(),
    role,
    joinedAt,
  };
}
