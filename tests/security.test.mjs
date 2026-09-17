import { test } from "node:test";
import assert from "node:assert/strict";
import {
  seal,
  unseal,
  secureEqual,
  nonce,
  challenge,
  cookieValue,
  requireOrigin,
} from "../src/server/security.ts";
import handler from "../api/creator.ts";
const secret = "unit-test-only-not-a-production-secret-12345",
  binding = "forgeblog:v1:https://magazine.test:owner/repo";
test("Encrypted sessions round-trip without exposing access token in cookie", () => {
  const data = { token: "super-secret-token", expires: Date.now() + 60000 },
    cookie = seal(data, secret, binding);
  assert.deepEqual(unseal(cookie, secret, binding), data);
  assert.ok(!cookie.includes(data.token));
  assert.notEqual(cookie, seal(data, secret, binding));
});
test("Session tampering, wrong key, wrong origin/repository, expiry rejected", () => {
  const now = Date.now(),
    cookie = seal({ expires: now + 1000 }, secret, binding);
  assert.equal(
    unseal(cookie.slice(0, 20) + "A" + cookie.slice(21), secret, binding),
    null,
  );
  assert.equal(unseal(cookie, secret + "wrong", binding), null);
  assert.equal(unseal(cookie, secret, binding + "other"), null);
  assert.equal(unseal(cookie, secret, binding, now + 1001), null);
  assert.equal(unseal("garbage", secret, binding), null);
  assert.throws(() => seal({}, "short", binding));
});
test("Constant-time equality handles unequal and empty values safely", () => {
  assert.equal(secureEqual("abc", "abc"), true);
  assert.equal(secureEqual("abc", "abd"), false);
  assert.equal(secureEqual("abc", "ab"), false);
  assert.equal(secureEqual("", ""), false);
});
test("PKCE S256 follows RFC 7636 vector and nonce is random", () => {
  assert.equal(
    challenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"),
    "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
  );
  assert.notEqual(nonce(), nonce());
  assert.match(nonce(), /^[\w-]+$/);
});
test("Cookie parser and exact origin do not accept lookalikes", () => {
  assert.equal(
    cookieValue("a=x; __Host-forge-session=abc; b=c", "__Host-forge-session"),
    "abc",
  );
  assert.equal(cookieValue("not-session=abc", "session"), "");
  assert.doesNotThrow(() =>
    requireOrigin("https://magazine.test", "https://magazine.test"),
  );
  for (const origin of [
    undefined,
    "null",
    "https://magazine.test.evil.test",
    "http://magazine.test",
  ])
    assert.throws(() => requireOrigin(origin, "https://magazine.test"));
});
const vars = {
  GITHUB_REPOSITORY: "owner/repo",
  GITHUB_CLIENT_ID: "test-client",
  GITHUB_CLIENT_SECRET: "test-secret",
  SESSION_SECRET: secret,
  PUBLIC_SITE_URL: "https://magazine.test",
};
async function call(
  action,
  method = "GET",
  headers = {},
  body = undefined,
  configured = true,
) {
  const saved = Object.fromEntries(
    Object.keys(vars).map((k) => [k, process.env[k]]),
  );
  for (const [k, v] of Object.entries(vars))
    if (configured) process.env[k] = v;
    else delete process.env[k];
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) {
      this.headers[k.toLowerCase()] = v;
    },
    end(text = "") {
      this.text = text;
    },
  };
  try {
    await handler({ query: { action }, method, headers, body }, res);
    return res;
  } finally {
    for (const [k, v] of Object.entries(saved))
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
  }
}
test("Unconfigured API explicitly reports false, never fake authenticated", async () => {
  const r = await call("session", "GET", {}, undefined, false);
  assert.equal(r.statusCode, 200);
  assert.deepEqual(JSON.parse(r.text), {
    configured: false,
    authenticated: false,
  });
  assert.match(r.headers["cache-control"], /no-store/);
});
test("Git save without a session is denied", async () =>
  assert.equal((await call("save", "POST", {}, {})).statusCode, 401));
test("OAuth redirect carries S256/state and secure HttpOnly cookie, no fake repo grant", async () => {
  const r = await call("login");
  assert.equal(r.statusCode, 303);
  const u = new URL(r.headers.location);
  assert.equal(u.hostname, "github.com");
  assert.equal(u.searchParams.get("code_challenge_method"), "S256");
  assert.ok(u.searchParams.get("state"));
  assert.equal(u.searchParams.get("scope"), null);
  assert.match(r.headers["set-cookie"], /HttpOnly; Secure; SameSite=Lax/);
  assert.equal(
    u.searchParams.get("redirect_uri"),
    "https://magazine.test/api/creator?action=callback",
  );
});
function sessionHeaders(extra = {}) {
  const c = seal(
    {
      token: "private-token",
      login: "editor",
      csrf: "unit-csrf",
      expires: Date.now() + 60000,
    },
    secret,
    binding,
  );
  return {
    cookie: "__Host-forge-session=" + c,
    origin: "https://magazine.test",
    "content-type": "application/json",
    "x-csrf-token": "unit-csrf",
    ...extra,
  };
}
test("Session API returns CSRF but never provider access token", async () => {
  const r = await call("session", "GET", sessionHeaders());
  assert.equal(JSON.parse(r.text).authenticated, true);
  assert.equal(JSON.parse(r.text).csrf, "unit-csrf");
  assert.ok(!r.text.includes("private-token"));
});
test("Mutating API rejects cross-origin and missing CSRF before Git requests", async () => {
  assert.equal(
    (
      await call(
        "save",
        "POST",
        sessionHeaders({ origin: "https://evil.test" }),
        {},
      )
    ).statusCode,
    403,
  );
  assert.equal(
    (await call("save", "POST", sessionHeaders({ "x-csrf-token": "" }), {}))
      .statusCode,
    403,
  );
});
test("Mutating API rejects wrong content type and oversize payload", async () => {
  assert.equal(
    (
      await call(
        "save",
        "POST",
        sessionHeaders({ "content-type": "text/plain" }),
        "{}",
      )
    ).statusCode,
    415,
  );
  assert.equal(
    (await call("save", "POST", sessionHeaders(), " ".repeat(4000001)))
      .statusCode,
    413,
  );
});
test("Logout invalidates cookie explicitly", async () => {
  const r = await call("logout", "POST", sessionHeaders(), {});
  assert.equal(r.statusCode, 200);
  assert.match(r.headers["set-cookie"], /Max-Age=0/);
  assert.equal(JSON.parse(r.text).authenticated, false);
});
