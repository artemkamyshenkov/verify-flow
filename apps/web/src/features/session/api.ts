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
