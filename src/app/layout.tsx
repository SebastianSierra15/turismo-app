/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ChatShell } from "@/components/features/chat/organisms/ChatShell";
import { DEFAULT_KEYWORDS, DEFAULT_SOCIAL_IMAGE, SITE_URL } from "@/lib/seo";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Amaturis | Turismo sostenible en Caquetá",
  description:
    "Amaturis conecta viajeros con experiencias auténticas en Caquetá: planes turísticos, naturaleza, cultura local y reservas sencillas para vivir aventuras responsables.",
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: "Amaturis" }],
  creator: "Amaturis",
  publisher: "Amaturis",
  category: "travel",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Amaturis | Turismo sostenible en Caquetá",
    description:
      "Amaturis conecta viajeros con experiencias auténticas en Caquetá: planes turísticos, naturaleza, cultura local y reservas sencillas para vivir aventuras responsables.",
    url: "/",
    siteName: "Amaturis",
    type: "website",
    locale: "es_CO",
    images: [{ url: DEFAULT_SOCIAL_IMAGE, alt: "Paisaje amazónico del Caquetá" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amaturis | Turismo sostenible en Caquetá",
    description:
      "Amaturis conecta viajeros con experiencias auténticas en Caquetá: planes turísticos, naturaleza, cultura local y reservas sencillas para vivir aventuras responsables.",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Amaturis",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      description:
        "Plataforma de turismo sostenible y experiencias auténticas en Caquetá.",
      areaServed: { "@type": "AdministrativeArea", name: "Caquetá, Colombia" },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Amaturis",
      url: SITE_URL,
      inLanguage: "es-CO",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${plusJakarta.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <AuthProvider>
          {children}
          <ChatShell />
        </AuthProvider>
      </body>
    </html>
  );
}
