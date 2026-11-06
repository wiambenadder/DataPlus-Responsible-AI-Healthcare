# Policy Dashboard Prototype Changelog

The version labels below describe the Policy Codebook prototype and do not
change the version number of the wider Innovator Insights application.

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
