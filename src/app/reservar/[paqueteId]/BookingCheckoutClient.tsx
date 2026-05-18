"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/shared/organisms/Navbar";
import Footer from "@/components/shared/organisms/Footer";
import { useAuth } from "@/context/AuthContext";
import { parseApiError } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type BookingCheckoutClientProps = {
  paqueteId: string;
};

const BookingCheckoutClient: React.FC<BookingCheckoutClientProps> = ({
  paqueteId,
}) => {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [date, setDate] = React.useState("");
  const [travelers, setTravelers] = React.useState(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!loading && !token) router.push("/login");
  }, [loading, router, token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    if (!date) {
      setError("Selecciona una fecha de viaje.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const response = await fetch(`${API_URL}/reservas/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paquete_id: paqueteId,
          fecha_viaje: date,
          cantidad_personas: travelers,
        }),
      });

      if (!response.ok) {
        throw await parseApiError(response, "No se pudo crear la reserva.");
      }

      const data = await response.json();
      const reservationId = data?.reserva_id;
      router.push(`/reservas/confirmacion?reserva_id=${encodeURIComponent(reservationId)}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo crear la reserva.";
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-slate-900">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-primary/10 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-black text-slate-900">Finalizar reserva</h1>
            <p className="mt-2 text-sm text-slate-600">
              Paquete: <span className="font-semibold">{paqueteId}</span>
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Fecha de viaje
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Viajeros
                </label>
                <select
                  value={travelers}
                  onChange={(event) => setTravelers(Number(event.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                >
                  {[1, 2, 3, 4, 5, 6].map((value) => (
                    <option key={value} value={value}>
                      {value} {value === 1 ? "persona" : "personas"}
                    </option>
                  ))}
                </select>
              </div>
              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {submitting ? "Procesando..." : "Reservar y continuar"}
                </button>
                <Link
                  href={`/planes/${paqueteId}`}
                  className="rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Volver al plan
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingCheckoutClient;
