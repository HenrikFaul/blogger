/* Public enhancement layer. Navigation and article content work without JavaScript. */
(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];
  const normalize = (value) =>
    String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("hu")
      .trim();
  const toast = (message) => {
    const node = $("#public-toast");
    if (!node) return;
    node.textContent = message;
    node.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      node.hidden = true;
    }, 4200);
  };
  // The mobile menu uses a real disclosure and closes before Escape returns focus.
  const menu = $("#mobile-navigation");
  const menuButton = $("[data-toggle-menu]");
  if (menu && menuButton) {
    menuButton.addEventListener("click", () => {
      menu.hidden = !menu.hidden;
      menuButton.setAttribute("aria-expanded", String(!menu.hidden));
      menuButton.setAttribute(
        "aria-label",
        menu.hidden ? "Menü megnyitása" : "Menü bezárása",
      );
    });
    menu.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        menu.hidden = true;
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Menü megnyitása");
        menuButton.focus();
      }
    });
  }
  const modeButtons = $$("[data-toggle-mode]");
  const updateMode = () =>
    modeButtons.forEach((button) => {
      const dark = document.documentElement.dataset.mode === "dark";
      button.setAttribute(
        "aria-label",
        dark ? "Váltás világos megjelenésre" : "Váltás sötét megjelenésre",
      );
      button.title = button.getAttribute("aria-label");
    });
  updateMode();
  modeButtons.forEach((button) =>
    button.addEventListener("click", () => {
      const root = document.documentElement;
      root.dataset.mode = root.dataset.mode === "dark" ? "light" : "dark";
      try {
        const previous = JSON.parse(
          localStorage.getItem("forgeblog.appearance") || "{}",
        );
        localStorage.setItem(
          "forgeblog.appearance",
          JSON.stringify({
            theme: previous?.theme || root.dataset.defaultTheme,
            mode: root.dataset.mode,
          }),
        );
      } catch {
        toast(
          "A megjelenés erre az oldalra változott; a böngésző nem engedte a beállítás mentését.",
        );
      }
      updateMode();
    }),
  );
  // Top announcement strip: dismissal is a local reading preference, never a server state.
  // Without JavaScript the strip simply stays visible, so the message is never lost.
  const announcement = $("[data-announcement]");
  if (announcement) {
    const closeButton = $("[data-dismiss-announcement]", announcement);
    const remember = "forgeblog.announcement.dismissed";
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(remember) === "true";
    } catch {
      /* Storage is optional; a blocked store only means the strip reappears next visit. */
    }
    if (dismissed) announcement.hidden = true;
    closeButton?.addEventListener("click", () => {
      announcement.hidden = true;
      try {
        localStorage.setItem(remember, "true");
      } catch {
        toast("A bejelentés elrejtve erre az oldalra.");
      }
    });
  }
  // Lazily fetched search index: no draft text is bundled into the public search UI.
  const search = $("#site-search");
  const query = $("#global-search-input");
  const results = $("#global-search-results");
  const resultCount = $("#search-result-count");
  let index = null;
  let pending = null;
  let searchVersion = 0;
  const loadIndex = () => {
    if (index) return Promise.resolve(index);
    if (!pending)
      pending = fetch("/search.json", { credentials: "same-origin" })
        .then((response) => {
          if (!response.ok) throw new Error("search");
          return response.json();
        })
        .then((data) => {
          if (!Array.isArray(data)) throw new Error("search");
          index = data
            .filter(
              (p) =>
                typeof p.title === "string" &&
                typeof p.url === "string" &&
                /^\/posts\/[a-z0-9-]+\/$/.test(p.url),
            )
            .map((p) => ({
              ...p,
              normalized: normalize(
                [
                  p.title,
                  p.excerpt,
                  p.category,
                  ...(p.tags || []),
                  p.body,
                ].join(" "),
              ),
            }));
          return index;
        })
        .catch((error) => {
          pending = null;
          throw error;
        });
    return pending;
  };
  const searchMessage = (message) => {
    if (!results) return;
    const p = document.createElement("p");
    p.className = "search-help";
    p.textContent = message;
    results.replaceChildren(p);
  };
  const renderSearch = async () => {
    const version = ++searchVersion;
    const value = normalize(query?.value || "");
    if (!value) {
      searchMessage(
        "Kezdj el gépelni. Címre, témára és szövegre is kereshetsz.",
      );
      resultCount.textContent = "A kereső csak a nyilvános cikkekben keres.";
      return;
    }
    searchMessage("Történetek keresése…");
    try {
      const data = await loadIndex();
      if (version !== searchVersion) return;
      const terms = value.split(/\s+/);
      const matched = data
        .filter((p) => terms.every((term) => p.normalized.includes(term)))
        .sort(
          (a, b) =>
            Number(normalize(b.title).includes(value)) -
            Number(normalize(a.title).includes(value)),
        );
      const visible = matched.slice(0, 15);
      resultCount.textContent = `${matched.length} találat${matched.length > 15 ? " · az első 15 látható" : ""}`;
      if (!visible.length) {
        searchMessage(
          "Erre most nincs találat. Próbálj rövidebb vagy másik keresőkifejezést.",
        );
        return;
      }
      results.replaceChildren(
        ...visible.map((post) => {
          const a = document.createElement("a");
          a.className = "search-result";
          a.href = post.url;
          const h = document.createElement("h3");
          h.textContent = post.title;
          const p = document.createElement("p");
          p.textContent = `${post.category} · ${post.excerpt}`;
          a.append(h, p);
          return a;
        }),
      );
    } catch {
      if (version !== searchVersion) return;
      searchMessage(
        "A keresőindex nem tölthető be. Próbáld újra, vagy nyisd meg az archívumot.",
      );
      const a = document.createElement("a");
      a.className = "btn btn-small";
      a.href = "/archive/";
      a.textContent = "Archívum megnyitása";
      results.append(a);
      resultCount.textContent = "A keresés átmenetileg nem elérhető.";
    }
  };
  if (search && query) {
    $$("[data-open-search]").forEach((button) =>
      button.addEventListener("click", () => {
        search.showModal();
        query.focus();
        loadIndex().catch(() => {});
      }),
    );
    $("[data-close-search]", search).addEventListener("click", () =>
      search.close(),
    );
    search.addEventListener("click", (event) => {
      const r = search.getBoundingClientRect();
      if (
        event.target === search &&
        (event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom)
      )
        search.close();
    });
    query.addEventListener("input", renderSearch);
    query.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        search.close();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        $(".search-result", results)?.focus();
      }
      if (event.key === "Enter" && $(".search-result", results))
        $(".search-result", results).click();
    });
    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (search.open) search.close();
        else {
          search.showModal();
          query.focus();
          loadIndex().catch(() => {});
        }
      }
    });
  }
  // Actual archive filtering/sorting; static pagination remains the no-JS fallback.
  $$("[data-archive]").forEach((archive) => {
    const input = $("[data-archive-query]", archive),
      category = $("[data-archive-category]", archive),
      sort = $("[data-archive-sort]", archive),
      grid = $("[data-archive-grid]", archive),
      count = $("[data-archive-count]", archive),
      empty = $("[data-archive-empty]", archive),
      pagination = $("[data-pagination]", archive);
    if (!input || !grid) return;
    const cards = $$("[data-post-card]", grid);
    const page = Number(archive.dataset.page) || 1,
      perPage = Number(archive.dataset.perPage) || cards.length;
    const params = new URLSearchParams(location.search);
    input.value = params.get("q") || "";
    if (
      category &&
      [...category.options].some((o) => o.value === params.get("category"))
    )
      category.value = params.get("category");
    if (sort && ["latest", "oldest", "title"].includes(params.get("sort")))
      sort.value = params.get("sort");
    const apply = (updateUrl = false) => {
      const terms = normalize(input.value).split(/\s+/).filter(Boolean),
        cat = category?.value || "",
        order = sort?.value || "latest";
      const active = terms.length > 0 || cat || order !== "latest";
      const matched = cards
        .filter(
          (card) =>
            (!cat || card.dataset.category.split(" ").includes(cat)) &&
            terms.every((t) => card.dataset.search.includes(t)),
        )
        .sort((a, b) =>
          order === "title"
            ? a.dataset.title.localeCompare(b.dataset.title, "hu")
            : order === "oldest"
              ? a.dataset.date.localeCompare(b.dataset.date)
              : b.dataset.date.localeCompare(a.dataset.date),
        );
      cards.forEach((card) => {
        card.hidden = true;
      });
      matched.forEach((card, i) => {
        grid.append(card);
        card.hidden =
          !active && (i < (page - 1) * perPage || i >= page * perPage);
      });
      count.textContent = `${matched.length} történet${active ? " · szűrt válogatás" : ""}`;
      empty.hidden = matched.length > 0;
      grid.hidden = matched.length === 0;
      if (pagination) pagination.hidden = !!active;
      if (updateUrl) {
        const url = new URL(location.href);
        for (const [key, value] of [
          ["q", input.value.trim()],
          ["category", cat],
          ["sort", order === "latest" ? "" : order],
        ])
          value
            ? url.searchParams.set(key, value)
            : url.searchParams.delete(key);
        try {
          history.replaceState(null, "", url);
        } catch {
          /* Filtering still works when the host disallows history updates. */
        }
      }
    };
    input.addEventListener("input", () => apply(true));
    category?.addEventListener("change", () => apply(true));
    sort?.addEventListener("change", () => apply(true));
    $("[data-clear-archive]", archive)?.addEventListener("click", () => {
      input.value = "";
      if (category) category.value = "";
      if (sort) sort.value = "latest";
      apply(true);
      input.focus();
    });
    apply();
  });
  // Reading progress + current table-of-contents heading, without layout polling loops.
  const reading = $("[data-reading-article]");
  if (reading) {
    const bar = $("[data-reading-progress]");
    let scheduled = false;
    const update = () => {
      const r = reading.getBoundingClientRect();
      const distance = Math.max(1, reading.scrollHeight - innerHeight);
      bar.style.width = `${Math.max(0, Math.min(100, (-r.top / distance) * 100))}%`;
      scheduled = false;
    };
    addEventListener(
      "scroll",
      () => {
        if (!scheduled) {
          scheduled = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
    addEventListener("resize", update);
    update();
    const links = $$("[data-toc-link]");
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const active = entries
            .filter((entry) => entry.isIntersecting)
            .sort(
              (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
            )[0];
          if (active)
            links.forEach((link) =>
              link.setAttribute(
                "aria-current",
                String(link.hash === `#${active.target.id}`),
              ),
            );
        },
        { rootMargin: "-10% 0px -65% 0px", threshold: 0 },
      );
      $$("[data-article-prose] h2[id],[data-article-prose] h3[id]").forEach(
        (h) => observer.observe(h),
      );
    }
    const toc = $(".article-toc");
    if (toc?.tagName === "DETAILS" && matchMedia("(max-width:760px)").matches)
      toc.open = false;
  }
  $$("[data-copy-url]").forEach((button) =>
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(
          location.origin + location.pathname,
        );
        toast("A történet linkjét a vágólapra másoltuk.");
      } catch {
        toast(
          "A böngésző nem engedte a másolást. A linket a címsorból tudod kimásolni.",
        );
      }
    }),
  );
  $$("[data-print]").forEach((button) =>
    button.addEventListener("click", () => window.print()),
  );
  // Native dialogs provide focus containment and background inertness. Escape and focus restore are tested.
  $$("[data-gallery]").forEach((gallery) => {
    const range = $("[data-comparison-range]", gallery);
    if (range)
      range.addEventListener("input", () => {
        $("[data-comparison]", gallery).style.setProperty(
          "--comparison",
          `${range.value}%`,
        );
        $("[data-comparison-value]", gallery).textContent = `${range.value}%`;
      });
    const strip = $("[data-gallery-items]", gallery);
    if (strip) {
      const controls = $$("[data-gallery-scroll]", gallery);
      const sync = () =>
        controls.forEach(
          (button) =>
            (button.disabled =
              button.dataset.galleryScroll === "-1"
                ? strip.scrollLeft < 2
                : strip.scrollLeft >=
                  strip.scrollWidth - strip.clientWidth - 2),
        );
      controls.forEach((button) =>
        button.addEventListener("click", () =>
          strip.scrollBy({
            left:
              Number(button.dataset.galleryScroll) * strip.clientWidth * 0.8,
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "instant"
              : "smooth",
          }),
        ),
      );
      strip.addEventListener("scroll", sync, { passive: true });
      addEventListener("resize", sync);
      sync();
    }
    const items = $$("[data-gallery-item]", gallery).map((item) => ({
      src: item.dataset.src,
      alt: item.dataset.alt,
      caption: item.dataset.caption,
      credit: item.dataset.credit,
    }));
    const dialog = $("[data-lightbox]", gallery);
    let current = 0,
      opener = null,
      previousOverflow = "";
    $$("[data-film-select]", gallery).forEach((link) =>
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const i = Number(link.dataset.galleryIndex);
        const image = items[i];
        if (!image) return;
        const main = $("[data-gallery-main]", gallery);
        $("[data-film-image]", gallery).src = image.src;
        $("[data-film-image]", gallery).alt = image.alt;
        main.href = image.src;
        main.dataset.galleryIndex = String(i);
        main.setAttribute(
          "aria-label",
          `Kép megnyitása: ${image.alt || `${i + 1}. kép`}`,
        );
        $("[data-film-caption]", gallery).textContent = image.caption;
        $$("[data-film-select]", gallery).forEach((a) =>
          a.setAttribute("aria-current", String(a === link)),
        );
      }),
    );
    if (!dialog || !items.length) return;
    const img = $("[data-lightbox-image]", dialog),
      wrap = $(".lightbox-image-wrap", dialog),
      zoom = $("[data-lightbox-zoom]", dialog);
    const render = () => {
      const item = items[current];
      img.src = item.src;
      img.alt = item.alt;
      $("[data-lightbox-caption]", dialog).textContent =
        item.caption || item.alt;
      $("[data-lightbox-credit]", dialog).textContent = item.credit;
      $("[data-lightbox-counter]", dialog).textContent =
        `${current + 1} / ${items.length}`;
      wrap.classList.remove("zoomed");
      zoom.setAttribute("aria-pressed", "false");
      zoom.setAttribute("aria-label", "Kép nagyítása");
    };
    const move = (delta) => {
      current = (current + delta + items.length) % items.length;
      render();
    };
    $$("[data-gallery-open]", gallery).forEach((link) =>
      link.addEventListener("click", (event) => {
        event.preventDefault();
        current = Math.max(
          0,
          Math.min(items.length - 1, Number(link.dataset.galleryIndex) || 0),
        );
        opener = link;
        previousOverflow = document.body.style.overflow;
        render();
        dialog.showModal();
        document.body.style.overflow = "hidden";
        $("[data-lightbox-close]", dialog).focus();
      }),
    );
    $("[data-lightbox-close]", dialog).addEventListener("click", () =>
      dialog.close(),
    );
    dialog.addEventListener("close", () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog || event.target === wrap) dialog.close();
    });
    $("[data-lightbox-prev]", dialog).addEventListener("click", () => move(-1));
    $("[data-lightbox-next]", dialog).addEventListener("click", () => move(1));
    zoom.addEventListener("click", () => {
      const enabled = wrap.classList.toggle("zoomed");
      zoom.setAttribute("aria-pressed", String(enabled));
      zoom.setAttribute(
        "aria-label",
        enabled ? "Vissza az illesztett mérethez" : "Kép nagyítása",
      );
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }
      if (event.key === "Home") {
        event.preventDefault();
        current = 0;
        render();
      }
      if (event.key === "End") {
        event.preventDefault();
        current = items.length - 1;
        render();
      }
    });
    let touch = null;
    wrap.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch" && !wrap.classList.contains("zoomed"))
        touch = { x: event.clientX, y: event.clientY };
    });
    wrap.addEventListener("pointerup", (event) => {
      if (
        touch &&
        Math.abs(event.clientX - touch.x) > 60 &&
        Math.abs(event.clientY - touch.y) < 60
      )
        move(event.clientX < touch.x ? 1 : -1);
      touch = null;
    });
  });
  // Consent-by-action media loading: no third-party iframe or thumbnail is requested beforehand.
  $$("[data-load-embed]").forEach((button) =>
    button.addEventListener("click", () => {
      const raw = button.dataset.loadEmbed;
      try {
        const url = new URL(raw);
        if (
          url.protocol !== "https:" ||
          !["www.youtube-nocookie.com", "player.vimeo.com"].includes(
            url.hostname,
          )
        )
          throw new Error("provider");
        const frame = document.createElement("iframe");
        frame.src = url.href;
        frame.title = button.dataset.embedTitle || "Külső videólejátszó";
        frame.className = "embed-frame";
        frame.allow = "fullscreen; picture-in-picture";
        frame.allowFullscreen = true;
        frame.referrerPolicy = "strict-origin-when-cross-origin";
        button.closest(".embed-placeholder").replaceWith(frame);
      } catch {
        toast("Ez a videóforrás nem engedélyezett.");
      }
    }),
  );
  // Code blocks: copy button is a progressive enhancement, never required for reading.
  $$(".article-prose pre").forEach((block) => {
    const wrap = document.createElement("div");
    wrap.className = "code-block";
    block.parentNode.insertBefore(wrap, block);
    wrap.appendChild(block);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy";
    button.setAttribute("aria-label", "Kód másolása");
    button.textContent = "Másolás";
    wrap.appendChild(button);
    button.addEventListener("click", async () => {
      const text = block.innerText;
      let copied = false;
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        const range = document.createRange();
        range.selectNodeContents(block);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
      button.textContent = copied ? "Másolva" : "Jelölve";
      button.classList.add("copied");
      setTimeout(() => {
        button.textContent = "Másolás";
        button.classList.remove("copied");
      }, 2000);
    });
  });
})();
