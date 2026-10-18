import React from "react";
import Icon from "@/components/shared/atoms/Icon";
import Link from "next/link";

const ReservationsHelp: React.FC = () => {
  return (
    <section className="mt-16 p-8 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
      <Icon
        name="help_outline"
        className="text-4xl text-slate-300 mb-4"
      />
      <h4 className="text-lg font-bold text-slate-900 mb-2">
        ¿Necesitas ayuda con tus reservas?
      </h4>
      <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
        Nuestro equipo de expedición está disponible para ayudarte a modificar
        fechas o resolver dudas sobre tu próximo viaje.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          href="/centro-de-ayuda"
          title="Chatear con soporte"
        >
          <Icon name="chat" className="text-base" />
          Chatear con soporte
        </Link>
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          href="/terminos-del-servicio"
          title="Términos de cancelación"
        >
          <Icon name="description" className="text-base" />
          Términos de cancelación
        </Link>
      </div>
    </section>
  );
};

export default ReservationsHelp;
