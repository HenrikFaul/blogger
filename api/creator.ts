/** Vercel Node function. Optional: static reading and local authoring do not require credentials. */
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  nonce,
  challenge,
  seal,
  unseal,
  secureEqual,
  cookieValue,
  requireOrigin,
  HttpError,
} from "../src/server/security";
import {
  github,
  saveDraftToGit,
  type GitConfig,
  type GitSession,
} from "../src/server/github";
import instance from "../src/config/site.json";
import type { Draft, ImageAsset } from "../src/lib/creator/model";
type Request = IncomingMessage & {
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
};
type Response = ServerResponse;
const SESSION = "__Host-forge-session",
  STATE = "__Host-forge-oauth";
function config(): GitConfig | null {
  const e = process.env;
  const repository = e.GITHUB_REPOSITORY || "",
    secret = e.SESSION_SECRET || "",
    clientId = e.GITHUB_CLIENT_ID || "",
    clientSecret = e.GITHUB_CLIENT_SECRET || "",
    originRaw = e.PUBLIC_SITE_URL || instance.siteUrl;
  try {
    const u = new URL(originRaw);
    if (
      !/^[\w.-]+\/[\w.-]+$/.test(repository) ||
      repository.split("/").some((v) => v === "." || v === "..") ||
      secret.length < 32 ||
      !clientId ||
      !clientSecret ||
      u.protocol !== "https:" ||
      u.pathname !== "/" ||
      u.username ||
      u.password ||
      u.hash ||
      u.search
    )
      return null;
    return {
      repository,
      origin: u.origin,
      secret,
      clientId,
      clientSecret,
      mode: e.GITHUB_AUTH_MODE === "oauth" ? "oauth" : "app",
      allowed: (e.GITHUB_ALLOWED_LOGINS || "")
        .split(",")
        .map((v) => v.trim().toLowerCase())
        .filter(Boolean),
    };
  } catch {
    return null;
  }
}
const cookie = (name: string, value: string, seconds: number) =>
  `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${seconds}`;
