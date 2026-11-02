import type { CreateSessionRequest, SessionResponse } from "@verify/contracts";
import { detectClientType } from "../../utils/clientType";
import { request, Result } from "../../utils/request";

export async function createSession(): Promise<Result<SessionResponse>> {
  try {
    const command: CreateSessionRequest = {
      clientType: detectClientType(),
    };

    const data = await request<SessionResponse>("/sessions", {
      method: "POST",
      body: JSON.stringify(command),
    });

    return { ok: true, data };
  } catch (error) {
    console.error(error);

    return { ok: false, error: "create session error" };
  }
}

export async function joinSession(
  sessionId?: string,
): Promise<Result<SessionResponse>> {
  try {
    if (!sessionId) {
      throw new Error("session ID is required");
    }

    const data = await request<SessionResponse>(`/sessions/${sessionId}/join`, {
      method: "POST",
    });

    return { ok: true, data };
  } catch (error) {
    console.error(error);

    return { ok: false, error: "join session error" };
  }
}
