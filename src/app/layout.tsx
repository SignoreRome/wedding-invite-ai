import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { invitationContent } from "@/lib/invitation-content";

import "./globals.css";

const fallbackSiteUrl = "http://localhost:3000";

function getMetadataBase() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: `${invitationContent.couple} | Свадебное приглашение`,
  description:
    "Мобильное свадебное приглашение с одной публичной страницей и подготовленной секцией для будущего RSVP.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${invitationContent.couple} | Свадебное приглашение`,
    description:
      "Сохраните дату, посмотрите программу дня и следите за будущим запуском формы RSVP.",
    locale: "ru_RU",
    type: "website",
    url: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f7463",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
