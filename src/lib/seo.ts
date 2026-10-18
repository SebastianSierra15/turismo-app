import type { Metadata } from "next";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://amaturis.com"
).replace(/\/+$/, "");

export const DEFAULT_SOCIAL_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB6aB1OqFsG8iGytQuO0egF3B0bKBfpBOOPUgucjEZsQF_C29aXAs250nRCqTowYlR5YST7RoQ0sPNEiWUySv_-vOGT0bAwo-NJSckOjK8luPe6JV91KXnxy0g9tHbrY5bpSSdymFd6udL5qYgiCelDClo4xtYLod-BZwqGDsJhj7w8Zuvdhak-yA9F7Y0pvkzD2Bd4voVVI8J1yrI7y-jtkXRBvqBD50I1StK3NahD_YV2fo1ng7iW5FIWu2n7Cd-Ro7-oh6UNpJo";

export const DEFAULT_KEYWORDS = [
  "turismo en Caquetá",
  "planes turísticos en Caquetá",
  "turismo sostenible",
  "aventuras en la Amazonía colombiana",
  "destinos naturales en Caquetá",
  "Amaturis",
];

const googleBotDirectives = {
  index: true,
  follow: true,
  "max-video-preview": -1,
  "max-image-preview": "large" as const,
  "max-snippet": -1,
};

type PageSeoOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  keywords?: string[];
  noIndex?: boolean;
};

export const createPageMetadata = ({
  title,
  description,
  path,
  image = DEFAULT_SOCIAL_IMAGE,
  imageAlt = "Paisaje natural del Caquetá",
  keywords = DEFAULT_KEYWORDS,
  noIndex = false,
}: PageSeoOptions): Metadata => ({
  title,
  description,
  keywords,
  authors: [{ name: "Amaturis" }],
  creator: "Amaturis",
  publisher: "Amaturis",
  alternates: {
    canonical: path,
  },
  robots: noIndex
    ? {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
          noimageindex: true,
        },
      }
    : {
        index: true,
        follow: true,
        googleBot: googleBotDirectives,
      },
  openGraph: {
    title,
    description,
    url: path,
    siteName: "Amaturis",
    type: "website",
    locale: "es_CO",
    images: [{ url: image, alt: imageAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
  },
});

export const createNoIndexMetadata = (
  title: string,
  description: string,
): Metadata =>
  createPageMetadata({
    title,
    description,
    path: "/",
    noIndex: true,
  });
