import { PHOTOS, photoUrl, type PhotoKey } from "@/lib/photos";

/**
 * A cropped photo that fills its parent. The parent sets the size (for
 * example `h-56` or `aspect-[4/3]`). Uses a plain <img>: Unsplash's CDN
 * already resizes and compresses, so Next's optimiser isn't needed.
 */
export default function Photo({
  name,
  width = 1200,
  position = "center",
  className = "",
  priority = false,
}: {
  name: PhotoKey;
  width?: number;
  /** CSS object-position, e.g. "center 25%". */
  position?: string;
  className?: string;
  priority?: boolean;
}) {
  const p = PHOTOS[name];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl(name, width)}
      alt={p.alt}
      loading={priority ? "eager" : "lazy"}
      className={`h-full w-full bg-slate-200 object-cover ${className}`}
      style={{ objectPosition: position }}
    />
  );
}