function json(res: Response, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}
function redirect(res: Response, url: string) {
  res.statusCode = 303;
  res.setHeader("Location", url);
  res.end();
}
function value(req: Request, key: string): string {
  const v = req.query?.[key];
  return typeof v === "string" ? v : "";
}
export default async function handler(req: Request, res: Response) {
  res.setHeader("Cache-Control", "no-store, private");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  const action = value(req, "action") || "session";
  const cfg = config();
  try {
    if (!cfg) {
      if (action === "session" && req.method === "GET")
        return json(res, 200, { configured: false, authenticated: false });
      throw new HttpError(
        503,
        "A Git-kapcsolat nincs beállítva. A helyi szerkesztés és export továbbra is használható.",
      );
    }
    const binding = `forgeblog:v1:${cfg.origin}:${cfg.repository}`,
      session = unseal<GitSession>(
        cookieValue(req.headers.cookie, SESSION),
        cfg.secret,
        binding,
      );
    if (action === "session") {
      if (req.method !== "GET")
        throw new HttpError(405, "GET kérés szükséges.");
      return json(res, 200, {
        configured: true,
        authenticated: !!session,
        repository: cfg.repository,
        ...(session ? { login: session.login, csrf: session.csrf } : {}),
      });
    }
    if (action === "login") {
      if (req.method !== "GET")
        throw new HttpError(405, "GET kérés szükséges.");
      const state = nonce(),
        verifier = nonce(48),
        expires = Date.now() + 600000;
      res.setHeader(
        "Set-Cookie",
        cookie(
          STATE,
          seal({ state, verifier, expires }, cfg.secret, binding + ":oauth"),
          600,
        ),
      );
      const url = new URL("https://github.com/login/oauth/authorize");
      url.searchParams.set("client_id", cfg.clientId);
      url.searchParams.set(
        "redirect_uri",
        cfg.origin + "/api/creator?action=callback",
      );
      url.searchParams.set("state", state);
      url.searchParams.set("code_challenge", challenge(verifier));
      url.searchParams.set("code_challenge_method", "S256");
      url.searchParams.set("allow_signup", "false");
      if (cfg.mode === "oauth") url.searchParams.set("scope", "repo");
      return redirect(res, url.href);
    }
    if (action === "callback") {
      if (req.method !== "GET")
        throw new HttpError(405, "GET kérés szükséges.");
      const saved = unseal<{
        state: string;
        verifier: string;
        expires: number;
      }>(
        cookieValue(req.headers.cookie, STATE),
        cfg.secret,
        binding + ":oauth",
      );
      res.setHeader("Set-Cookie", cookie(STATE, "", 0));
      if (
        !saved ||
        !secureEqual(saved.state, value(req, "state")) ||
        !value(req, "code")
      )
        throw new HttpError(
          403,
          "A bejelentkezés lejárt vagy az OAuth state ellenőrzés sikertelen.",
        );
      const response = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          signal: AbortSignal.timeout(20000),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: cfg.clientId,
            client_secret: cfg.clientSecret,
            code: value(req, "code"),
            redirect_uri: cfg.origin + "/api/creator?action=callback",
            code_verifier: saved.verifier,
          }),
        },
      );
      const tokens = await response.json();
      if (
        !response.ok ||
        typeof tokens.access_token !== "string" ||
        tokens.access_token.length > 1000
      )
        throw new HttpError(401, "A GitHub nem adott érvényes hozzáférést.");
      const token = tokens.access_token;
      const user = await github<{ login: string }>(token, "/user");
      if (cfg.allowed.length && !cfg.allowed.includes(user.login.toLowerCase()))
        throw new HttpError(
          403,
          "Ez a GitHub-felhasználó nincs az engedélyezett szerkesztők között.",
        );
      const repo = await github<{ permissions?: { push?: boolean } }>(
        token,
        `/repos/${cfg.repository}`,
      );
      if (!repo.permissions?.push)
        throw new HttpError(
          403,
          "Nincs írási jogosultság a konfigurált repositoryhoz.",
        );
      const seconds = Math.max(
        60,
        Math.min(8 * 3600, Number(tokens.expires_in) || 8 * 3600) - 60,
      );
      const next: GitSession = {
        token,
        login: user.login,
        csrf: nonce(),
        expires: Date.now() + seconds * 1000,
      };
      res.setHeader("Set-Cookie", [
        cookie(STATE, "", 0),
        cookie(SESSION, seal(next, cfg.secret, binding), seconds),
      ]);
      return redirect(res, cfg.origin + "/creator/?auth=success");
    }
    if (req.method !== "POST")
      throw new HttpError(405, "POST kérés szükséges.");
    if (!session)
      throw new HttpError(401, "Jelentkezz be újra a GitHub-fiókoddal.");
    requireOrigin(
      typeof req.headers.origin === "string" ? req.headers.origin : undefined,
      cfg.origin,
    );
    const csrf = req.headers["x-csrf-token"];
    if (typeof csrf !== "string" || !secureEqual(csrf, session.csrf))
      throw new HttpError(
        403,
        "A CSRF-ellenőrzés sikertelen. Frissítsd a bejelentkezést.",
      );
    if (
      !String(req.headers["content-type"])
        .toLowerCase()
        .startsWith("application/json")
    )
      throw new HttpError(415, "application/json tartalomtípus szükséges.");
    if (action === "logout") {
      res.setHeader("Set-Cookie", cookie(SESSION, "", 0));
      return json(res, 200, { authenticated: false });
    }
    if (action !== "save") throw new HttpError(404, "Ismeretlen művelet.");
    let body = req.body;
    if (typeof body === "string") {
      if (Buffer.byteLength(body) > 4000000)
        throw new HttpError(413, "A kérés túl nagy.");
      try {
        body = JSON.parse(body);
      } catch {
        throw new HttpError(400, "Hibás JSON.");
      }
    }
    if (
      !body ||
      typeof body !== "object" ||
      Buffer.byteLength(JSON.stringify(body)) > 4000000
    )
      throw new HttpError(413, "Hiányzó vagy túl nagy kérés.");
    const input = body as {
      draft: Draft;
      publish?: boolean;
      expectedHead?: string | null;
      media?: { meta: ImageAsset; data: string }[];
    };
    let result;
    try {
      result = await saveDraftToGit(cfg, session, input);
    } catch (e) {
      if (e instanceof HttpError) throw e;
      throw new HttpError(
        400,
        e instanceof Error ? e.message : "A tartalom nem menthető.",
      );
    }
    return json(res, 200, result);
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500;
    if (action === "callback" && cfg) {
      return redirect(res, cfg.origin + "/creator/?auth_error=" + status);
    }
    return json(res, status, {
      error:
        e instanceof HttpError
          ? e.message
          : "A szerveroldali művelet nem sikerült. A helyi vázlat megmaradt.",
    });
  }
}
