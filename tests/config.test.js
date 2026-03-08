const test = require("node:test");
const assert = require("node:assert/strict");

const { getOfficeConfigInfo, loadConfig } = require("../core/config");

test("loadConfig returns Bala office defaults", () => {
  const config = loadConfig();
  assert.equal(config.officeName, "Bala Agentic Office");
  assert.equal(config.port, 3333);
});

test("office config loader resolves a config source", () => {
  const info = getOfficeConfigInfo();
  assert.ok(info.path);
  assert.ok(info.source === "live" || info.source === "example");
  assert.ok(Array.isArray(info.data?.agents?.list));
});
