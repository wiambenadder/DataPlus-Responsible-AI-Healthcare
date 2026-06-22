
// src/app/standardize/page.tsx
// Route: /standardize — Step 3 (Data Standardisation).
// The work happens in the browser, so the page just renders the client island.

import StandardizeClient from "./StandardizeClient";

export const metadata = {
  title: "Data Standardisation · DataPlus",
};

export default function Page() {
  return <StandardizeClient />;
}
