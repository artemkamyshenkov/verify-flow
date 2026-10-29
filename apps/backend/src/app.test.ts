import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from './app.js'

test('GET /health returns the backend health status', async (t) => {
  const app = buildApp()
  t.after(() => app.close())

  const response = await app.inject({
    method: 'GET',
    url: '/health',
  })

  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.json(), { status: 'ok' })
})

for (const origin of ['http://localhost:5173', 'http://127.0.0.1:5173']) {
  test(`session requests support CORS from ${origin}`, async (t) => {
    const app = buildApp()
    t.after(() => app.close())

    const preflight = await app.inject({
      method: 'OPTIONS',
      url: '/sessions',
      headers: {
        origin,
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type',
      },
    })

    assert.equal(preflight.statusCode, 204)
    assert.equal(preflight.headers['access-control-allow-origin'], origin)
    assert.match(String(preflight.headers['access-control-allow-methods']), /POST/)
    assert.match(String(preflight.headers['access-control-allow-headers']), /content-type/i)

    const response = await app.inject({
      method: 'POST',
      url: '/sessions',
      headers: { origin },
      payload: { clientType: 'desktop' },
    })

    assert.equal(response.statusCode, 201)
    assert.equal(response.headers['access-control-allow-origin'], origin)
  })
}

test('CORS does not allow unrelated origins', async (t) => {
  const app = buildApp()
  t.after(() => app.close())

  const response = await app.inject({
    method: 'GET',
    url: '/health',
    headers: { origin: 'https://example.com' },
  })

  assert.equal(response.headers['access-control-allow-origin'], undefined)
})
