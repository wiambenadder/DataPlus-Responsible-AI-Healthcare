/**
 * Photos used across the site. Every photo is from Unsplash and was checked
 * on its Unsplash page as "Free to use under the Unsplash License"
 * (https://unsplash.com/license): free for commercial use, no permission
 * needed. Credit isn't required, but we keep it here and in the footer.
 *
 * Images are served from Unsplash's CDN, which resizes them on request.
 * The set is chosen to show a balance of people and places.
 */

export type PhotoKey =
  | "hero"
  | "aiReadiness"
  | "aiReadinessAlt"
  | "financing"
  | "policy"
  | "innovators"
  | "funders"
  | "healthSystems";

type Photo = {
  /** Unsplash CDN id (images.unsplash.com/<id>). */
  id: string;
  alt: string;
  photographer: string;
  /** Unsplash photo page, for the credit. */
  page: string;
};

export const PHOTOS: Record<PhotoKey, Photo> = {
  hero: {
    id: "photo-1666886573440-16ac24f89e31",
    alt: "Two health professionals reviewing a tablet together",
    photographer: "Nappy",
    page: "https://unsplash.com/photos/DbCfSrTnflA",
  },
  aiReadiness: {
    id: "photo-1659353887907-000c9a92377d",
    alt: "A doctor holding a tablet",
    photographer: "Fotos",
    page: "https://unsplash.com/photos/nZ6uyHfWeDI",
  },
  aiReadinessAlt: {
    id: "photo-1659353888477-6e6aab941b55",
    alt: "A doctor holding a tablet",
    photographer: "Fotos",
    page: "https://unsplash.com/photos/V5seIsOiZx0",
  },
  financing: {
    id: "photo-1655720357872-ce227e4164ba",
    alt: "A team looking at a laptop together",
    photographer: "Iwaria Inc.",
    page: "https://unsplash.com/photos/M7ALc3UuX_g",
  },
  policy: {
    id: "photo-1759310610480-48649b55fbdf",
    alt: "A group of people in a meeting",
    photographer: "Amari Shutters",
    page: "https://unsplash.com/photos/I-YvZzFmxVk",
  },
  innovators: {
    id: "photo-1573164574511-73c773193279",
    alt: "A team working together in an office",
    photographer: "Christina @ wocintechchat.com",
    page: "https://unsplash.com/photos/rg1y72eKw6o",
  },
  funders: {
    id: "photo-1568992687947-868a62a9f521",
    alt: "Colleagues in a meeting around a table",
    photographer: "Redd Francisco",
    page: "https://unsplash.com/photos/5U_28ojjgms",
  },
  healthSystems: {
    id: "photo-1758691462651-611d730c5272",
    alt: "A doctor with a stethoscope at her desk",
    photographer: "Vitaly Gariev",
    page: "https://unsplash.com/photos/_zbqco3m7dA",
  },
};

/** Unsplash CDN URL, cropped server-side to the requested width. */
export function photoUrl(key: PhotoKey, width = 1200): string {
  return `https://images.unsplash.com/${PHOTOS[key].id}?auto=format&fit=crop&w=${width}&q=75`;
}
