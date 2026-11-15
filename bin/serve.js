#!/usr/bin/env node
// Serves this folder at http://localhost:3000, the same files GitHub Pages serves.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, normalize } from "node:path";

const root = new URL("../", import.meta.url);
const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css" };
const port = Number(process.env.PORT ?? 3000);

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  const file = path.endsWith("/") ? `${path}index.html` : path;

  try {
    const body = await readFile(new URL(`.${file}`, root));
    res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found");
  }
}).listen(port, () => console.log(`http://localhost:${port}`));
