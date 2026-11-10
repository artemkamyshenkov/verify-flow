import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { EventEmitter, once } from "node:events";
import test from "node:test";
import fastify from "fastify";
import { CreateSession } from "./create-session.js";
import { JoinSession } from "./join-session.js";
import { InMemorySessionRepository } from "./in-memory-repository.js";
import { sessionRoutes } from "./route.js";

function setup() {
  const repository = new InMemorySessionRepository();
  const createSession = new CreateSession(repository);
  const app = fastify();
  const events = new EventEmitter();
  app.register(sessionRoutes, {
    prefix: "/api",
    createSession,
    joinSession: new JoinSession(repository),
    events,
  });
  return { app, repository, createSession, events };
}

test("join persists a mobile client, returns ISO dates and rejects a second join", async (t) => {
  const { app, repository } = setup();
  t.after(() => app.close());
  const created = await app.inject({
    method: "POST", url: "/api/sessions", payload: { clientType: "desktop" },
  });
  const { id } = created.json();
  const url = `/api/sessions/${id}/join`;
  const response = await app.inject({ method: "POST", url });
  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.equal(body.id, id);
  assert.equal(body.status, "active");
  assert.equal(body.mobileClient.role, "mobile");
  for (const date of [body.createdAt, body.expiresAt, body.mobileClient.joinedAt, body.desktopClient.joinedAt]) {
    assert.equal(typeof date, "string");
    assert.equal(new Date(date).toISOString(), date);
  }
  assert.equal((await repository.findById(id))?.mobileClient?.id, body.mobileClient.id);
  assert.equal((await app.inject({ method: "POST", url })).statusCode, 409);
});

test("join returns 400 for an invalid UUID and 404 for a missing session", async (t) => {
  const { app } = setup();
  t.after(() => app.close());
  for (const [id, status] of [["invalid", 400], [randomUUID(), 404]] as const) {
    const response = await app.inject({ method: "POST", url: `/api/sessions/${id}/join` });
    assert.equal(response.statusCode, status);
  }
});

test("join returns 410 for an expired session without adding a client", async (t) => {
  const { app, createSession, repository } = setup();
  t.after(() => app.close());
  const session = await createSession.execute({ clientType: "desktop" });
  session.expiresAt = new Date(0);
  await repository.save(session);
  const response = await app.inject({ method: "POST", url: `/api/sessions/${session.id}/join` });
  assert.equal(response.statusCode, 410);
  assert.equal((await repository.findById(session.id))?.mobileClient, null);
});

test("unexpected join errors are handled as 500", async (t) => {
  const { app, repository } = setup();
  t.after(() => app.close());
  t.mock.method(repository, "findById", async () => { throw new Error("Repository failed"); });
  const response = await app.inject({ method: "POST", url: `/api/sessions/${randomUUID()}/join` });
  assert.equal(response.statusCode, 500);
});

test("SSE sends session events and removes the listener on disconnect", async (t) => {
  const { app, events } = setup();
  const controller = new AbortController();
  t.after(async () => {
    controller.abort();
    await app.close();
  });
  const address = await app.listen({ host: "127.0.0.1", port: 0 });
  const id = randomUUID();
  const eventName = `photo-uploaded:${id}`;
  const response = await fetch(`${address}/api/sessions/${id}/events`, {
    signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]),
  });
  assert.match(response.headers.get("content-type") ?? "", /text\/event-stream/);
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  assert.match(decoder.decode((await reader.read()).value), /event: connected/);
  assert.equal(events.listenerCount(eventName), 1);
  assert.equal(events.emit(`photo-uploaded:${randomUUID()}`), false);
  events.emit(eventName);
  assert.equal(decoder.decode((await reader.read()).value), "event: photo-uploaded\ndata: {}\n\n");
  const removed = once(events, "removeListener", { signal: AbortSignal.timeout(5000) });
  controller.abort();
  await removed;
  assert.equal(events.listenerCount(eventName), 0);
});
