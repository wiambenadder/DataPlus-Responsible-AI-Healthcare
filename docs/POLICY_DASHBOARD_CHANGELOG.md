# Policy Dashboard Prototype Changelog

The version labels below describe the Policy Codebook prototype and do not
change the version number of the wider Innovator Insights application.

## v0.3.2 — Mexico demonstration flow

- Added Mexico as the second country with a complete demonstration workspace.
- Made Mexico selectable from the Module B map and connected it to the same
  summary, baseline, repository, analysis-drawer and source-viewer flow used by
  Rwanda.
- Added four distinct, explicitly illustrative Mexico policy instruments with
  Mexico-specific agencies, Spanish placeholder excerpts, citations and
  assessments; none reuse Rwanda's sample documents.
- Made the Mexico instruments and country filter fully available in Module C.
- Added matching native Next.js and portable offline implementations while
  preserving v0.3.1 as the previous release reference.

## v0.3.1 — Innovator Insights visual alignment

- Preserved all v0.3 content, information architecture, routes, filters,
  drawers, document-viewer behavior and placeholder data.
- Restyled the portable demo against the actual Innovator Insights `main`
  branch design system rather than the older v0.1 wireframe aesthetic.
- Added self-hosted EB Garamond headings alongside Open Sans body text.
- Adopted Duke Navy and Royal Blue, Whisper Gray section bands, official
  secondary accents, thin rules, small squared corners and restrained shadows.
- Increased editorial whitespace and replaced gradient or pill-heavy treatments
  with the main site's flat buttons, border-top cards and typography hierarchy.
- Retained v0.3 as an unchanged portable and source reference.
- Preserved the native `/policy-codebook` entry route, `/hub` return link,
  live Policy Codebook tools-card status, typed repository abstraction and all
  three country/document API endpoints introduced in v0.2.
- Mirrored the entry page, Available Now status, reverse Innovator Insights
  link and repository interactions in the offline demo; its fixtures remain
  browser-local because a no-server package cannot execute Next.js API routes.

## v0.3 — Integrated source viewer

- Replaced the analysis drawer's link back to the standalone HTML prototype
  with an in-application policy document viewer.
- Restored the v0.1 interaction sequence: country assessment or repository →
  analysis drawer → cited document page.
- Made each page/article reference in the codebook analysis open the matching
  dummy document page with its excerpt highlighted.
- Added citation-page navigation, contextual pages, document zoom controls,
  keyboard Escape behavior and responsive mobile controls.
- Added deterministic placeholder document text clearly marked as
  illustrative and not an official source.
- Kept the Duke/Innovator Insights typography, colors, buttons and overall
  application shell so the three MVP workstreams remain visually cohesive.
- Added no-install macOS and Windows offline packages under
  `Working Demos/Prototypes/v0.3`. These use browser-native HTML, CSS and
  JavaScript, so they do not start a local server or leave a background process.

## v0.2 — Native Next.js prototype

- Rebuilt the standalone policy-dashboard concept as native Next.js routes
  and React components under `/policy-codebook`.
- Added the map, Rwanda summary assessment, document repository, advanced
  search, analysis drawer and fixture-backed policy API endpoints.
- Added two-way navigation between the Policy Codebook and Innovator Insights.
- Preserved v0.1 in `public/policy-dashboard-demo` and the portable prototype
  in `Working Demos/Prototypes` as visual and interaction references.

## v0.1 — Standalone HTML interaction reference

- Established the original navigable HTML/CSS/JavaScript wireframe flow.
- Introduced the map, country workspace, repository, analysis drawer and
  document-viewer interaction pattern used as the product reference.
