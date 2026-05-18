import React from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/shared/atoms/Icon";
import { type Reservation } from "@/types/reservations";

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (reservationId: string) => void;
  submitting?: boolean;
}

const statusStyles = {
  confirmada: {
    badge: "bg-primary text-white",
    icon: "bg-primary/10 text-primary",
    card: "bg-white",
    total: "text-primary",
    primaryButton:
      "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95",
    secondaryButton:
      "border-2 border-slate-200 text-slate-500 hover:bg-slate-100",
  },
  pendiente: {
    badge: "bg-rose-100 text-rose-700",
    icon: "bg-rose-100 text-rose-600",
    card: "bg-white",
    total: "text-slate-900",
    primaryButton: "bg-slate-900 text-white hover:scale-[1.02] active:scale-95",
    secondaryButton:
      "border-2 border-slate-200 text-slate-500 hover:bg-slate-100",
  },
  completada: {
    badge: "bg-slate-700 text-white",
    icon: "bg-slate-100 text-slate-500",
    card: "bg-white/70 opacity-80 border-slate-200/70 grayscale-[0.2]",
    total: "text-slate-500",
    primaryButton: "border-2 border-primary text-primary hover:bg-primary/10",
    secondaryButton: "border-2 border-slate-200",
  },
  cancelada: {
    badge: "bg-slate-200 text-slate-700",
    icon: "bg-slate-100 text-slate-500",
    card: "bg-white/80 border-slate-200",
    total: "text-slate-700",
    primaryButton:
      "border-2 border-slate-400 text-slate-700 hover:bg-slate-100",
    secondaryButton: "border-2 border-slate-200 text-slate-400",
  },
} as const;

const toneStyles = {
  primary: "bg-primary/10 text-primary",
  tertiary: "bg-rose-100 text-rose-600",
  secondary: "bg-slate-100 text-slate-500",
} as const;

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onCancel,
  submitting = false,
}) => {
  const styles = statusStyles[reservation.status];

  return (
    <article
      className={`rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-primary/5 flex flex-col md:flex-row ${styles.card}`}
    >
      <div className="md:w-72 h-48 md:h-auto relative overflow-hidden">
        <Image
          src={reservation.image}
          alt={reservation.imageAlt}
          title={reservation.imageAlt}
          fill
          sizes="(min-width: 768px) 288px, 100vw"
          className="object-cover cursor-crosshair"
        />
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 ${styles.badge} text-[10px] font-bold uppercase tracking-wider rounded-full`}
          >
            {reservation.statusLabel}
          </span>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
              {reservation.title}
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">
              ID: {reservation.id}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-6">
            {reservation.details.map((detail) => (
              <div key={detail.label} className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${toneStyles[detail.tone]}`}
                >
                  <Icon name={detail.icon} className="text-lg" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {detail.label}
                  </p>
                  {detail.rating ? (
                    <div className="flex items-center text-primary">
                      {Array.from({ length: detail.rating }).map((_, index) => (
                        <Icon
                          key={`${reservation.id}-star-${index}`}
                          name="star"
                          className="text-sm"
                          fill
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-slate-900">
                      {detail.value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {reservation.totalLabel}
            </p>
            <p className={`text-2xl font-black ${styles.total}`}>
              {reservation.totalAmount}
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {reservation.primaryAction.href ? (
              <Link
                href={reservation.primaryAction.href}
                className={`flex min-h-12 flex-1 items-center justify-center rounded-full px-6 py-3 text-center text-sm font-bold transition-all cursor-pointer sm:flex-none ${styles.primaryButton}`}
                title={reservation.primaryAction.title}
              >
                {reservation.primaryAction.label}
              </Link>
            ) : (
              <button
                type="button"
                className={`flex min-h-12 flex-1 items-center justify-center rounded-full px-6 py-3 text-sm font-bold transition-all cursor-pointer sm:flex-none ${styles.primaryButton}`}
                title={reservation.primaryAction.title}
              >
                {reservation.primaryAction.label}
              </button>
            )}
            {reservation.secondaryAction ? (
              <button
                type="button"
                onClick={() => onCancel?.(reservation.id)}
                disabled={submitting}
                className={`px-3 pb-2 pt-2.5 rounded-full transition-colors cursor-pointer ${styles.secondaryButton}`}
                title={reservation.secondaryAction.title}
              >
                {submitting ? (
                  <span className="text-xs font-bold">...</span>
                ) : (
                  <Icon name={reservation.secondaryAction.icon} />
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ReservationCard;
