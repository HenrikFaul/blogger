/** Shared allowlists: never insert a user-controlled URL straight into HTML or MDX. */
export function safeUrl(input: unknown, allowBlob = false): string | undefined {
  if (typeof input !== "string") return undefined;
  const value = input.trim();
  if (!value || /[\u0000-\u0020\u007f\\]/.test(value)) return undefined;
  if (/^\/(?!\/)/.test(value) && !/%(?:2f|5c)/i.test(value)) return value;
  if (/^#[a-zA-Z0-9_-]+$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    )
      return url.href;
    if (allowBlob && url.protocol === "blob:") return value;
  } catch {
    /* Invalid URLs are deliberately rejected. */
  }
  return undefined;
}
export function safeImageUrl(
  input: unknown,
  allowBlob = false,
): string | undefined {
  const value = safeUrl(input, allowBlob);
  return value && !value.startsWith("#") ? value : undefined;
}
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
    .replace(/-+$/g, "");
}
export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("hu")
    .trim();
}
export function escapeXml(value: unknown): string {
  return String(value ?? "").replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
}
export function jsonForHtml(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
