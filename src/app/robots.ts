import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/panel/",
        "/perfil/",
        "/login",
        "/registro",
        "/olvide-contrasena",
        "/notificaciones",
        "/reservar/",
        "/reservas/",
        "/pasarela_pagos",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
