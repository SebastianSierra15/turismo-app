"use client";

import React from "react";
import Image from "next/image";
import Icon from "@/components/shared/atoms/Icon";
import Button from "@/components/shared/atoms/Button";
import PlanDetailGallery from "@/components/features/planes/organisms/PlanDetailGallery";
import PlanDetailMap from "@/components/features/planes/organisms/PlanDetailMap";
import { type PlanDetail } from "@/types/planDetail";
import { extractSiteSlug } from "@/utils/siteId";
import { useRouter } from "next/navigation";

const activityImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDF1k7JWAqcHrIZ7csMXOGesAGH_1paEuMxkdWsd7Ff97IAhWVLRR0KLwgZuZ007hw7VIf0bev40daaemE7kcN7TgHg8PyRWctewsQ-xM1ihFsBkk00q7acwvXwlYUTn3mwf1MaTyf-Qobvyv5qOKQ_Encvp6rRjYE619TMtjnZtPl1jpFgDzIVBueDrk3LGo_c7Ki0LmaEjftZWgI2GDi728PgtQYkwbBvZFtDk_0zKeAWPcbuRu-3d0HQe_5zeNHa3jLPF3-lCEM",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAPb_-TnOqpiS-vqLCTsh1I_J5GINzSmlwiRrrlCIzgLN4aSF8IMaqEN43mppG3fGIpic-i2Jjk9T0xos7mZaM-nVZKbnEUFC389uuA5H4XXvHUxtwoRRClgSe6zuBBOzvNV1-4yFyQSlwd3ojXHqWPaUEwMCLqVSHKY6rcR1TvhnPnNBbhxrwuL6YEEe1G7RyNDwqI1dfq7-ZggXUbgO_wDA3Dhkrhj78LjQLEHDpPbdh4oIWMynjhtgdj5iyxQV3tVuNQ4qSojbc",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCQp5IDmqzkmHP9nyOV2-JlUP2SgfJTQav_iaaL5yQCqHBU5KrbB03D7CjY0zxGa12SGpJds7_f9KrRUr7cfv8dy-PLENvoEsv5OGhijr0Tutczb5YFFUlkaYyDQ9AY14NPClwkX5ZOL0ARIQxs5oNB7TFtJ2i82eyoKPx9H75VUAKXRu2pacFLQ1-8XBoPIhK8AuZRZdZdewiXgLrtINiO_Jx9XVlkrVm_npJ4ZIb3BhEEOmLbdC2fqhWp8sMlaen3Yv0Or4VruaM",
];

const defaultGallery = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCc9Xjje60wPicJSB0CVXvMGncHybiwofUUy2omxgKSZsjRYGUhD8nA3opGV_IURO9dlzo1xC_p8SKtc8qO74fasdXCvceZq8_-8_2dj17Jg-QigH3JXUjK9Q2nB6qfhHog2FKWwk2AnuUkHiC66SD6fnJlZXCkAPsiVcvlXm04301gJk2ls_p5tQCegI0RnsUUlQCWXURZpjUtPu2TIBMsnLpOwXUmwFGfjto414LsZOQhu8vPd-tYOXFCR2QYiTcFrHoz1SJbPIg",
    alt: "Hojas verdes con gotas de agua en la selva",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBW4chgUeMYmf2cSmk1HUPvXDvkB1jiI3yc6kNo_CLoQlBEdB7J7PyjwKOq1O-yq5tJ0r-8ua3HyKvm0uO2TfjyLnzaSFl-ooxmJZbrH9ErqphrOG71ZyFWAVEp_MQjx7eKs8UMcJX8RzycG3uXCPfC4g2qtxLn4vSbLwYDQH-_iE3l2QYgRcQZ3_-9J4Cz4ah-I-GiQK9MFaH2W5SukiIdJ1krXPz3eIZu7dpnH71yYD8fGo4aWSSAJI88wS7roCSIKYmA_DAy2t8",
    alt: "Montañas con neblina en el piedemonte",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD_poxvqlw-_MkMmnPJXvFuHPwgHnIeXHRMxJ3GZ3KdtP5ZkMcdRdqLMrgw48vdRGgGzubmXnDSy4fotV3wnMaQeTydnGXtb4EOjN0xr46B4FE3S-YS-WiHk4tByM25Vf_WwZadyAqcCavTNhZjNjdbdocOZhuUoibtZsOwV2I9uMKW7PxMfzUCMMvf_usr3eCkdJh7S7FLgH90acjTb3aSFVlOf7U4RXY7OEJZwOd77UQifK34YPdq0yGp347DMe9sRsEWewc1S_U",
    alt: "Copa de árboles vista desde abajo",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA0atq_krnwuVaMzv_6Nw3g3WYRn5Bx3ufxPBwbKvWj8MIRpMvObdocQHKeKsEZRTlvWW_zc7OF5yJSgDRFMm4k3bv8Eq0eAeUVL0etGIGSzh6SdZ1OtMP6Ta7Vp3qj6coPbY7GSVo7TmQjNUjEj_liszIAV-h3cgNqnFxcbDbPRYTMyIWQ7cLKBDnlazqPclC2X4UAH-Abr7YNCMyWgzxjX-KKo2OVzR48gfnrW8C_95Wck_zw_ioRdm2NH-BGskBlaPuxNCU52IY",
    alt: "Bosque con rayos de sol entre los árboles",
  },
];

