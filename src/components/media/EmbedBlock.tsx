/** Compatibility API. New MDX should use VideoEmbed.astro (no public React hydration). */
import { useState } from "react";
import { embedUrl } from "../../lib/creator/model";
import { safeUrl } from "../../lib/safety";
export type EmbedProvider =
  "youtube" | "vimeo" | "spotify" | "soundcloud" | "codepen";
export interface EmbedBlockProps {
  provider: EmbedProvider;
  url: string;
  title?: string;
  aspectRatio?: "video" | "square" | "portrait";
  autoLoad?: boolean;
}
export function EmbedBlock({
  provider,
  url,
  title = "Külső tartalom",
  aspectRatio = "video",
}: EmbedBlockProps) {
  // Deliberately never auto-load a third-party player, including through the legacy autoLoad prop.
  const [loaded, setLoaded] = useState(false);
  const source =
    provider === "youtube" || provider === "vimeo" ? embedUrl(url) : undefined;
  const link = safeUrl(url);
  if (!link)
    return <p role="status">Ez a hivatkozás nem használható biztonságosan.</p>;
  if (!source)
    return (
      <p className="embed-placeholder">
        Ez a szolgáltató ezen az oldalon nem ágyazható be.{" "}
        <a href={link} target="_blank" rel="noopener noreferrer">
          {title} megnyitása a szolgáltatónál
        </a>
      </p>
    );
  return (
    <figure className="embed-placeholder">
      {loaded ? (
        <iframe
          src={source}
          title={title}
          referrerPolicy="strict-origin-when-cross-origin"
          allow="fullscreen; picture-in-picture"
          allowFullScreen
          style={{
            width: "100%",
            border: 0,
            aspectRatio:
              aspectRatio === "square"
                ? "1"
                : aspectRatio === "portrait"
                  ? "3/4"
                  : "16/9",
          }}
        />
      ) : (
        <>
          <h3>{title}</h3>
          <p>
            A lejátszó csak kattintás után kapcsolódik a külső szolgáltatóhoz.
            Ekkor adat kerülhet a szolgáltatóhoz.
          </p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setLoaded(true)}
          >
            Videó betöltése
          </button>
          <p>
            <a href={link} target="_blank" rel="noopener noreferrer">
              Megnyitás új lapon
            </a>
          </p>
        </>
      )}
    </figure>
  );
}
