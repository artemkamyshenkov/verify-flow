export class SessionNotFoundError extends Error {
  constructor() {
    super("Session not found");
    this.name = "SessionNotFoundError";
  }
}

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired");
    this.name = "SessionExpiredError";
  }
}

export class MobileClientAlreadyJoinedError extends Error {
  constructor() {
    super("Session already exist");
    this.name = "MobileClientAlreadyJoinedError";
  }
}

export class MobileClientNotJoinedError extends Error {
  constructor() {
    super("Mobile client has not joined the session");
    this.name = "MobileClientNotJoinedError";
  }
}
