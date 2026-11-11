/**
 * Prints the text of each page of a PDF as JSON: ["page 1 text", ...].
 *
 *   node scripts/library/pdf-text.cjs path/to/file.pdf
 *
 * Used by lib.ts. It runs on its own, in plain Node, because the bundled
 * PDF reader in pdf-parse breaks when other libraries (or tsx) are loaded
 * in the same process.
 */
// lib/pdf-parse.js avoids the package's built-in test file lookup.
// Plain CommonJS on purpose (see above), so require() is needed here.
/* eslint-disable @typescript-eslint/no-require-imports */
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
const fs = require("node:fs");

// Starts a new line whenever the text moves down the page (the same rule
// pdf-parse uses by default).
function pageText({ items }) {
  let lastY;
  let text = "";
  for (const it of items) {
    const y = it.transform[5];
    text += lastY === undefined || y === lastY ? it.str : `\n${it.str}`;
    lastY = y;
  }
  return text;
}

async function read(buf) {
  const pages = [];
  await pdfParse(buf, {
    // Called once per page, in order.
    pagerender: (page) =>
      page.getTextContent().then((content) => {
        const text = pageText(content);
        pages.push(text);
        return text;
      }),
  });
  return pages;
}

(async () => {
  const buf = fs.readFileSync(process.argv[2]);
  // The bundled PDF reader sometimes fails on its first uses in a process
  // ("bad XRef entry") and then works, so try a few times.
  let pages;
  for (let attempt = 1; !pages; attempt++) {
    try {
      pages = await read(buf);
    } catch (err) {
      if (attempt >= 3) throw err;
    }
  }
  process.stdout.write(JSON.stringify(pages));
})().catch((err) => {
  console.error(String(err));
  process.exit(1);
});
