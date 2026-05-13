import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/shared/organisms/Navbar";
import Footer from "@/components/shared/organisms/Footer";

type ReservaConfirmacionPageProps = {
  searchParams: Promise<{ reserva_id?: string }>;
};

export const metadata: Metadata = {
  title: "Amaturis | Reserva confirmada",
  description:
    "Consulta la confirmación de tu reserva y accede al detalle completo.",
};

export default async function ReservaConfirmacionPage({
  searchParams,
}: ReservaConfirmacionPageProps) {
  const { reserva_id } = await searchParams;
  const reservationId = reserva_id ?? "";

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-slate-900">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-primary/10 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black text-slate-900">Reserva confirmada</h1>
            <p className="mt-3 text-sm text-slate-600">
              Tu reserva se registró correctamente.
            </p>
            {reservationId ? (
              <p className="mt-2 text-sm text-slate-700">
                ID de reserva: <span className="font-bold">{reservationId}</span>
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={reservationId ? `/perfil/reservas/${reservationId}` : "/perfil/reservas"}
                className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary/90"
              >
                Ver detalle de reserva
              </Link>
              <Link
                href="/perfil/reservas"
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Ir a mis reservas
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