const formatDuration = (days?: number | null) => {
  if (!days || days <= 0) return "Sin duración";
  return days === 1 ? "1 Día" : `${days} Días`;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

interface PlanDetailContentProps {
  plan: PlanDetail;
}

const PlanDetailContent: React.FC<PlanDetailContentProps> = ({ plan }) => {
  const router = useRouter();
  const summaryItems = [
    {
      label: "Dificultad",
      value: plan.difficulty ?? "No definida",
      icon: "trending_up",
    },
    {
      label: "Tamaño del grupo",
      value: plan.capacityMax ? `Máx. ${plan.capacityMax}` : "Sin límite",
      icon: "group",
    },
    {
      label: "Duración",
      value: formatDuration(plan.durationDays ?? undefined),
      icon: "schedule",
    },
  ];

  const activityNames = (plan.activities ?? []).filter(Boolean);
  const activityCards = activityNames.slice(0, 3).map((title, index) => ({
    title,
    image: activityImages[index % activityImages.length],
    alt: title,
  }));

  const includesFromServices = activityNames;
  const includesFromText =
    plan.includes && plan.includes.length ? plan.includes : [];
  const includesMerged = Array.from(
    new Set([...includesFromServices, ...includesFromText]),
  );
  const includes = includesMerged.length
    ? includesMerged
    : ["Sin información disponible"];
  const excludes =
    plan.excludes && plan.excludes.length
      ? plan.excludes
      : ["Sin información disponible"];

  const itineraryItems = (plan.itinerary ?? []).filter(
    (item) => Boolean(item?.title) || Boolean(item?.description),
  );
  const destinationNames = (plan.destinations ?? [])
    .map((dest) => dest.name)
    .filter(Boolean);

  const primaryDestination = plan.destinations?.[0];
  const planGallery = plan.galleryImages ?? [];
  const destinationGallery = Array.from(
    new Map(
      (plan.destinations ?? [])
        .filter((dest) => Boolean(dest.image))
        .map((dest) => [
          dest.id ?? dest.name,
          {
            image: dest.image!,
            alt: dest.name,
            label: dest.name,
            href: dest.id ? `/sitios/${extractSiteSlug(dest.id)}` : undefined,
          },
        ]),
    ).values(),
  );

  const galleryImages =
    destinationGallery.length > 0
      ? destinationGallery
      : planGallery.length > 0
        ? planGallery.map((image, index) => ({
            image,
            alt: index === 0 ? plan.title : `${plan.title} ${index + 1}`,
            label: index === 0 ? plan.title : `Imagen ${index + 1}`,
          }))
        : destinationNames.length > 0
          ? destinationNames.map((name, index) => ({
              image: defaultGallery[index % defaultGallery.length].image,
              alt: name,
              label: name,
            }))
          : defaultGallery;

  const rawMaxTravelers =
    plan.capacityMax && plan.capacityMax > 0 ? plan.capacityMax : 10;
  const maxTravelers = Math.max(rawMaxTravelers, 1);
  const [selectedTravelers, setSelectedTravelers] = React.useState<number | "">(
    "",
  );
  const [selectedDate, setSelectedDate] = React.useState("");

  const priceValue = plan.priceValue ?? 0;
  const travelersCount =
    typeof selectedTravelers === "number" ? selectedTravelers : 0;
  const subtotal = priceValue * travelersCount;
  const serviceFee = Math.round(subtotal * 0.07);
  const total = subtotal + serviceFee;
  const travelerOptions = Array.from({ length: maxTravelers }, (_, i) => i + 1);
  const canReserve =
    Boolean(selectedDate) && typeof selectedTravelers === "number";

  const handleReserve = () => {
    if (!canReserve) return;
    const packageId = encodeURIComponent(plan.slug || plan.id);
    const date = encodeURIComponent(selectedDate);
    const travelers = encodeURIComponent(String(selectedTravelers));
    router.push(
      `/pasarela_pagos?paquete_id=${packageId}&fecha_viaje=${date}&cantidad_personas=${travelers}`,
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-12">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Icon name="info" className="text-primary" />
            Resumen de la experiencia
          </h2>
          <p className="text-slate-600 leading-relaxed">{plan.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
            {summaryItems.map((item) => (
              <div
                key={item.label}
                className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex flex-col items-center text-center"
              >
                <Icon name={item.icon} className="text-primary mb-2" />
                <span className="text-xs text-slate-500 uppercase font-bold">
                  {item.label}
                </span>
                <span className="font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Icon name="route" className="text-primary" />
            Itinerario detallado
          </h2>
          {itineraryItems.length ? (
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {itineraryItems.map((item, index) => {
                const isOddStep = index % 2 === 0;

                const card = (
                  <div className="p-6 rounded-xl bg-white shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between space-x-2 mb-2">
                      <div className="font-bold text-primary">
                        Día {item.stepNumber}: {item.title}
                      </div>
                      <time className="text-xs font-bold text-slate-500 uppercase">
                        {item.location ??
                          destinationNames[
                            index % Math.max(destinationNames.length, 1)
                          ] ??
                          "Caquetá"}
                      </time>
                    </div>
                    <div className="text-slate-600 text-sm leading-relaxed">
                      {item.description}
                    </div>
                  </div>
                );

                return (
                  <div key={item.id ?? `step-${item.stepNumber}-${index}`}>
                    <div className="flex items-center gap-6 md:hidden">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-primary text-white shadow shrink-0">
                        <span className="text-sm font-bold">
                          {String(item.stepNumber).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="w-[calc(100%-4rem)]">{card}</div>
                    </div>

                    <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-6">
                      {isOddStep ? <div /> : <div className="justify-self-end w-[92%]">{card}</div>}

                      <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border border-white bg-primary text-white shadow shrink-0">
                        <span className="text-sm font-bold">
                          {String(item.stepNumber).padStart(2, "0")}
                        </span>
                      </div>

                      {isOddStep ? <div className="justify-self-start w-[92%]">{card}</div> : <div />}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Aún no hay itinerario registrado para este plan.
            </p>
          )}
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Icon name="kayaking" className="text-primary" />
            Actividades destacadas
          </h2>
          {activityCards.length ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activityCards.map((activity) => (
                <div
                  key={activity.title}
                  className="group relative overflow-hidden rounded-xl h-48 cursor-crosshair"
                >
                  <Image
                    src={activity.image}
                    alt={activity.alt}
                    title={activity.alt}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110 cursor-crosshair"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4">
                    <span className="text-white font-bold text-lg">
                      {activity.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Aún no hay actividades registradas para este plan.
            </p>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Icon name="check_circle" className="text-primary" />
              Incluye
            </h3>
            <ul className="space-y-3 text-slate-600 text-sm">
              {includes.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Icon name="check" className="text-sm text-primary mt-0.5" />
                  <span className="leading-5">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700">
              <Icon name="cancel" className="text-slate-400" />
              No incluye
            </h3>
            <ul className="space-y-3 text-slate-500 text-sm">
              {excludes.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Icon name="close" className="text-sm mt-0.5" />
                  <span className="leading-5">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <PlanDetailGallery images={galleryImages} />
        <PlanDetailMap destination={primaryDestination} />
      </div>

      <aside className="lg:col-span-1">
        <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-primary p-6 text-white">
            <p className="text-sm font-medium uppercase opacity-80">Desde</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black">
                {formatCurrency(priceValue)}
              </span>
              <span className="text-sm">/ por persona</span>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Agencia operadora
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Icon name="storefront" className="text-primary text-base" />
                {plan.agencyName ?? "Agencia por asignar"}
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Seleccionar fecha
                </label>
                <div className="relative">
                  <Icon
                    name="calendar_today"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                  />
                  <input
                    className="w-full pl-10 pr-4 py-3 rounded-full border border-slate-200 bg-slate-50 text-slate-700 focus:ring-primary focus:border-primary"
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Viajeros
                </label>
                <div className="relative">
                  <Icon
                    name="groups"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                  />
                  <select
                    className="w-full pl-10 pr-4 py-3 rounded-full border border-slate-200 bg-slate-50 text-slate-700 focus:ring-primary focus:border-primary"
                    value={selectedTravelers}
                    onChange={(event) =>
                      setSelectedTravelers(
                        event.target.value ? Number(event.target.value) : "",
                      )
                    }
                  >
                    <option value="">Selecciona viajeros</option>
                    {travelerOptions.map((option) => (
                      <option key={option} value={option}>
                        {option} {option === 1 ? "Adulto" : "Adultos"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 space-y-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>
                  {travelersCount} {travelersCount === 1 ? "Adulto" : "Adultos"}{" "}
                  x {formatCurrency(priceValue)}
                </span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tarifa de servicio</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(serviceFee)}
                </span>
              </div>
              <div className="flex justify-between text-lg pt-2 border-t border-dashed border-slate-200">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-black text-primary">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
            <Button
              variant="primary"
              className="w-full normal-case tracking-normal py-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canReserve}
              onClick={handleReserve}
            >
              <Icon name="bolt" />
              Reservar ahora
            </Button>
            <p className="text-[10px] text-center text-slate-400 uppercase tracking-tighter">
              Confirmación inmediata · Sin costos ocultos
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default PlanDetailContent;
