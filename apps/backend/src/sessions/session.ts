export type SessionStatus = "created" | "active";

export type ClientType = "desktop" | "mobile";

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

export type CreateSession = {
  clientType: ClientType;
};
