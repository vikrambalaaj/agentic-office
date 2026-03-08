const test = require("node:test");
const assert = require("node:assert/strict");

const { createServer } = require("../core/server");

async function startServer() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

test("GET /api/health returns ok", async () => {
  const { server, baseUrl } = await startServer();
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.ok, true);
    assert.equal(data.status, "ok");
  } finally {
    server.close();
  }
});

test("GET /api/office-state returns Bala office agents", async () => {
  const { server, baseUrl } = await startServer();
  try {
    const response = await fetch(`${baseUrl}/api/office-state`);
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.ok(data.office);
    assert.ok(Array.isArray(data.agents));
    assert.ok(data.agents.length >= 1);
  } finally {
    server.close();
  }
});
