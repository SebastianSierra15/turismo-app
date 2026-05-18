"use client";

import React from "react";
import Icon from "@/components/shared/atoms/Icon";
import Button from "@/components/shared/atoms/Button";
import SiteDetailMapClient from "@/components/features/sitios/organisms/SiteDetailMapClient";
import { type SiteDetail } from "@/types/siteDetail";

interface SiteDetailSidebarProps {
  site: SiteDetail;
}

const SiteDetailSidebar: React.FC<SiteDetailSidebarProps> = ({ site }) => {
  const handleRequestInformation = () => {
    const draft = `Hola, quiero más información sobre ${site.name}. ¿Qué planes lo incluyen, disponibilidad, precios y recomendaciones para visitarlo?`;
    window.dispatchEvent(
      new CustomEvent("amaturis:chat-prefill", {
        detail: { draft },
      }),
    );
  };

  return (
    <aside className="lg:col-span-4 space-y-12">
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-slate-100 border border-slate-200 p-6 rounded-2xl flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
            <Icon name="groups" className="font-fill" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              Carga diaria
            </p>
            <p className="text-lg font-bold text-slate-900">
              {site.capacityPerDay}
            </p>
          </div>
        </div>
        <div className="bg-slate-100 border border-slate-200 p-6 rounded-2xl flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Icon name="explore" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              Latitud
            </p>
            <p className="text-lg font-bold text-slate-900">
              {site.mapLat.toFixed(4)}° N
            </p>
          </div>
        </div>
        <div className="bg-slate-100 border border-slate-200 p-6 rounded-2xl flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Icon name="map" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              Longitud
            </p>
            <p className="text-lg font-bold text-slate-900">
              {site.mapLng.toFixed(4)}° W
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden border border-slate-200 h-100 relative">
        <SiteDetailMapClient lat={site.mapLat} lng={site.mapLng} />
        <button
          type="button"
          className="absolute bottom-4 right-4 bg-white text-slate-900 px-4 py-2 rounded-full shadow-lg text-sm font-bold flex items-center gap-2 cursor-pointer"
          title="Abrir en Google Maps"
        >
          <Icon name="open_in_new" className="text-sm" />
          Abrir en Google Maps
        </button>
      </div>

      <div className="p-8 rounded-3xl bg-primary space-y-6 shadow-xl shadow-primary/20">
        <h3 className="text-2xl font-bold text-white">¿Listo para el viaje?</h3>
        <p className="opacity-90 text-white">
          Este destino requiere reserva previa y guía certificado para
          garantizar la seguridad y conservación.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={handleRequestInformation}
          className="w-full cursor-pointer bg-white border-white text-primary hover:bg-primary/10 hover:text-white hover:border-white"
        >
          Solicitar información
        </Button>
      </div>
    </aside>
  );
};

export default SiteDetailSidebar;
