import assert from "node:assert/strict";

const base = process.env.SITE_TEST_URL || "http://127.0.0.1:3000";
const publicSite = "https://lucem-afferens.github.io/masterskaya-krasoty/";
const imagePath = "social/og-cover-v1.jpg";
const expectedImage = new URL(imagePath, publicSite).href;

function metadata(html) {
  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/)?.[1];
  assert.ok(head, "Metadata must be in initial HTML head, without JavaScript");
  const tags = new Map();
  for (const match of head.matchAll(/<meta\b[^>]*>/g)) {
    const attrs = Object.fromEntries(
      [...match[0].matchAll(/([\w:-]+)="([^"]*)"/g)].map((item) => [item[1], item[2]]),
    );
    const key = attrs.property || attrs.name;
    if (key?.startsWith("og:") || key?.startsWith("twitter:")) {
      assert.ok(!tags.has(key), `Duplicate social tag: ${key}`);
      tags.set(key, attrs.content);
    }
  }
  const canonical = head.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
  return { tags, canonical };
}

function verifyMetadata(html, path = "") {
  const { tags, canonical } = metadata(html);
  assert.equal(canonical, new URL(path, publicSite).href);
  assert.equal(tags.get("og:url"), canonical);
  assert.equal(tags.get("og:type"), "website");
  assert.equal(tags.get("og:locale"), "ru_RU");
  assert.equal(tags.get("og:site_name"), "Мастерская красоты");
  assert.ok(tags.get("og:title")?.includes("Мастерская красоты"));
  assert.ok(tags.get("og:description")?.length > 40);
  assert.equal(tags.get("og:image"), expectedImage);
  assert.equal(tags.get("og:image:type"), "image/jpeg");
  assert.equal(tags.get("og:image:width"), "1200");
  assert.equal(tags.get("og:image:height"), "630");
  assert.ok(tags.get("og:image:alt")?.includes("Время для себя"));
  assert.equal(tags.get("twitter:card"), "summary_large_image");
  assert.equal(tags.get("twitter:image"), expectedImage);
  assert.equal(tags.get("twitter:title"), tags.get("og:title"));
  assert.equal(tags.get("twitter:description"), tags.get("og:description"));
  assert.equal(tags.get("twitter:image:alt"), tags.get("og:image:alt"));
  return tags;
}

const response = await fetch(base);
assert.equal(response.status, 200);
verifyMetadata(await response.text());
const siteBase = new URL(response.url);
if (!siteBase.pathname.endsWith("/")) siteBase.pathname += "/";

const cover = await fetch(new URL(imagePath, siteBase));
assert.equal(cover.status, 200, "Cover must be publicly accessible");
assert.match(cover.headers.get("content-type"), /^image\/jpeg\b/);
const bytes = Buffer.from(await cover.arrayBuffer());
assert.equal(bytes.readUInt16BE(0), 0xffd8, "Cover is a real JPEG");
assert.ok(bytes.length < 1_000_000, "Keep social cover under 1 MB");
let dimensions;
for (let offset = 2; offset + 9 < bytes.length;) {
  assert.equal(bytes[offset], 0xff, "Valid JPEG marker");
  const marker = bytes[offset + 1];
  if ([0xc0, 0xc1, 0xc2].includes(marker)) {
    dimensions = [bytes.readUInt16BE(offset + 7), bytes.readUInt16BE(offset + 5)];
    break;
  }
  if (marker === 0xda || marker === 0xd9) break;
  const length = bytes.readUInt16BE(offset + 2);
  assert.ok(length >= 2);
  offset += 2 + length;
}
assert.deepEqual(dimensions, [1200, 630], "Metadata matches actual image dimensions");

for (const userAgent of ["TelegramBot (like TwitterBot)", "Twitterbot/1.0", "facebookexternalhit/1.1"]) {
  const bot = await fetch(siteBase, { headers: { "user-agent": userAgent } });
  assert.equal(bot.status, 200, `${userAgent} can read the page`);
  verifyMetadata(await bot.text());
}

const privacy = await fetch(new URL("privacy/", siteBase));
assert.equal(privacy.status, 200);
const privacyTags = verifyMetadata(await privacy.text(), "privacy/");
assert.match(privacyTags.get("og:title"), /^Конфиденциальность/);
console.log(`PASS: social metadata, 3 crawler user agents, privacy URL, JPEG 1200×630 (${bytes.length} bytes)`);
