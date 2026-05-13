"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/shared/organisms/Navbar";
import Footer from "@/components/shared/organisms/Footer";
import ReservationDetailHeader from "@/components/features/reservas/organisms/ReservationDetailHeader";
import ReservationDetailPlan from "@/components/features/reservas/organisms/ReservationDetailPlan";
import ReservationDetailItinerary from "@/components/features/reservas/organisms/ReservationDetailItinerary";
import ReservationDetailAttraction from "@/components/features/reservas/organisms/ReservationDetailAttraction";
import ReservationDetailSidebar from "@/components/features/reservas/organisms/ReservationDetailSidebar";
import CancelConfirmModal from "@/components/features/reservas/organisms/CancelConfirmModal";
import { getReservationDetail } from "@/services/reservationDetail";
import { cancelReservation } from "@/services/reservations";
import { useAuth } from "@/context/AuthContext";

type ReservationDetailTemplateProps = {
  reservationId: string;
};

const ReservationDetailTemplate: React.FC<ReservationDetailTemplateProps> = ({
  reservationId,
}) => {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = React.useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [reservation, setReservation] = React.useState<
    Awaited<ReturnType<typeof getReservationDetail>> | null
  >(null);

  React.useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
      return;
    }

    if (!token) return;

    getReservationDetail(token, reservationId)
      .then((data) => setReservation(data))
      .catch(() => setError("No se pudo cargar el detalle de la reserva."));
  }, [loading, reservationId, router, token]);

  const handleConfirmCancel = async () => {
    if (!token || !reservation) return;
    try {
      setIsCancelling(true);
      await cancelReservation(token, reservation.id);
      setIsCancelModalOpen(false);
      router.push("/perfil/reservas");
    } catch {
      setError("No se pudo cancelar la reserva.");
      setIsCancelling(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-slate-900">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error ? (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : null}
          {reservation ? (
            <>
              <ReservationDetailHeader
                reservation={reservation}
                onCancelClick={() => setIsCancelModalOpen(true)}
              />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <ReservationDetailPlan plan={reservation.plan} />
                  <ReservationDetailItinerary items={reservation.itinerary} />
                  <ReservationDetailAttraction attraction={reservation.attraction} />
                </div>
                <ReservationDetailSidebar reservation={reservation} />
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-primary/10 bg-white px-4 py-10 text-center text-sm font-semibold text-slate-500">
              Cargando reserva...
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CancelConfirmModal
        open={isCancelModalOpen}
        reservationId={reservation?.id ?? reservationId}
        submitting={isCancelling}
        onConfirm={handleConfirmCancel}
        onClose={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
};

export default ReservationDetailTemplate;
