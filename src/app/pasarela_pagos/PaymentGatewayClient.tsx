"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/shared/organisms/Navbar";
import Footer from "@/components/shared/organisms/Footer";
import Button from "@/components/shared/atoms/Button";
import Icon from "@/components/shared/atoms/Icon";
import { useAuth } from "@/context/AuthContext";
import { parseApiError } from "@/lib/api";

type Props = {
  paqueteId: string;
  fechaViaje: string;
  viajeros: number;
};

const image =
  "https://1qnmejprcdqaudae.public.blob.vercel-storage.com/amaturis/semillas/paisaje-amazonico-caqueta.jpg";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const PaymentGatewayClient: React.FC<Props> = ({ paqueteId, fechaViaje, viajeros }) => {
  const router = useRouter();
  const { token, loading } = useAuth();
  const [cardNumber, setCardNumber] = React.useState("");
  const [holder, setHolder] = React.useState("");
  const [expiry, setExpiry] = React.useState("");
  const [cvv, setCvv] = React.useState("");
  const [document, setDocument] = React.useState("");
  const [isPaying, setIsPaying] = React.useState(false);
  const [error, setError] = React.useState("");

  const formattedCard = cardNumber
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();

  const formattedExpiry = expiry
    .replace(/\D/g, "")
    .slice(0, 4)
    .replace(/(\d{2})(\d{0,2})/, (_, mm, yy) => (yy ? `${mm}/${yy}` : mm));

  const normalizedHolder = holder.toUpperCase();

  const cardValid = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(formattedCard);
  const holderValid = /^[A-ZÁÉÍÓÚÑ ]{6,80}$/.test(normalizedHolder.trim());
  const expiryValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(formattedExpiry);
  const cvvValid = /^\d{3,4}$/.test(cvv);
  const documentValid = /^[A-Za-z0-9-]{6,20}$/.test(document.trim());

  const formValid =
    cardValid && holderValid && expiryValid && cvvValid && documentValid;

  const pricePerPerson = 245000;
  const subtotal = pricePerPerson * viajeros;
  const serviceFee = Math.round(subtotal * 0.07);
  const total = subtotal + serviceFee;

  const fmt = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);

  React.useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
    }
  }, [loading, router, token]);

  const handlePay = async () => {
    if (!formValid) return;
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setIsPaying(true);
      setError("");
      const response = await fetch(`${API_URL}/reservas/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paquete_id: paqueteId,
          fecha_viaje: fechaViaje,
          cantidad_personas: viajeros,
        }),
      });

      if (!response.ok) {
        throw await parseApiError(response, "No se pudo registrar la reserva.");
      }

      const data = await response.json();
      const reservationId = data?.reserva_id;
      router.push(
        `/reservas/confirmacion?reserva_id=${encodeURIComponent(
          reservationId
        )}`
      );
    } catch (payError) {
      const message =
        payError instanceof Error
          ? payError.message
          : "No se pudo registrar la reserva.";
      setError(message);
      setIsPaying(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-slate-900">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">
              Pago seguro
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Confirma tu reserva
            </h1>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Numero de tarjeta
                  </span>
                  <input
                    value={formattedCard}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    inputMode="numeric"
                    required
                    className="w-full rounded-xl bg-slate-50 px-4 py-3.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
                <label className="space-y-2 sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Nombre en la tarjeta
                  </span>
                  <input
                    value={normalizedHolder}
                    onChange={(e) => setHolder(e.target.value)}
                    placeholder="COMO APARECE EN LA TARJETA"
                    required
                    className="w-full rounded-xl bg-slate-50 px-4 py-3.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Vencimiento
                  </span>
                  <input
                    value={formattedExpiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/AA"
                    inputMode="numeric"
                    required
                    className="w-full rounded-xl bg-slate-50 px-4 py-3.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    CVV
                  </span>
                  <input
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    inputMode="numeric"
                    required
                    className="w-full rounded-xl bg-slate-50 px-4 py-3.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
                <label className="space-y-2 sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Documento
                  </span>
                  <input
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    placeholder="Cedula o pasaporte"
                    required
                    className="w-full rounded-xl bg-slate-50 px-4 py-3.5 text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
              </div>
              <Button
                variant="primary"
                onClick={handlePay}
                disabled={!formValid || isPaying}
                className="w-full rounded-xl py-4 normal-case tracking-normal"
              >
                <Icon name="payments" />
                {isPaying ? "Procesando pago..." : "Pagar y confirmar reserva"}
              </Button>
              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              ) : null}
            </section>
            <aside className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="relative h-44 w-full overflow-hidden rounded-xl">
                <Image
                  src={image}
                  alt="Resumen del plan"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 360px"
                />
              </div>
              <h2 className="mt-4 text-2xl font-black text-slate-950">Resumen</h2>
              <p className="mt-1 text-sm text-slate-500">
                {fechaViaje} · {viajeros} viajeros · {paqueteId}
              </p>
              <div className="mt-6 space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">{fmt(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Tarifa de servicio</span>
                  <span className="font-bold text-slate-800">{fmt(serviceFee)}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-black text-slate-950">
                  <span>Total a pagar</span>
                  <span className="text-primary">{fmt(total)}</span>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentGatewayClient;
