// Serve the static build in out/ for a local preview. No dependencies needed.
// Usage: npm run build && npm run preview   (PORT=4000 npm run preview to change the port)
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve("out");
const port = Number(process.env.PORT) || 3000;
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".csv": "text/csv; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

async function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^([/\\])+/, "");
  const file = join(root, clean);
  if (!file.startsWith(root)) return null;
  for (const candidate of [file, join(file, "index.html"), `${file}.html`]) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  const file = (await resolveFile(req.url ?? "/")) ?? join(root, "404.html");
  try {
    const body = await readFile(file);
    const status = file.endsWith("404.html") && !req.url?.startsWith("/404") ? 404 : 200;
    res.writeHead(status, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(500).end("Run `npm run build` first.");
  }
}).listen(port, () => console.log(`Preview running at http://localhost:${port}`));
