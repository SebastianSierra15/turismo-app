import React from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/shared/atoms/Icon";
import { type ProfileBooking } from "@/types/profile";

interface ProfileBookingCardProps {
  booking: ProfileBooking;
}

const statusStyles: Record<ProfileBooking["status"], string> = {
  Confirmado: "bg-green-100 text-green-700",
  "Pendiente de pago": "bg-amber-100 text-amber-700",
};

const ProfileBookingCard: React.FC<ProfileBookingCardProps> = ({ booking }) => {
  const detailsHref = booking.href ?? `/perfil/reservas/${booking.id}`;
  return (
    <div className="bg-white border border-primary/10 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative w-full sm:w-32 h-24 rounded-lg overflow-hidden shrink-0">
        <Image
          src={booking.image}
          alt={`Imagen de ${booking.title}`}
          title={`Imagen de ${booking.title}`}
          fill
          sizes="(min-width: 640px) 128px, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex-1 w-full">
        <div className="flex justify-between items-start mb-1 gap-3">
          <h3 className="font-bold text-lg text-slate-900">{booking.title}</h3>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyles[booking.status]}`}
          >
            {booking.status}
          </span>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Icon name="calendar_today" className="text-sm" />
            {booking.dateRange}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="group" className="text-sm" />
            {booking.people}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={detailsHref}
            className="bg-primary text-white text-xs font-bold py-2 px-4 rounded-full hover:bg-primary/90 transition-colors cursor-pointer w-40 shrink-0"
          >
            {booking.status === "Confirmado" ? "Ver itinerario" : "Completar pago"}
          </Link>
          <Link
            href={detailsHref}
            className="border border-slate-200 text-xs font-bold py-2 px-4 rounded-full hover:bg-slate-50 transition-colors cursor-pointer w-28 shrink-0"
          >
            {booking.status === "Confirmado" ? "Gestionar" : "Detalles"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileBookingCard;
