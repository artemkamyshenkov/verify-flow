export type ClientType = "desktop" | "mobile";

export type SessionStatus = "created" | "active";

export type CreateSessionRequest = {
  clientType: ClientType;
};

export type SessionClientResponse<Role extends ClientType> = {
  id: string;
  role: Role;
  joinedAt: string;
};

export type SessionResponse = {
  id: string;
  status: SessionStatus;
  createdAt: string;
  expiresAt: string;
  desktopClient: SessionClientResponse<"desktop"> | null;
  mobileClient: SessionClientResponse<"mobile"> | null;
};
