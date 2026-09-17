import {
  Fragment,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { safeUrl, safeImageUrl } from "../../../lib/safety";
import {
  embedUrl,
  type DocNode,
  type ImageAsset,
  type GalleryLayout,
} from "../../../lib/creator/model";
import { Icon } from "../../ui/Icon";
export type AssetUrls = Record<string, string>;
export function imageSrc(
  a: Partial<ImageAsset> | undefined,
  urls: AssetUrls,
): string {
  return a ? urls[a.id || ""] || safeImageUrl(a.src || "") || "" : "";
}
export function ReactGallery({
  images,
  layout = "editorial-grid",
  columns = 3,
  showCaptions = true,
  urls = {},
}: {
  images: ImageAsset[];
  layout?: GalleryLayout;
  columns?: number;
  showCaptions?: boolean;
  urls?: AssetUrls;
}) {
  const [active, setActive] = useState(0),
    [compare, setCompare] = useState(50),
    [zoom, setZoom] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    track = useRef<HTMLDivElement>(null);
  const clamped = images.length ? Math.min(active, images.length - 1) : 0;
  const current = images[clamped];
  if (!images.length)
    return <p className="form-hint">Válassz képeket a galériához.</p>;
  const open = (i: number) => {
    setActive(i);
    setZoom(false);
    dialog.current?.showModal();
  };
  const close = () => {
    setZoom(false);
    dialog.current?.close();
  };
  const move = (d: number) => {
    setActive((i) => (i + d + images.length) % images.length);
    setZoom(false);
  };
  const single = (a: ImageAsset, i: number) => (
    <figure key={a.id}>
      <button
        type="button"
        className="gallery-image-btn"
        onClick={() => (layout === "filmstrip" ? setActive(i) : open(i))}
        aria-label={`${a.alt || a.name} – nagyítás`}
      >
        <img
          src={imageSrc(a, urls)}
          alt={a.decorative ? "" : a.alt}
          loading="lazy"
          width={a.width}
          height={a.height}
        />
      </button>
      {showCaptions && Boolean(a.caption || a.credit) && (
        <figcaption>
          {a.caption}
          {a.credit && <small> · {a.credit}</small>}
        </figcaption>
      )}
    </figure>
  );
  return (
    <section
      className="gallery"
      data-layout={layout}
      style={
        {
          "--gallery-columns": columns,
          "--gallery-gap": "12px",
        } as CSSProperties
      }
      aria-label="Képgaléria"
    >
      {layout === "comparison" && images.length >= 2 ? (
        <>
          <div
            className="comparison-frame"
            style={{
              position: "relative",
              aspectRatio: "1.6",
              overflow: "hidden",
            }}
          >
            <img
              src={imageSrc(images[1], urls)}
              alt={images[1].alt}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <img
              src={imageSrc(images[0], urls)}
              alt={images[0].alt}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                clipPath: `inset(0 ${100 - compare}% 0 0)`,
              }}
            />
          </div>
          <label className="form-label">
            Előtte / utána
            <input
              aria-label="Képek összehasonlítása"
              type="range"
              min="0"
              max="100"
              value={compare}
              onChange={(e) => setCompare(Number(e.target.value))}
            />
          </label>
        </>
      ) : (
        <>
          {layout === "filmstrip" && (
            <button
              type="button"
              className="gallery-filmstrip-main"
              onClick={() => open(clamped)}
              aria-label="A kiválasztott kép nagyítása"
            >
              <img src={imageSrc(current, urls)} alt={current.alt} />
            </button>
          )}
          <div ref={track} className="gallery-items">
            {images.map(single)}
          </div>
        </>
      )}
      {["carousel", "filmstrip"].includes(layout) && (
        <div className="gallery-controls">
          <button
            type="button"
            className="icon-btn"
            aria-label="Galéria balra"
            onClick={() =>
              track.current?.scrollBy({ left: -250, behavior: "smooth" })
            }
          >
            <Icon name="arrow-left" />
          </button>
          <span>{images.length} kép</span>
          <button
            type="button"
            className="icon-btn"
            aria-label="Galéria jobbra"
            onClick={() =>
              track.current?.scrollBy({ left: 250, behavior: "smooth" })
            }
          >
            <Icon name="arrow" />
          </button>
        </div>
      )}
      <dialog
        className="lightbox"
        ref={dialog}
        aria-label="Kép nagy méretben"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") move(1);
          if (e.key === "ArrowLeft") move(-1);
          if (e.key === "Home") setActive(0);
          if (e.key === "End") setActive(images.length - 1);
        }}
      >
        <button
          className="lightbox-close icon-btn"
          type="button"
          onClick={close}
          aria-label="Képnagyító bezárása"
        >
          <Icon name="close" />
        </button>
        <button
          className="lightbox-prev icon-btn"
          type="button"
          onClick={() => move(-1)}
          aria-label="Előző kép"
        >
          <Icon name="arrow-left" />
        </button>
        <img
          className={zoom ? "is-zoomed" : ""}
          src={imageSrc(current, urls)}
          alt={current.alt}
          onDoubleClick={() => setZoom(!zoom)}
        />
        <button
          className="lightbox-next icon-btn"
          type="button"
          onClick={() => move(1)}
          aria-label="Következő kép"
        >
          <Icon name="arrow" />
        </button>
        <p className="lightbox-caption">
          {clamped + 1} / {images.length} · {current.caption || current.alt}
          <br />
          {current.credit}
        </p>
        <button
          type="button"
          className="lightbox-zoom btn"
          onClick={() => setZoom(!zoom)}
          aria-pressed={zoom}
        >
          Nagyítás {zoom ? "ki" : "be"}
        </button>
      </dialog>
    </section>
  );
}
function Video({ url, title }: { url: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  const src = embedUrl(url);
  if (!src) return <p>Nem támogatott videó.</p>;
  return loaded ? (
    <div className="video-frame">
      <iframe
        title={title}
        src={src}
        allow="fullscreen; picture-in-picture"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        allowFullScreen
      />
    </div>
  ) : (
    <div className="embed-placeholder">
      <Icon name="eye" />
      <h3>{title}</h3>
      <p>
        A lejátszó csak kattintás után kapcsolódik a külső videoszolgáltatóhoz.
      </p>
      <button
        className="btn btn-outline"
        type="button"
        onClick={() => setLoaded(true)}
      >
        Videó betöltése
      </button>
    </div>
  );
}
export function DocumentPreview({
  document,
  urls = {},
}: {
  document: DocNode;
  urls?: AssetUrls;
}) {
  function render(n: DocNode, key: number | string): ReactNode {
    const children = n.content?.map((c, i) => render(c, `${key}-${i}`));
    switch (n.type) {
      case "doc":
        return <Fragment key={key}>{children}</Fragment>;
      case "text": {
        let text: ReactNode = n.text;
        for (const [i, m] of (n.marks || []).entries()) {
          const k = `${key}-m${i}`;
          if (m.type === "bold") text = <strong key={k}>{text}</strong>;
          else if (m.type === "italic") text = <em key={k}>{text}</em>;
          else if (m.type === "strike") text = <s key={k}>{text}</s>;
          else if (m.type === "underline") text = <u key={k}>{text}</u>;
          else if (m.type === "code") text = <code key={k}>{text}</code>;
          else if (m.type === "link") {
            const href = safeUrl(String(m.attrs?.href || ""));
            if (href)
              text = (
                <a
                  key={k}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {text}
                </a>
              );
          }
        }
        return <Fragment key={key}>{text}</Fragment>;
      }
      case "paragraph":
        return <p key={key}>{children || <br />}</p>;
      case "heading":
        return Number(n.attrs?.level) === 3 ? (
          <h3 key={key}>{children}</h3>
        ) : Number(n.attrs?.level) === 4 ? (
          <h4 key={key}>{children}</h4>
        ) : (
          <h2 key={key}>{children}</h2>
        );
      case "bulletList":
        return <ul key={key}>{children}</ul>;
      case "orderedList":
        return (
          <ol key={key} start={Number(n.attrs?.start) || 1}>
            {children}
          </ol>
        );
      case "listItem":
        return <li key={key}>{children}</li>;
      case "taskList":
        return (
          <ul key={key} className="task-list">
            {children}
          </ul>
        );
      case "taskItem":
        return (
          <li key={key} className="task-item">
            <span aria-label={n.attrs?.checked ? "Elkészült" : "Még nyitott"}>
              {n.attrs?.checked ? "☑" : "☐"}
            </span>
            <div>{children}</div>
          </li>
        );
      case "blockquote":
        return <blockquote key={key}>{children}</blockquote>;
      case "codeBlock":
        return (
          <pre key={key}>
            <code>{n.content?.map((c) => c.text || "").join("")}</code>
          </pre>
        );
      case "hardBreak":
        return <br key={key} />;
      case "horizontalRule":
        return <hr key={key} />;
      case "image": {
        const a = n.attrs || {};
        const asset = a.asset as ImageAsset | undefined;
        const src = asset
          ? imageSrc(asset, urls)
          : safeImageUrl(String(a.src || ""));
        return src ? (
          <figure key={key}>
            <img
              src={src}
              alt={a.decorative ? "" : String(a.alt || "")}
              width={Number(a.width) || undefined}
              height={Number(a.height) || undefined}
            />
            {Boolean(a.caption || a.credit) && (
              <figcaption>
                {String(a.caption || "")}
                {a.credit ? ` · ${a.credit}` : ""}
              </figcaption>
            )}
          </figure>
        ) : null;
      }
      case "galleryBlock":
        return (
          <ReactGallery
            key={key}
            images={(n.attrs?.images as ImageAsset[]) || []}
            layout={(n.attrs?.layout as GalleryLayout) || "editorial-grid"}
            columns={Number(n.attrs?.columns) || 3}
            showCaptions={n.attrs?.showCaptions !== false}
            urls={urls}
          />
        );
      case "embedBlock":
        return (
          <Video
            key={key}
            url={String(n.attrs?.url || "")}
            title={String(n.attrs?.title || "Videó")}
          />
        );
      case "table":
        return (
          <div key={key} className="table-scroll">
            <table>
              <tbody>{children}</tbody>
            </table>
          </div>
        );
      case "tableRow":
        return <tr key={key}>{children}</tr>;
      case "tableHeader":
        return <th key={key}>{children}</th>;
      case "tableCell":
        return <td key={key}>{children}</td>;
      default:
        return null;
    }
  }
  return <div className="article-prose">{render(document, "doc")}</div>;
}
