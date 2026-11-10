HEALTH AI POLICY DASHBOARD — PORTABLE OFFLINE DEMO v0.3.2

No installation, internet connection, Node.js, or local server is required.

macOS
1. Double-click “Open Health AI Policy Dashboard v0.3.2.command”.
2. If macOS asks for confirmation, choose Open.
3. You can also open index.html directly in Safari, Chrome, Firefox, or Edge.

Windows
1. Double-click “Open Health AI Policy Dashboard v0.3.2.cmd”.
2. Your default browser will open the demo.
3. You can also open index.html directly in Chrome, Edge, or Firefox.

STOPPING OR QUITTING
This portable package does not start a local server. Close the browser tab or
window when the demonstration is finished. There is no background process to
stop.

OFFLINE AND EXTERNAL CONTENT
The dashboard, map, navigation, analysis drawer, and illustrative document
viewer work offline. The “Innovator Insights” link points to the live main
website and therefore requires an internet connection.

DEMONSTRATION FLOW
1. Start on the Policy Codebook entry page, then open the interactive map.
2. Explore the corrected world map and open Rwanda or Mexico.
3. Switch between Summary Assessment and Document Repository.
4. Select “View Supporting Source” or “Open Analysis Drawer”.
5. Select “View Illustrative Source” or a cited page in the drawer.
6. Navigate cited and contextual document pages, then close the viewer to
   return to the still-open analysis drawer.
7. Use Advanced Search to filter sample instruments.

All policy content, document passages, statistics, and counts are illustrative
placeholders for interface testing. They are not official policy sources.

VERSION 0.3.2
This release keeps the v0.3.1 use flow and visual design while adding Mexico as
the second complete demonstration country. Mexico has its own illustrative
assessments, agencies, documents, Spanish excerpts, citations, analysis drawer,
and source-viewer content. It does not reuse Rwanda's sample documents.

NATIVE AND PORTABLE ARCHITECTURE
The native Next.js v0.3.2 source retains the /policy-codebook entry route,
two-way /hub navigation, live Policy Codebook tool status, typed repository
layer, and three country/document API endpoints introduced in v0.2.

This offline package mirrors the entry page, Available Now status, reverse
navigation, and repository interactions using browser-local fixtures. It does
not execute the Next.js API endpoints because doing so would require a server.
