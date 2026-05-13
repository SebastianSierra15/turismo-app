import React from "react";
import Icon from "@/components/shared/atoms/Icon";
import { type ReservationDetail } from "@/types/reservationDetail";

interface ReservationDetailSidebarProps {
  reservation: ReservationDetail;
}

const ReservationDetailSidebar: React.FC<ReservationDetailSidebarProps> = ({
  reservation,
}) => {
  return (
    <aside className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/5">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 border-b border-slate-100 pb-2">
          Resumen de Pago
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Personas</span>
            <span className="font-bold">{reservation.payment.people}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Método</span>
            <span className="font-bold flex items-center gap-1">
              <Icon name="credit_card" className="text-sm" />
              {reservation.payment.method}
            </span>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between items-end">
              <span className="text-slate-500 text-sm">Total pagado</span>
              <span className="text-2xl font-black text-primary">
                {reservation.payment.total}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/5">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">
          Información del Viajero
        </h3>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary">
            {reservation.traveler.initials}
          </div>
          <div>
            <p className="font-bold text-slate-900">
              {reservation.traveler.name}
            </p>
            <p className="text-xs text-slate-500">
              {reservation.traveler.email}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="support_agent" className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Agencia del Plan
          </h3>
        </div>
        <p className="font-black text-slate-900 text-lg mb-4">
          {reservation.provider.name}
        </p>
        <div className="space-y-3">
          <a
            className="w-full flex items-center justify-center gap-2 bg-white border border-primary/10 py-3 rounded-full text-sm font-bold hover:bg-primary/10 transition-all"
            href={`tel:${reservation.provider.phone}`}
            title="Llamar ahora"
          >
            <Icon name="call" className="text-primary text-lg" />
            Llamar ahora
          </a>
          <a
            className="w-full flex items-center justify-center gap-2 bg-white border border-primary/10 py-3 rounded-full text-sm font-bold hover:bg-primary/10 transition-all"
            href={`mailto:${reservation.provider.email}`}
            title="Enviar correo"
          >
            <Icon name="mail" className="text-primary text-lg" />
            Enviar correo
          </a>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 rounded-xl border border-primary/10">
        <Icon name="verified_user" className="text-primary" fill />
        <p className="text-[10px] font-bold uppercase tracking-tighter leading-tight text-slate-700">
          {reservation.trustNote}
        </p>
      </div>
    </aside>
  );
};

export default ReservationDetailSidebar;
