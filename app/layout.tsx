import type { Metadata } from "next";
import { studio } from "@/lib/studio";
import { sitePath } from "@/lib/paths";
import "./fonts.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Мастерская красоты — ногтевой сервис и эстетика тела в Москве",
  description:
    "Маникюр, педикюр, наращивание ногтей и эстетика тела. Мастерская красоты на Михневской, 7к2с1, Москва. Запись напрямую к мастерам по телефону и в Telegram.",
  applicationName: studio.name,
  icons: {
    icon: [
      { url: sitePath("/favicon.ico?v=mk2"), sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: sitePath("/favicon-32x32.png?v=mk2"), sizes: "32x32", type: "image/png" },
      { url: sitePath("/favicon-96x96.png?v=mk2"), sizes: "96x96", type: "image/png" },
    ],
    shortcut: sitePath("/favicon.ico?v=mk2"),
    apple: { url: sitePath("/apple-touch-icon.png?v=mk2"), sizes: "180x180", type: "image/png" },
  },
  openGraph: {
    title: "Мастерская красоты · Место для себя",
    description:
      "Ногтевой сервис и эстетика тела в уютной мастерской на Михневской, 7к2с1. Москва. По предварительной записи.",
    locale: "ru_RU",
    type: "website",
    siteName: studio.name,
  },
  robots: { index: true, follow: true },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  name: studio.name,
  description:
    "Ногтевой сервис и эстетика тела в Москве. Приём по предварительной записи.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Михневская улица, 7к2с1",
    addressLocality: "Москва",
    addressCountry: "RU",
  },
  telephone: ["+79998904035", "+79951179076"],
  department: [
    {
      "@type": "BeautySalon",
      name: "Ногтевой сервис — Светлана",
      telephone: "+79998904035",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: "11:00",
          closes: "22:30",
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
