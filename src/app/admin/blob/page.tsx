import type { Metadata } from "next";
import { AdminBlobUploadTemplate } from "@/components/features/missing-views/templates";

export const metadata: Metadata = {
  title: "Amaturis | Imagenes RDF",
  description: "Carga de imagenes publicas en Vercel Blob para individuos RDF.",
};

export default function AdminBlobPage() {
  return <AdminBlobUploadTemplate />;
}
