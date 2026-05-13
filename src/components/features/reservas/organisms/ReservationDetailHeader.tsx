import React from "react";
import Link from "next/link";
import Icon from "@/components/shared/atoms/Icon";
import { type ReservationDetail } from "@/types/reservationDetail";

interface ReservationDetailHeaderProps {
  reservation: ReservationDetail;
  onCancelClick?: () => void;
}

const ReservationDetailHeader: React.FC<ReservationDetailHeaderProps> = ({
  reservation,
  onCancelClick,
}) => {
  return (
    <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-2">
        <Link
          href="/perfil/reservas"
          className="group flex items-center gap-2 text-primary font-semibold text-sm"
          title="Volver a Mis Reservas"
        >
          <Icon
            name="arrow_back"
            className="text-sm transition-transform duration-300 group-hover:-translate-x-1"
          />
          Volver a Mis Reservas
        </Link>
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {reservation.id}
          </h1>
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full border border-primary/20">
            {reservation.statusLabel}
          </span>
        </div>
        <p className="text-slate-500 text-sm">{reservation.createdAt}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onCancelClick}
          className="px-6 py-3 border-2 border-primary text-primary rounded-full font-bold text-sm hover:bg-primary/10 transition-all cursor-pointer"
          title="Cancelar reserva"
        >
          Cancelar Reserva
        </button>
        <button
          type="button"
          className="px-6 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          title="Descargar comprobante"
        >
          <Icon name="download" />
          Descargar Comprobante
        </button>
      </div>
    </header>
  );
};

export default ReservationDetailHeader;
