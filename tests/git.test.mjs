import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { draft, asset } from "./helpers.mjs";
import { saveDraftToGit } from "../src/server/github.ts";
const config = {
  repository: "owner/repo",
  origin: "https://magazine.test",
  secret: "a".repeat(40),
  clientId: "client",
  clientSecret: "secret",
  mode: "app",
  allowed: [],
};
const session = {
  token: "test-token",
  login: "editor",
  csrf: "csrf",
  expires: Date.now() + 60000,
};
function gitMock(options = {}) {
  const calls = [];
  const responder = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  const fetcher = async (url, init = {}) => {
    const u = new URL(url),
      p = decodeURIComponent(u.pathname),
      method = init.method || "GET",
      body = init.body ? JSON.parse(init.body) : undefined;
    calls.push({ p, method, body, url });
    assert.equal(u.hostname, "api.github.com");
    assert.equal(init.headers.Authorization, "Bearer test-token");
    if (p === "/repos/owner/repo")
      return responder({
        default_branch: "main",
        permissions: { push: options.push !== false },
      });
    if (
      p.includes("/contents/src/content/authors/") ||
      p.includes("/contents/src/content/categories/")
    )
      return responder(
        options.missingReference
          ? { message: "Not found" }
          : { content: "e30=" },
        options.missingReference ? 404 : 200,
      );
    if (p.includes("/git/ref/heads/forgeblog/"))
      return responder(
        options.existingHead
          ? { object: { sha: options.existingHead } }
          : { message: "Not found" },
        options.existingHead ? 200 : 404,
      );
    if (p.endsWith("/git/ref/heads/main"))
      return responder({ object: { sha: "base-head" } });
    if (p.endsWith("/git/refs") && method === "POST")
      return responder({ ref: body.ref }, 201);
    if (p.includes("/contents/.forgeblog/"))
      return options.priorSlug
        ? responder({
            content: Buffer.from(
              JSON.stringify({ slug: options.priorSlug }),
            ).toString("base64"),
          })
        : responder({ message: "Not found" }, 404);
    if (p.includes("/contents/src/content/posts/"))
      return responder(
        options.collide ? { content: "exists" } : { message: "Not found" },
        options.collide ? 200 : 404,
      );
    if (p.includes("/git/commits/") && method === "GET")
      return responder({ tree: { sha: "base-tree" } });
    if (p.endsWith("/git/blobs"))
      return responder({ sha: "blob-" + calls.length }, 201);
    if (p.endsWith("/git/trees")) return responder({ sha: "new-tree" }, 201);
    if (p.endsWith("/git/commits") && method === "POST")
      return responder({ sha: "new-commit" }, 201);
    if (p.includes("/git/refs/heads/") && method === "PATCH")
      return responder(
        options.conflict
          ? { message: "not fast-forward" }
          : { object: { sha: body.sha } },
        options.conflict ? 422 : 200,
      );
    if (p.endsWith("/pulls")) {
      if (options.prFailure) return responder({ message: "Forbidden" }, 403);
      return method === "GET"
        ? responder([])
        : responder({ html_url: "https://github.com/owner/repo/pull/12" }, 201);
    }
    throw new Error("Unexpected mock request: " + method + " " + url);
  };
  return { calls, fetcher };
}
test("Git save atomically commits MDX+source on a per-draft branch; never reports published", async () => {
  const d = draft(),
    m = gitMock();
  const result = await saveDraftToGit(config, session, { draft: d }, m.fetcher);
  assert.equal(result.git.head, "new-commit");
  assert.equal(result.published, false);
  assert.equal(result.git.branch, "forgeblog/draft-" + d.id);
  const tree = m.calls.find((c) => c.p.endsWith("/git/trees")).body;
  assert.deepEqual(
    tree.tree.map((e) => e.path),
    [`src/content/posts/${d.slug}.mdx`, `.forgeblog/drafts/${d.id}.json`],
  );
  const patch = m.calls.find((c) => c.method === "PATCH");
  assert.equal(patch.body.force, false);
  assert.ok(
    m.calls
      .find((c) => c.p.endsWith("/git/blobs"))
      .body.content.includes('status: "draft"'),
  );
  assert.ok(!m.calls.some((c) => c.p.endsWith("/pulls")));
});
test("Publication creates a PR, not a merge or deployment", async () => {
  const m = gitMock(),
    d = draft(),
    r = await saveDraftToGit(
      config,
      session,
      { draft: d, publish: true },
      m.fetcher,
    );
  assert.equal(r.published, false);
  assert.match(r.git.prUrl, /pull\/12/);
  assert.ok(m.calls.some((c) => c.p.endsWith("/pulls") && c.method === "POST"));
  assert.ok(!m.calls.some((c) => c.p.endsWith("/merge")));
  assert.ok(
    m.calls
      .find((c) => c.p.endsWith("/git/blobs"))
      .body.content.includes('status: "published"'),
  );
});
test("Successful commit remains acknowledged when PR creation fails", async () => {
  const m = gitMock({ prFailure: true }),
    r = await saveDraftToGit(
      config,
      session,
      { draft: draft(), publish: true },
      m.fetcher,
    );
  assert.equal(r.git.head, "new-commit");
  assert.ok(r.warning);
  assert.equal(r.git.prUrl, undefined);
  assert.equal(r.published, false);
});
test("Stale expected head causes 409 without writing blobs or force pushing", async () => {
  const m = gitMock({ existingHead: "newer-head" });
  await assert.rejects(
    saveDraftToGit(
      config,
      session,
      { draft: draft(), expectedHead: "old-head" },
      m.fetcher,
    ),
    (e) => e.status === 409,
  );
  assert.ok(!m.calls.some((c) => c.method === "POST" || c.method === "PATCH"));
});
test("Existing draft is updated only at the exact expected head", async () => {
  const d = draft(),
    m = gitMock({ existingHead: "expected", priorSlug: d.slug });
  await saveDraftToGit(
    config,
    session,
    { draft: d, expectedHead: "expected" },
    m.fetcher,
  );
  assert.deepEqual(
    m.calls.find((c) => c.p.endsWith("/git/commits") && c.method === "POST")
      .body.parents,
    ["expected"],
  );
});
test("Slug rename and existing target article are not silently overwritten", async () => {
  for (const options of [
    { existingHead: "expected", priorSlug: "old-slug" },
    { collide: true },
  ]) {
    const m = gitMock(options);
    await assert.rejects(
      saveDraftToGit(
        config,
        session,
        { draft: draft(), expectedHead: options.existingHead },
        m.fetcher,
      ),
      (e) => e.status === 409,
    );
    assert.ok(!m.calls.some((c) => c.p.endsWith("/git/blobs")));
  }
});
test("Permission and missing references fail before any new content commit", async () => {
  for (const options of [{ push: false }, { missingReference: true }]) {
    const m = gitMock(options);
    await assert.rejects(
      saveDraftToGit(config, session, { draft: draft() }, m.fetcher),
    );
    assert.ok(!m.calls.some((c) => c.method === "POST"));
  }
});
test("Concurrent ref change is reported as conflict, never retried with force", async () => {
  const m = gitMock({ conflict: true });
  await assert.rejects(
    saveDraftToGit(config, session, { draft: draft() }, m.fetcher),
    (e) => e.status === 409,
  );
  assert.equal(m.calls.filter((c) => c.method === "PATCH").length, 1);
  assert.equal(m.calls.find((c) => c.method === "PATCH").body.force, false);
});
test("Missing uploaded image bytes block commit rather than producing broken media", async () => {
  const d = draft();
  d.heroImage = asset({
    id: "upload-" + "a".repeat(64),
    src: "/media/uploads/a-kep.jpg",
    demo: false,
  });
  const m = gitMock();
  await assert.rejects(
    saveDraftToGit(config, session, { draft: d }, m.fetcher),
    /kép fájlját/,
  );
  assert.ok(!m.calls.some((c) => c.p.endsWith("/git/blobs")));
});
test("Uploaded image hash, path, size and signature verified before commit", async () => {
  const bytes = Buffer.from([255, 216, 255, 224, 1, 2, 3]),
    hash = createHash("sha256").update(bytes).digest("hex"),
    meta = asset({
      id: "upload-" + hash,
      name: "kep.jpg",
      src: `/media/uploads/${hash.slice(0, 16)}-kep.jpg`,
      size: bytes.length,
      hash,
      demo: false,
    }),
    d = draft();
  d.heroImage = meta;
  const m = gitMock();
  await saveDraftToGit(
    config,
    session,
    { draft: d, media: [{ meta, data: bytes.toString("base64") }] },
    m.fetcher,
  );
  const tree = m.calls.find((c) => c.p.endsWith("/git/trees")).body.tree;
  assert.equal(tree[0].path, "public" + meta.src);
  const bad = gitMock();
  await assert.rejects(
    saveDraftToGit(
      config,
      session,
      {
        draft: d,
        media: [{ meta, data: Buffer.from("not an image").toString("base64") }],
      },
      bad.fetcher,
    ),
  );
});
