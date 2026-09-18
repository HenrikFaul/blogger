/* Synchronous, tiny, dependency-free pre-paint initialization.
   ForgeBlog defaults to light mode. Dark mode is opt-in via toggle only. */
(() => {
  const root = document.documentElement;
  root.dataset.js = "true";
  if (root.hasAttribute("data-workspace")) return;
  try {
    const allowed = JSON.parse(root.dataset.themes || "{}");
    const saved = JSON.parse(
      localStorage.getItem("forgeblog.appearance") || "null",
    );
    if (saved && typeof saved === "object") {
      if (
        saved.theme &&
        Object.hasOwn(allowed, saved.theme) &&
        !root.hasAttribute("data-article-theme")
      ) {
        root.dataset.theme = saved.theme;
        root.dataset.layout = allowed[saved.theme].layout;
      }
      if (saved.mode === "light" || saved.mode === "dark")
        root.dataset.mode = saved.mode;
    }
  } catch {
    /* noop */
  }
  /* Always ensure a mode is set — default to light */
  if (!root.dataset.mode || (root.dataset.mode !== "light" && root.dataset.mode !== "dark")) {
    root.dataset.mode = "light";
  }
})();
