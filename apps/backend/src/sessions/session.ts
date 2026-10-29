import type { ClientType, SessionStatus } from "@verify/contracts";

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
