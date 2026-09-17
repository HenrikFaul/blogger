/** Accessible local-video compatibility primitive. Never used as an automatic tracking player. */
import { safeImageUrl } from "../../lib/safety";
export interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  aspectRatio?: "video" | "square" | "portrait" | "auto";
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  captions?: { src: string; language: string; label: string }[];
}
export function VideoPlayer({
  src,
  poster,
  title = "Videó",
  aspectRatio = "video",
  loop = false,
  muted = false,
  captions = [],
}: VideoPlayerProps) {
  const url = safeImageUrl(src);
  if (!url) return <p role="status">A videó címe érvénytelen.</p>;
  // Native controls remain available for keyboard users. Legacy autoplay/controls=false are ignored.
  return (
    <figure className="local-video">
      <video
        controls
        preload="none"
        src={url}
        poster={safeImageUrl(poster)}
        aria-label={title}
        loop={loop}
        muted={muted}
        playsInline
        style={{
          width: "100%",
          height: "auto",
          borderRadius: 12,
          aspectRatio:
            aspectRatio === "auto"
              ? undefined
              : aspectRatio === "square"
                ? "1"
                : aspectRatio === "portrait"
                  ? "3/4"
                  : "16/9",
        }}
      >
        {captions
          .filter((t) => safeImageUrl(t.src))
          .map((t) => (
            <track
              key={t.src}
              kind="captions"
              src={t.src}
              srcLang={t.language}
              label={t.label}
            />
          ))}
        <a href={url}>Videó megnyitása</a>
      </video>
      <figcaption>{title}</figcaption>
    </figure>
  );
}
