import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Amaturis | Turismo sostenible en Caquetá",
    short_name: "Amaturis",
    description:
      "Experiencias auténticas, planes turísticos y destinos naturales en Caquetá.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#6c9f62",
    lang: "es-CO",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
