import type { Metadata } from "next";
import { NotificationsTemplate } from "@/components/features/missing-views/templates";

export const metadata: Metadata = {
  title: "Amaturis | Notificaciones",
  description:
    "Centro de notificaciones para reservas, pagos, mensajes del guia y novedades.",
  robots: { index: false, follow: false },
};

export default function NotificacionesPage() {
  return <NotificationsTemplate />;
}
