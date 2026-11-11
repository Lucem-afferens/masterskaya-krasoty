import type { Metadata } from "next";
import { studio } from "@/lib/studio";

const publicSite = new URL("https://lucem-afferens.github.io/masterskaya-krasoty/");
const image = {
  url: new URL("social/og-cover-v1.jpg", publicSite).href,
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "Мастерская красоты — Время для себя. Ногтевой сервис и эстетика тела в Москве. Фирменный логотип и редакционный портрет женщины с нежным маникюром.",
};

export function socialMetadata(
  title: string,
  description: string,
  path = "",
): Metadata {
  const url = new URL(path, publicSite).href;
  return {
    metadataBase: publicSite,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      locale: "ru_RU",
      type: "website",
      siteName: studio.name,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}
