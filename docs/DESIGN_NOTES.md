# Design notes

The site follows Duke University's brand: **EB Garamond** for headings and
**Open Sans** for text (both Duke brand typefaces, self-hosted in
`src/app/fonts`, SIL Open Font License), Duke Navy `#012169` and Royal Blue
`#00539B`, and the Duke secondary palette for the five domains. Headings use
title case; body copy follows AP style (American spelling, one to nine spelled
out, "percent" in running text). Colour tokens live in `src/app/globals.css`.

## Logo

The header shows the Innovations in Healthcare logo, hotlinked from
innovationsinhealthcare.org (`SITE.orgLogo` in `src/lib/site.ts`). Before
launch:

1. Confirm with Innovations in Healthcare that the logo can be used here.
2. Save the white logo to `public/brand/iih-logo-white.png` and point
   `SITE.orgLogo` at `/brand/iih-logo-white.png`, so the site doesn't depend
   on their server. If the image can't load, the header shows the name in text.

## Photos

All photos are from Unsplash and were checked on their Unsplash pages as
"Free to use under the Unsplash License" (free for commercial use, no
permission needed). The list, with photographers and links, is in
`src/lib/photos.ts`. To swap a photo, change its id there. Images are served
from Unsplash's CDN (`images.unsplash.com`).

The Innovations in Healthcare and Duke Global Health Innovation Center sites
were checked for reusable photos; their own photos are copyrighted (the
GHIC site itself mostly uses Unsplash photos), so they aren't used here.

## Roadmap Assistant

`/roadmap` has a chat panel backed by `POST /api/roadmap-help`.

- Uses the Duke LiteLLM gateway when `LITELLM_TOKEN` is set, like the other AI
  routes. Model: `HELP_CHAT_MODEL` (default `gpt-5.2`).
- Without the token, or if the model call fails, it answers from the built-in
  guide in `src/lib/help-guide.ts`, so it always gives an answer.
- Only signed-in users can call it (Supabase access token in the
  `Authorization` header).
- It receives the company's stage statuses, never their documents. Keep the
  site description in `help-guide.ts` in step with the pages.


## Editing the codebook pages

The Financing Codebook (`/financing-codebook`) and Policy Codebook
(`/policy-codebook`) pages are deliberately simple placeholders. Everything on
them comes from the codebook's entry in `src/lib/workstreams.ts`:

- `title`, `intro` (the paragraph under the title), `why` (the "Why It Matters"
  paragraphs), `photo`, and the card text on All Tools (`description`,
  `highlights`, `cta`).

To build the real codebook, replace `src/app/financing-codebook/page.tsx` (or
`policy-codebook`) with the new page and set the entry's `status` to `"live"`.
