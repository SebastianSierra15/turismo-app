/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ChatShell } from "@/components/features/chat/organisms/ChatShell";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://amaturis.com",
  ),
  title: "Amaturis | Turismo sostenible en Caquetá",
  description:
    "Amaturis conecta viajeros con experiencias auténticas en Caquetá: planes turísticos, naturaleza, cultura local y reservas sencillas para vivir aventuras responsables.",
  openGraph: {
    siteName: "Amaturis",
    type: "website",
    locale: "es_CO",
  },
  twitter: {
    card: "summary_large_image",
  },
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
        <AuthProvider>
          {children}
          <ChatShell />
        </AuthProvider>
      </body>
    </html>
  );
}
