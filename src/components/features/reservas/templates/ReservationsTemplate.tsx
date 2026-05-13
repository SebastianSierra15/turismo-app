"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/shared/organisms/Navbar";
import Footer from "@/components/shared/organisms/Footer";
import ReservationsHeader from "@/components/features/reservas/organisms/ReservationsHeader";
import ReservationsList from "@/components/features/reservas/organisms/ReservationsList";
import ReservationsHelp from "@/components/features/reservas/organisms/ReservationsHelp";
import CancelConfirmModal from "@/components/features/reservas/organisms/CancelConfirmModal";
import { cancelReservation, getReservations } from "@/services/reservations";
import { useAuth } from "@/context/AuthContext";

const ReservationsTemplate = () => {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = React.useState("");
  const [submittingId, setSubmittingId] = React.useState("");
  const [pendingCancelId, setPendingCancelId] = React.useState("");
  const [reservations, setReservations] = React.useState<
    Awaited<ReturnType<typeof getReservations>>
  >([]);

  const fetchReservations = React.useCallback(async () => {
    if (!token) return;
    const data = await getReservations(token);
    setReservations(data);
  }, [token]);

  React.useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
      return;
    }
    if (token) {
      fetchReservations().catch(() =>
        setError("No se pudieron cargar tus reservas.")
      );
    }
  }, [fetchReservations, loading, router, token]);

  const requestCancel = (reservationId: string) => {
    setPendingCancelId(reservationId);
  };

  const confirmCancel = async () => {
    if (!token || !pendingCancelId) return;
    try {
      setSubmittingId(pendingCancelId);
      await cancelReservation(token, pendingCancelId);
      await fetchReservations();
      setPendingCancelId("");
    } catch {
      setError("No se pudo cancelar la reserva.");
    } finally {
      setSubmittingId("");
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-slate-900">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ReservationsHeader />
          {error ? (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : null}
          <ReservationsList
            reservations={reservations}
            onCancel={requestCancel}
            submittingId={submittingId}
          />
          <ReservationsHelp />
        </div>
      </main>
      <Footer />
      <CancelConfirmModal
        open={Boolean(pendingCancelId)}
        reservationId={pendingCancelId}
        submitting={Boolean(submittingId)}
        onConfirm={confirmCancel}
        onClose={() => setPendingCancelId("")}
      />
    </div>
  );
};

export default ReservationsTemplate;
