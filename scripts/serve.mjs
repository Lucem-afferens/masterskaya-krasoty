import http from "node:http";
import { createReadStream } from "node:fs";
import { stat, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../out",
);
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 3000);
const basePath = (await readFile(path.join(root, ".base-path"), "utf8").catch((error) => {
  if (error.code === "ENOENT") return "";
  throw error;
})).trim();
if (basePath && !/^\/[a-zA-Z0-9_-]+$/.test(basePath))
  throw new Error("Invalid build base path");
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("Invalid PORT");
try {
  await stat(path.join(root, "index.html"));
} catch {
  throw new Error("Production build missing. Run npm run build first.");
}
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".xml": "application/xml; charset=utf-8",
};
const server = http.createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  res.setHeader(
    "Content-Security-Policy",
    "object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'",
  );
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end("Method not allowed");
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://local").pathname);
  } catch {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }
  if (
    pathname.includes("\0") ||
    pathname.includes("\\") ||
    pathname
      .split("/")
      .some(
        (segment) =>
          segment === ".." ||
          (segment.startsWith(".") && segment !== ".well-known"),
      )
  ) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  if (basePath && (pathname === "/" || pathname === basePath)) {
    res.writeHead(302, { Location: `${basePath}/` });
    res.end();
    return;
  }
  if (basePath && !pathname.startsWith(`${basePath}/`)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  pathname = pathname.slice(basePath.length);
  let file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(root + path.sep) && file !== root) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  let status = 200;
  let fileStat;
  try {
    fileStat = await stat(file);
    if (fileStat.isDirectory()) {
      file = path.join(file, "index.html");
      fileStat = await stat(file);
    }
    if (!fileStat.isFile()) throw new Error("Not a file");
  } catch {
    status = 404;
    file = path.join(root, "404.html");
    try {
      fileStat = await stat(file);
    } catch {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
  }
  const etag = `W/"${fileStat.size.toString(16)}-${Math.floor(fileStat.mtimeMs).toString(16)}"`;
  res.setHeader("ETag", etag);
  res.setHeader(
    "Content-Type",
    types[path.extname(file)] || "application/octet-stream",
  );
  res.setHeader(
    "Cache-Control",
    pathname.startsWith("/_next/static/")
      ? "public, max-age=31536000, immutable"
      : pathname.startsWith("/images/") || pathname.startsWith("/fonts/")
        ? "public, max-age=604800"
        : "no-cache",
  );
  if (req.headers["if-none-match"] === etag && status === 200) {
    res.writeHead(304);
    res.end();
    return;
  }
  res.setHeader("Content-Length", fileStat.size);
  res.writeHead(status);
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  const stream = createReadStream(file);
  stream.on("error", () => res.destroy());
  res.on("close", () => stream.destroy());
  stream.pipe(res);
});
server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
server.keepAliveTimeout = 5_000;
server.listen(port, host, () =>
  console.log(
    `Мастерская красоты · Production\nhttp://${host}:${port}${basePath}/\nServing ${root}`,
  ),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => server.close(() => process.exit(0)));
