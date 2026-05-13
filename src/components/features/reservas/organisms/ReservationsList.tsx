import React from "react";
import ReservationCard from "@/components/features/reservas/molecules/ReservationCard";
import { type Reservation } from "@/types/reservations";

interface ReservationsListProps {
  reservations: Reservation[];
  onCancel?: (reservationId: string) => void;
  submittingId?: string;
}

const ReservationsList: React.FC<ReservationsListProps> = ({
  reservations,
  onCancel,
  submittingId,
}) => {
  return (
    <section className="grid grid-cols-1 gap-8">
      {reservations.map((reservation) => (
        <ReservationCard
          key={reservation.id}
          reservation={reservation}
          onCancel={onCancel}
          submitting={submittingId === reservation.id}
        />
      ))}
    </section>
  );
};

export default ReservationsList;
