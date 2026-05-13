"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/shared/organisms/Navbar";
import Footer from "@/components/shared/organisms/Footer";
import { useAuth } from "@/context/AuthContext";
import { cancelReservation } from "@/services/reservations";

type CancelReservationClientProps = {
  reservationId: string;
};

const CancelReservationClient: React.FC<CancelReservationClientProps> = ({
  reservationId,
}) => {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !token) router.push("/login");
  }, [loading, router, token]);

  const handleCancel = async () => {
    if (!token) return;
    try {
      setSubmitting(true);
      await cancelReservation(token, reservationId);
      router.push("/perfil/reservas");
    } catch {
      setError("No se pudo cancelar la reserva.");
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-slate-900">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-primary/10 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-black text-slate-900">Cancelar reserva</h1>
            <p className="mt-3 text-sm text-slate-600">
              Esta acción cambiará el estado de la reserva{" "}
              <span className="font-bold">{reservationId}</span> a cancelada.
            </p>
            {error ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {error}
              </div>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="rounded-full bg-rose-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {submitting ? "Cancelando..." : "Confirmar cancelación"}
              </button>
              <Link
                href={`/perfil/reservas/${reservationId}`}
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Volver
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CancelReservationClient;
