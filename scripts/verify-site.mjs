import assert from "node:assert/strict";

const base = (process.env.SITE_TEST_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
let assetBase;
let checks = 0;
const page = await fetch(base);
assert.equal(page.status, 200, "Homepage must return 200");
checks++;
const html = await page.text();
assetBase = new URL(page.url).pathname.replace(/\/$/, "");
assert.match(html, /<html[^>]*lang="ru"/, "Russian language metadata");
checks++;
assert.match(html, /Мастерская красоты/, "Server-rendered content");
checks++;
assert.match(html, /tel:\+79998904035/, "Nail master phone from source");
checks++;
assert.match(html, /tel:\+79951179076/, "Body specialist phone from source");
checks++;
assert.match(html, /https:\/\/t.me\/Tala0612/, "Original QR-code destination");
checks++;
assert.match(html, /11:00–22:30/, "Correct nail service hours");
checks++;
assert.match(html, /10:00–23:00/, "Correct body service hours");
checks++;
assert.match(html, /вторник и среда/, "Nail service days off");
checks++;
assert.ok(!html.includes("codex-preview"), "No starter metadata");
checks++;
const match = html.match(
  /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s,
);
assert.ok(match, "Structured data exists");
const data = JSON.parse(match[1]);
assert.equal(data["@type"], "BeautySalon");
assert.equal(data.address.streetAddress, "Михневская улица, 7к2с1");
checks++;
// GitHub Pages controls its own response headers; the local server owns ours.
if (["127.0.0.1", "localhost"].includes(new URL(base).hostname)) {
  assert.equal(page.headers.get("x-content-type-options"), "nosniff", "Security headers enabled");
  checks++;
}
const scripts = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(
  (x) => x[1],
);
const styles = [
  ...html.matchAll(/<link[^>]*href="([^"]+\.css(?:\?[^"]*)?)"/g),
].map((x) => x[1]);
const images = [
  "/images/beauty-editorial-v2-640.webp",
  "/images/beauty-editorial-v2-1200.webp",
  "/images/studio-800.webp",
  "/images/studio-1600.webp",
  "/images/studio-2400.webp",
  "/brand/logo-horizontal.webp",
  "/brand/logo-stacked.webp",
  "/favicon.ico",
  "/favicon-32x32.png",
  "/favicon-96x96.png",
  "/apple-touch-icon.png",
  "/robots.txt",
].map((asset) => `${assetBase}${asset}`);
const fonts = new Set();
for (const asset of [...new Set([...scripts, ...styles, ...images])]) {
  const url = new URL(asset, base);
  assert.equal(
    url.origin,
    new URL(base).origin,
    "No external render dependencies",
  );
  const r = await fetch(url);
  assert.equal(r.status, 200, `Asset missing: ${asset}`);
  const bytes = await r.arrayBuffer();
  assert.ok(bytes.byteLength > 0, `Empty asset: ${asset}`);
  if (asset.endsWith(".css")) {
    for (const match of new TextDecoder().decode(bytes).matchAll(/url\(["']?([^)'"\s]+\.woff2)["']?\)/g)) {
      fonts.add(new URL(match[1], url).href);
    }
  }
  checks++;
}
assert.ok(fonts.size > 0, "Local font URLs exist in compiled CSS");
for (const font of fonts) {
  assert.equal(new URL(font).origin, new URL(base).origin, "Fonts stay local");
  const response = await fetch(font);
  assert.equal(response.status, 200, `Font missing: ${font}`);
  assert.ok((await response.arrayBuffer()).byteLength > 0);
  checks++;
}
const siteBase = new URL(`${assetBase}/`, base).href;
const privacy = await fetch(new URL("privacy/", siteBase));
assert.equal(privacy.status, 200);
assert.match(await privacy.text(), /Конфиденциальность/);
checks++;
const missing = await fetch(new URL("this-page-does-not-exist", siteBase));
assert.equal(missing.status, 404, "Unknown routes must return 404");
assert.match(await missing.text(), /СТРАНИЦА НЕ НАЙДЕНА/);
checks++;
console.log(`PASS: ${checks} production checks (${base})`);
