export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const headers = new Headers(options?.headers);

  if (options?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const baseUrl = "http://127.0.0.1:3000";
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
