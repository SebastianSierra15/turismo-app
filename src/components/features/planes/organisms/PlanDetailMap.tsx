"use client";

import React from "react";
import Icon from "@/components/shared/atoms/Icon";
import Button from "@/components/shared/atoms/Button";
import PlanDetailMapClient from "@/components/features/planes/organisms/PlanDetailMapClient";
import { type PlanDestination } from "@/types/planDetail";

interface PlanDetailMapProps {
  destination?: PlanDestination;
}

const DEFAULT_POSITION: [number, number] = [1.6144, -75.6117];

const PlanDetailMap: React.FC<PlanDetailMapProps> = ({ destination }) => {
  const hasCoords =
    destination?.latitude !== undefined && destination?.longitude !== undefined;
  const position: [number, number] = hasCoords
    ? [destination!.latitude!, destination!.longitude!]
    : DEFAULT_POSITION;
  const label = destination?.name ?? "Destino en Caquetá";
  const municipality = destination?.municipality ?? "Caquetá, Colombia";
  const coordsLabel = hasCoords
    ? `${destination!.latitude!.toFixed(4)}°, ${destination!.longitude!.toFixed(4)}°`
    : "Coordenadas por definir";
  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${destination!.latitude},${destination!.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${label}, ${municipality}`)}`;

  const handleDirections = () => {
    if (typeof window === "undefined") return;
    window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <Icon name="location_on" className="text-primary" />
        Ubicación del destino
      </h2>
      <div className="relative z-0 w-full h-100 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
        <PlanDetailMapClient position={position} label={`${label} · ${municipality}`} />
        <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 bg-white p-6 rounded-2xl shadow-2xl border border-primary/20 backdrop-blur-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-primary/10 px-2 py-1 rounded-full text-primary">
              <Icon name="explore" className="mt-1" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">{label}</h4>
              <p className="text-sm text-slate-500">{municipality}</p>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {coordsLabel}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            className="w-full normal-case tracking-normal text-sm py-3 cursor-pointer"
            onClick={handleDirections}
          >
            <Icon name="directions" className="text-lg" />
            Cómo llegar
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PlanDetailMap;
