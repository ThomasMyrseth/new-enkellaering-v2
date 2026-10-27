// Fails the build if an email in ../server links to a page that does not exist in app/,
// or links to localhost / a vercel.app preview instead of the prod domain.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const uiDir = fileURLToPath(new URL("..", import.meta.url));
const serverDir = join(uiDir, "..", "server");
const SKIP_DIRS = new Set(["venv", ".venv", "__pycache__", "node_modules", "site-packages"]);

function walk(dir, onFile) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path, onFile);
    } else onFile(path);
  }
}

// Next.js route dirs -> regexes: [id] matches one segment, [...x] one or more, [[...x]] zero or more
const routes = [];
walk(join(uiDir, "app"), (file) => {
  if (!/\/page\.(tsx|ts|jsx|js|mdx)$/.test(file)) return;
  const segments = relative(join(uiDir, "app"), file).split("/").slice(0, -1).filter((s) => !s.startsWith("("));
  const pattern = segments
    .map((s) => (s.startsWith("[[...") ? "(?:/.*)?" : s.startsWith("[...") ? "/.+" : s.startsWith("[") ? "/[^/]+" : "/" + s))
    .join("");
  routes.push(new RegExp(`^${pattern || "/"}$`));
});

if (!existsSync(serverDir)) {
  console.error(`check-email-links: ${serverDir} not found. Enable "Include files outside the Root Directory" in Vercel.`);
  process.exit(1);
}
const pyFiles = [];
walk(serverDir, (file) => file.endsWith(".py") && pyFiles.push(file));

const errors = [];
let checked = 0;
for (const file of pyFiles) {
  readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    const where = `${relative(join(uiDir, ".."), file)}:${i + 1}`;
    for (const [url, path] of line.matchAll(/https?:\/\/(?:www\.)?enkellaering\.no(\/[^\s"'<>{}]*)?/g)) {
      checked++;
      const route = (path || "/").split(/[?#]/)[0].replace(/(.)\/$/, "$1");
      if (!routes.some((r) => r.test(route))) errors.push(`${where}  ${url}  (no page at app${route})`);
    }
    for (const [, url] of line.matchAll(/href=["'](https?:\/\/(?:localhost|127\.0\.0\.1|[^"'/]*\.vercel\.app)[^"']*)/g)) {
      errors.push(`${where}  ${url}  (not a prod URL)`);
    }
  });
}

if (errors.length) {
  console.error(`check-email-links: ${errors.length} broken email link(s):\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
console.log(`check-email-links: ${checked} enkellaering.no links in server/ OK`);
