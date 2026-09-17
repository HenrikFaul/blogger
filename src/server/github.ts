import { createHash } from "node:crypto";
import {
  assertDraft,
  documentAssets,
  publishErrors,
  type Draft,
  type ImageAsset,
} from "../lib/creator/model.js";
import { draftToMdx } from "../lib/creator/serializer.js";
import { sniffImage } from "../lib/creator/media.js";
import { slugify } from "../lib/safety.js";
import { postSchema } from "../lib/content-schemas.js";
import { HttpError } from "./security.js";
export type GitSession = {
  token: string;
  login: string;
  csrf: string;
  expires: number;
};
export type GitConfig = {
  repository: string;
  origin: string;
  secret: string;
  clientId: string;
  clientSecret: string;
  mode: "app" | "oauth";
  allowed: string[];
};
export async function github<T = Record<string, unknown>>(
  token: string,
  path: string,
  init: RequestInit = {},
  fetcher: typeof fetch = fetch,
): Promise<T> {
  const response = await fetcher(`https://api.github.com${path}`, {
    ...init,
    signal: AbortSignal.timeout(20000),
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "ForgeBlog-Creator",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!response.ok) {
    let reason = "";
    try {
      const json = await response.json();
      reason = String(json.message || "").slice(0, 180);
    } catch {}
    throw new HttpError(
      response.status,
      `GitHub ${response.status}${reason ? ": " + reason : ""}`,
    );
  }
  return response.status === 204 ? ({} as T) : ((await response.json()) as T);
}
const segment = (s: string) => encodeURIComponent(s);
const pathQuery = (path: string) => path.split("/").map(segment).join("/");
export async function saveDraftToGit(
  config: GitConfig,
  session: GitSession,
  input: {
    draft: Draft;
    publish?: boolean;
    expectedHead?: string | null;
    media?: { meta: ImageAsset; data: string }[];
  },
  fetcher: typeof fetch = fetch,
) {
  assertDraft(input.draft);
  const draft = structuredClone(input.draft),
    publishing = input.publish === true;
  const slug = draft.slug || `vazlat-${draft.id.slice(0, 8)}`;
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.author) ||
    draft.categories.length > 20 ||
    draft.categories.some((c) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c))
  )
    throw new HttpError(400, "Hibás URL-részlet, szerző vagy témakategória.");
  if (publishing) {
    const errors = publishErrors(draft);
    if (errors.length) throw new HttpError(400, errors.join(" "));
  }
  const repo = `/repos/${config.repository}`,
    gh = <T = Record<string, unknown>>(
      p: string,
      method = "GET",
      body?: unknown,
    ) =>
      github<T>(
        session.token,
        p,
        {
          method,
          ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        },
        fetcher,
      );
  const metadata = await gh<{
    default_branch: string;
    permissions?: { push?: boolean };
  }>(repo);
  if (!metadata.permissions?.push)
    throw new HttpError(
      403,
      "Nincs írási jogosultságod ehhez a repositoryhoz.",
    );
  const base = metadata.default_branch;
  for (const [collection, ids] of [
    ["authors", [draft.author]],
    ["categories", draft.categories],
  ] as const)
    for (const id of ids) {
      try {
        await gh(
          `${repo}/contents/src/content/${collection}/${segment(id)}.json?ref=${segment(base)}`,
        );
      } catch (e) {
        if (e instanceof HttpError && e.status === 404)
          throw new HttpError(
            400,
            `A repositoryban nem létezik: ${collection}/${id}.json`,
          );
        throw e;
      }
    }
  const branch = `forgeblog/draft-${draft.id}`,
    refPath = `${repo}/git/ref/heads/${segment(branch)}`;
  let head: string;
  try {
    const current = await gh<{ object: { sha: string } }>(refPath);
    head = current.object.sha;
    if (input.expectedHead !== head)
      throw new HttpError(
        409,
        "A távoli ág újabb vagy másik munkamenet hozta létre. A helyi munkát nem írtuk felül. Exportálj, vagy készíts külön vázlatmásolatot.",
      );
  } catch (e) {
    if (!(e instanceof HttpError) || e.status !== 404) throw e;
    if (input.expectedHead)
      throw new HttpError(
        409,
        "A korábbi távoli ág nem található. Ellenőrizd a Gitben; ne írj felül másik ágat.",
      );
    const baseRef = await gh<{ object: { sha: string } }>(
      `${repo}/git/ref/heads/${segment(base)}`,
    );
    head = baseRef.object.sha;
    try {
      await gh(`${repo}/git/refs`, "POST", {
        ref: `refs/heads/${branch}`,
        sha: head,
      });
    } catch {
      throw new HttpError(
        409,
        "Az ág közben létrejött, vagy a repository-szabály nem engedi létrehozni. A meglévő tartalomhoz nem nyúltunk.",
      );
    }
  }
  const sourcePath = `.forgeblog/drafts/${draft.id}.json`,
    filePath = `src/content/posts/${slug}.mdx`;
  let prior: { slug: string } | undefined;
  try {
    const file = await gh<{ content: string }>(
      `${repo}/contents/${pathQuery(sourcePath)}?ref=${segment(head)}`,
    );
    prior = JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));
  } catch (e) {
    if (!(e instanceof HttpError) || e.status !== 404) throw e;
  }
  if (prior && prior.slug !== slug)
    throw new HttpError(
      409,
      "A Gitbe már mentett vázlat URL-részlete nem nevezhető át automatikusan. Készíts új vázlatmásolatot, vagy nevezd át ellenőrzött Git-pull requestben.",
    );
  if (!prior)
    for (const ext of ["mdx", "md"]) {
      try {
        await gh(
          `${repo}/contents/src/content/posts/${segment(slug)}.${ext}?ref=${segment(head)}`,
        );
        throw new HttpError(
          409,
          "A célfájl már létezik. Meglévő cikket a munkatér nem ír felül automatikusan.",
        );
      } catch (e) {
        if (!(e instanceof HttpError) || e.status !== 404) throw e;
      }
    }
  const content = draftToMdx(draft, publishing ? "published" : "draft");
  const front = content
    .split("---\n")[1]
    .trim()
    .split("\n")
    .reduce<Record<string, unknown>>((acc, line) => {
      const at = line.indexOf(":");
      acc[line.slice(0, at)] = JSON.parse(line.slice(at + 1));
      return acc;
    }, {});
  const validation = postSchema.safeParse(front);
  if (!validation.success)
    throw new HttpError(
      400,
      "A repository tartalomsémája elutasítaná ezt a mentést: " +
        validation.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
    );
  const requestedAssets = documentAssets(draft),
    needed = new Map<string, ImageAsset>(
      requestedAssets
        .filter((a) => !a.demo && a.src.startsWith("/media/uploads/"))
        .map((a): [string, ImageAsset] => [a.id, a]),
    );
  const media = input.media || [];
  if (!Array.isArray(media) || media.length > 50)
    throw new HttpError(400, "Legfeljebb 50 képfájl küldhető.");
  let total = 0;
  const files: {
    path: string;
    content: string;
    encoding: "base64" | "utf-8";
  }[] = [];
  const received = new Set<string>();
  for (const entry of media) {
    const expected = needed.get(entry.meta?.id);
    if (
      !expected ||
      received.has(expected.id) ||
      typeof entry.data !== "string" ||
      entry.data.length > 3300000 ||
      !/^[A-Za-z0-9+/]*={0,2}$/.test(entry.data)
    )
      throw new HttpError(400, "Hibás vagy nem hivatkozott képfájl.");
    const bytes = Buffer.from(entry.data, "base64");
    total += bytes.byteLength;
    if (total > 2400000)
      throw new HttpError(
        413,
        "A Git-mentés képeinek összege legfeljebb 2,4 MB lehet. Nagyobb csomaghoz használd a ZIP-exportot.",
      );
    const format = sniffImage(bytes);
    if (!format)
      throw new HttpError(400, "A feltöltött fájl nem támogatott kép.");
    const hash = createHash("sha256").update(bytes).digest("hex");
    const stem =
      slugify(expected.name.replace(/\.[^.]+$/, "")).slice(0, 50) || "kep";
    const assetPath = `/media/uploads/${hash.slice(0, 16)}-${stem}.${format.extension}`;
    if (
      expected.id !== "upload-" + hash ||
      expected.src !== assetPath ||
      expected.hash !== hash ||
      expected.size !== bytes.length
    )
      throw new HttpError(400, "A képfájl integritásellenőrzése nem sikerült.");
    files.push({
      path: "public" + assetPath,
      content: bytes.toString("base64"),
      encoding: "base64",
    });
    received.add(expected.id);
  }
  if ([...needed.keys()].some((id) => !received.has(id)))
    throw new HttpError(
      400,
      "A vázlat nem tartalmazza minden hivatkozott helyi kép fájlját.",
    );
  const { git: _git, ...source } = draft;
  files.push(
    { path: filePath, content, encoding: "utf-8" },
    {
      path: sourcePath,
      content: JSON.stringify({ ...source, slug, history: [] }, null, 2),
      encoding: "utf-8",
    },
  );
  const headCommit = await gh<{ tree: { sha: string } }>(
    `${repo}/git/commits/${head}`,
  );
  const tree = [];
  for (const file of files) {
    const blob = await gh<{ sha: string }>(`${repo}/git/blobs`, "POST", {
      content: file.content,
      encoding: file.encoding,
    });
    tree.push({ path: file.path, mode: "100644", type: "blob", sha: blob.sha });
  }
  const nextTree = await gh<{ sha: string }>(`${repo}/git/trees`, "POST", {
    base_tree: headCommit.tree.sha,
    tree,
  });
  const commit = await gh<{ sha: string }>(`${repo}/git/commits`, "POST", {
    message: `${publishing ? "Prepare publication" : "Save draft"}: ${draft.title || slug}`,
    tree: nextTree.sha,
    parents: [head],
  });
  try {
    await gh(`${repo}/git/refs/heads/${segment(branch)}`, "PATCH", {
      sha: commit.sha,
      force: false,
    });
  } catch (e) {
    if (e instanceof HttpError && [409, 422].includes(e.status))
      throw new HttpError(
        409,
        "A távoli ág mentés közben megváltozott. Nem történt kényszerített felülírás. A helyi vázlat megmaradt.",
      );
    throw e;
  }
  let prUrl: string | undefined, warning: string | undefined;
  if (publishing) {
    try {
      const pulls = await gh<{ html_url: string }[]>(
        `${repo}/pulls?state=open&head=${segment(config.repository.split("/")[0] + ":" + branch)}&base=${segment(base)}`,
      );
      if (pulls.length) prUrl = pulls[0].html_url;
      else {
        const pr = await gh<{ html_url: string }>(`${repo}/pulls`, "POST", {
          title: `Publikálás: ${draft.title}`,
          body: "ForgeBlog creator submission.\n\nCheck content, alt text, media licensing, schema validation, tests and the deployment preview before merging. This PR has NOT been automatically merged or deployed.",
          head: branch,
          base,
          draft: false,
        });
        prUrl = pr.html_url;
      }
    } catch {
      warning =
        "A Git-commit sikerült, de a pull request nem jött létre. Nyisd meg az ágat GitHubon, és hozz létre PR-t kézzel; ellenőrizd a Pull requests jogosultságot.";
    }
  }
  return {
    git: {
      branch,
      head: commit.sha,
      path: filePath,
      url: `https://github.com/${config.repository}/commit/${commit.sha}`,
      ...(prUrl ? { prUrl } : {}),
    },
    warning,
    published: false,
  };
}
