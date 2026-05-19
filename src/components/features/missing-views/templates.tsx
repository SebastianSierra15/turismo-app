"use client";

/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/shared/organisms/Navbar";
import Footer from "@/components/shared/organisms/Footer";
import Button from "@/components/shared/atoms/Button";
import Icon from "@/components/shared/atoms/Icon";
import { BlobUploadTool } from "@/components/features/blob/BlobUploadTool";
import { useAuth } from "@/context/AuthContext";

const images = {
  canopy:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA0UPRIK34MWuSL2aAqJZiNgxAhsgM_zMUOXIvLtn7hjRjJdCSXbXgXpgCziDq-GRMfE7q931eYD5Lr6DK_crCz9aK2ZdUagF_io6l059nh5QjaVuIBaVgPMfBQqeJUsXQ_q2sLugbMYuKh5rFqjbI3ikWY4kcQiT6YXbMqIgldE5tILGhq9PgeD1lR8wp8LdIWGK6yua96sQoodXAypTbfUsyj5DE_mJj8I49tOKfw-Pr7jzkrVQ8RDQHfNaWzoUfJZYdRK7WUnLSe",
  canyon:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB9ru9_yS0MmcNJF6jEIhnYe-TmLDR1Tzv3pQ9OeXMJpmX4G7IU2V9Kq_i5IBrNtKQq_OBbxLVs5i1Plydf_l5MSXXvA_P8x5gE76qD-DvaxvqKUr0FeAWIRXcVk0toQThp04eqAF6EMGAdFXCNNdsDTrR_fsg5nPWebLdQX2AkXDu0PKXrfKCy4j_7arUXS4G5Im_Qkl4zlu93-DmHhZ-Ga6Gft2jAOx5T2Vcs4zW_QZe1Ll14meafcNOc_4QneXl6yjc0nnTBstB-",
  river:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAQtZwTN5G4va_DIQq4u4v78mZIs6leQrGXSWOHvY9b86NUkwLEpGzpyCVywh30u81WWVU8VFFpU2GGYWjsxf0xmgR9YGGpfSnbj_RH412VSloEWcWKfvo3iaxmiYbjtQ490bXtccMBbVD-kqCZVs4bUFfWMDZI48tWVCCZH5wjs1CnzUPITYYwEi_C6E12QA1eUAl7c8al0bDeIUJve8LLb7uZpJIZp9S1S6hyXvyE9MYVMGXCmaMe8N6ZHVHVw5V9iLfut7RtoFE7",
  waterfall:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA0atq_krnwuVaMzv_6Nw3g3WYRn5Bx3ufxPBwbKvWj8MIRpMvObdocQHKeKsEZRTlvWW_zc7OF5yJSgDRFMm4k3bv8Eq0eAeUVL0etGIGSzh6SdZ1OtMP6Ta7Vp3qj6coPbY7GSVo7TmQjNUjEj_liszIAV-h3cgNqnFxcbDbPRYTMyIWQ7cLKBDnlazqPclC2X4UAH-Abr7YNCMyWgzxjX-KKo2OVzR48gfnrW8C_95Wck_zw_ioRdm2NH-BGskBlaPuxNCU52IY",
  hills:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBW4chgUeMYmf2cSmk1HUPvXDvkB1jiI3yc6kNo_CLoQlBEdB7J7PyjwKOq1O-yq5tJ0r-8ua3HyKvm0uO2TfjyLnzaSFl-ooxmJZbrH9ErqphrOG71ZyFWAVEp_MQjx7eKs8UMcJX8RzycG3uXCPfC4g2qtxLn4vSbLwYDQH-_iE3l2QYgRcQZ3_-9J4Cz4ah-I-GiQK9MFaH2W5SukiIdJ1krXPz3eIZu7dpnH71yYD8fGo4aWSSAJI88wS7roCSIKYmA_DAy2t8",
};

const municipalities = [
  "Florencia",
  "Albania",
  "Belen de los Andaquies",
  "Cartagena del Chaira",
  "Curillo",
  "El Doncello",
  "El Paujil",
  "La Montanita",
  "Milan",
  "Morelia",
  "Puerto Rico",
  "San Jose del Fragua",
  "San Vicente del Caguan",
  "Solano",
  "Solita",
  "Valparaiso",
];

type FieldProps = {
  label: string;
  placeholder?: string;
  type?: string;
  options?: string[];
  textarea?: boolean;
};

const Field = ({
  label,
  placeholder,
  type = "text",
  options,
  textarea,
}: FieldProps) => (
  <label className="block space-y-2">
    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
      {label}
    </span>
    {options ? (
      <select className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-primary">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    ) : textarea ? (
      <textarea
        className="min-h-28 w-full resize-none rounded-xl border-0 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-primary"
        placeholder={placeholder}
      />
    ) : (
      <input
        className="w-full rounded-xl border-0 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-primary"
        placeholder={placeholder}
        type={type}
      />
    )}
  </label>
);

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-slate-900">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const StatusBadge = ({
  tone = "green",
  children,
}: {
  tone?: "green" | "amber" | "red" | "slate" | "blue";
  children: React.ReactNode;
}) => {
  const tones = {
    green: "bg-primary/10 text-primary",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    slate: "bg-slate-100 text-slate-600",
    blue: "bg-sky-100 text-sky-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

const SummaryRow = ({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) => (
  <div
    className={`flex items-center justify-between gap-4 ${
      strong ? "text-base font-black text-slate-950" : "text-sm text-slate-500"
    }`}
  >
    <span>{label}</span>
    <span className={strong ? "text-primary" : "font-bold text-slate-800"}>
      {value}
    </span>
  </div>
);

const InfoCard = ({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon name={icon} />
      </span>
      <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
    </div>
    {children}
  </section>
);

export const AllyRegistrationTemplate = () => (
  <div className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-2">
    <section className="flex items-center justify-center px-5 py-12 sm:px-8 lg:px-16">
      <div className="w-full max-w-xl">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-3 text-primary"
          title="Volver a Amaturis"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <Icon name="forest" />
          </span>
          <span className="text-xl font-black">Amaturis</span>
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Unete como aliado
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Impulsemos juntos el turismo sostenible en el corazon del Caqueta.
        </p>

        <form className="mt-8 space-y-5">
          <Field
            label="Tipo de cuenta"
            options={[
              "Agencia de viajes",
              "Prestador de servicio",
              "Comunidad local",
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre comercial" placeholder="Selva Expeditions" />
            <Field label="Responsable" placeholder="Nombre completo" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Correo electronico"
              placeholder="contacto@amaturis.test"
              type="email"
            />
            <Field label="Telefono" placeholder="+57 300 000 0000" type="tel" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Municipio" options={municipalities} />
            <Field label="RNT opcional" placeholder="Numero de registro" />
          </div>
          <Field
            label="Breve descripcion"
            placeholder="Cuentanos sobre tus servicios, comunidad, rutas o experiencia local."
            textarea
          />
          <label className="flex items-start gap-3 text-sm text-slate-600">
            <input
              className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              type="checkbox"
            />
            <span>
              Acepto la revision de la solicitud y las politicas para aliados de
              Amaturis.
            </span>
          </label>
          <Button className="w-full rounded-xl py-4 normal-case tracking-normal">
            Solicitar registro
          </Button>
          <p className="text-center text-sm text-slate-500">
            Ya eres aliado?{" "}
            <Link href="/login" className="font-bold text-primary">
              Inicia sesion
            </Link>
          </p>
        </form>
      </div>
    </section>

    <section className="relative hidden overflow-hidden bg-slate-950 lg:block">
      <img
        src={images.canopy}
        alt="Dosel amazonico del Caqueta"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-slate-950/40 to-slate-950/90" />
      <div className="relative z-10 flex h-full flex-col justify-between p-16 text-white">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
            Red de aliados
          </p>
          <h2 className="mt-5 max-w-xl text-4xl font-black leading-tight">
            Herramientas digitales para operar turismo responsable.
          </h2>
          <div className="mt-12 space-y-7">
            {[
              [
                "visibility",
                "Visibilidad global",
                "Conecta con viajeros que buscan experiencias autenticas en el Caqueta.",
              ],
              [
                "monitoring",
                "Gestion simplificada",
                "Administra reservas, disponibilidad, pagos y servicios desde un panel claro.",
              ],
              [
                "eco",
                "Impacto positivo",
                "Fortalece comunidades locales y promueve conservacion del territorio.",
              ],
            ].map(([icon, title, text]) => (
              <div key={title} className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-primary backdrop-blur">
                  <Icon name={icon} />
                </span>
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 max-w-md text-sm leading-6 text-white/70">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8 text-center">
          {["Solicitud", "Revision", "Activacion"].map((step, index) => (
            <div key={step}>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Paso {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 text-sm font-bold">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export const BookingCheckoutTemplate = ({
  packageId,
}: {
  packageId?: string;
}) => (
  <PublicLayout>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/planes"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary"
        >
          <Icon name="arrow_back" className="text-base" />
          Volver a planes
        </Link>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Finalizar reserva
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Completa los datos para asegurar tu cupo. La disponibilidad se
          confirma antes de continuar al pago.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <InfoCard icon="calendar_today" title="Detalles de la expedicion">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Fecha de viaje" type="date" />
              <Field label="Numero de viajeros" type="number" placeholder="2" />
            </div>
          </InfoCard>
          <InfoCard icon="person" title="Viajero principal">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Nombre completo" placeholder="Juan Perez" />
              </div>
              <Field label="Identificacion" placeholder="CC / Pasaporte" />
              <Field label="Telefono" placeholder="+57 300 000 0000" />
              <div className="sm:col-span-2">
                <Field
                  label="Correo electronico"
                  placeholder="viajero@email.com"
                  type="email"
                />
              </div>
            </div>
          </InfoCard>
          <InfoCard icon="edit_note" title="Informacion adicional">
            <Field
              label="Notas especiales"
              placeholder="Alergias, restricciones alimentarias, condiciones medicas o solicitudes relevantes."
              textarea
            />
          </InfoCard>
          <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            {[
              "Acepto los terminos, condiciones y politica de privacidad.",
              "Entiendo los riesgos propios de actividades de naturaleza y confirmo que mi estado de salud es apto.",
            ].map((text) => (
              <label
                key={text}
                className="flex items-start gap-3 text-sm leading-6 text-slate-600"
              >
                <input
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  type="checkbox"
                />
                <span>{text}</span>
              </label>
            ))}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
            <div className="relative h-48">
              <img
                src={images.canyon}
                alt="Canon de las Dalias"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <StatusBadge tone="amber">Ultimos 4 cupos</StatusBadge>
                <h2 className="mt-3 text-xl font-black">
                  Expedicion al Canon de las Dalias
                </h2>
              </div>
            </div>
            <div className="space-y-5 p-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <Icon name="schedule" className="text-primary" />
                  <p className="mt-1 font-bold">12 horas</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <Icon name="trending_up" className="text-primary" />
                  <p className="mt-1 font-bold">Intermedio</p>
                </div>
              </div>
              <div className="space-y-3 border-t border-slate-100 pt-5">
                <SummaryRow
                  label="Paquete"
                  value={packageId ?? "canon-dalias"}
                />
                <SummaryRow label="Precio por persona" value="$245.000" />
                <SummaryRow label="2 viajeros" value="$490.000" />
                <SummaryRow label="Tarifa de servicio" value="$34.300" />
                <SummaryRow label="Total" value="$524.300" strong />
              </div>
              <Link href="/pasarela_pagos" className="block">
                <Button className="w-full rounded-xl py-4 normal-case tracking-normal">
                  Continuar al pago
                </Button>
              </Link>
              <p className="text-center text-xs leading-5 text-slate-400">
                Tu cupo queda bloqueado temporalmente durante el proceso de
                pago.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  </PublicLayout>
);

export const PaymentGatewayTemplate = () => (
  <PublicLayout>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">
            Pago seguro
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Confirma tu reserva
          </h1>
          <p className="mt-2 text-slate-600">
            Elige el metodo de pago y revisa el resumen antes de confirmar.
          </p>
        </div>
        <StatusBadge tone="green">Conexion cifrada</StatusBadge>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["credit_card", "Tarjeta", "Activo"],
              ["account_balance", "PSE", "Disponible"],
              ["receipt_long", "Transferencia", "Manual"],
            ].map(([icon, label, status], index) => (
              <button
                key={label}
                className={`rounded-2xl border p-4 text-left transition ${
                  index === 0
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 bg-white text-slate-600 hover:border-primary/40"
                }`}
                type="button"
              >
                <Icon name={icon} />
                <p className="mt-3 font-black text-slate-950">{label}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {status}
                </p>
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field
                label="Numero de tarjeta"
                placeholder="0000 0000 0000 0000"
              />
            </div>
            <div className="sm:col-span-2">
              <Field
                label="Nombre en la tarjeta"
                placeholder="Como aparece en la tarjeta"
              />
            </div>
            <Field label="Vencimiento" placeholder="MM/AA" />
            <Field label="CVV" placeholder="123" />
            <Field label="Documento" placeholder="Cedula o pasaporte" />
            <Field
              label="Cuotas"
              options={["1 cuota", "2 cuotas", "3 cuotas", "6 cuotas"]}
            />
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="flex gap-3">
              <Icon name="lock" className="text-primary" />
              <div>
                <h2 className="font-black text-slate-950">
                  Tus datos estan protegidos
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Amaturis no almacena informacion sensible de tarjetas. La
                  transaccion se procesa con validacion segura y trazabilidad.
                </p>
              </div>
            </div>
          </div>

          <Link href="/reservas/confirmacion" className="block">
            <Button className="w-full rounded-xl py-4 normal-case tracking-normal cursor-pointer">
              <Icon name="payments" />
              Pagar y confirmar reserva
            </Button>
          </Link>
        </section>

        <aside className="space-y-5 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200 lg:sticky lg:top-24">
          <img
            src={images.river}
            alt="Rio amazonico"
            className="h-36 w-full rounded-xl object-cover"
          />
          <div>
            <h2 className="text-lg font-black">
              Expedicion al Canon de las Dalias
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              15 nov 2026 · 2 viajeros · Prestador Selva Viva
            </p>
          </div>
          <div className="space-y-3 border-t border-slate-100 pt-5">
            <SummaryRow label="Subtotal" value="$490.000" />
            <SummaryRow label="Tarifa de servicio" value="$34.300" />
            <SummaryRow label="Total a pagar" value="$524.300" strong />
          </div>
          <div className="rounded-xl bg-primary/10 p-4 text-sm leading-6 text-primary">
            Cancelacion gratuita hasta 72 horas antes de la salida, segun
            condiciones del operador.
          </div>
        </aside>
      </div>
    </section>
  </PublicLayout>
);

export const BookingConfirmationTemplate = () => (
  <PublicLayout>
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="bg-primary px-6 py-10 text-center text-white sm:px-10">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
            <Icon name="check_circle" className="text-5xl" fill />
          </span>
          <h1 className="mt-5 text-3xl font-black">Reserva confirmada</h1>
          <p className="mt-2 text-white/80">
            Codigo AMT-2026-0842 · Comprobante enviado a tu correo.
          </p>
        </div>
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <InfoCard icon="hiking" title="Resumen del viaje">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Paquete", "Expedicion al Canon de las Dalias"],
                  ["Fecha", "15 de noviembre de 2026"],
                  ["Viajeros", "2 personas"],
                  ["Proveedor", "Prestador Selva Viva"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase text-slate-400">
                      {label}
                    </p>
                    <p className="mt-1 font-black text-slate-950">{value}</p>
                  </div>
                ))}
              </div>
            </InfoCard>
            <InfoCard icon="route" title="Proximos pasos">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  "Revisa tu correo",
                  "Contacta al guia",
                  "Prepara recomendaciones",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <span className="text-xs font-black text-primary">
                      0{index + 1}
                    </span>
                    <p className="mt-2 text-sm font-bold text-slate-700">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </InfoCard>
          </div>
          <aside className="space-y-4 rounded-2xl bg-slate-50 p-5">
            <SummaryRow label="Total pagado" value="$524.300" strong />
            <SummaryRow label="Metodo" value="Tarjeta terminada 1024" />
            <SummaryRow label="Estado" value="Aprobado" />
            <Link href="/perfil/reservas/detalle" className="block">
              <Button className="w-full rounded-xl normal-case tracking-normal">
                Ver detalle de reserva
              </Button>
            </Link>
            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
              type="button"
            >
              <Icon name="download" className="text-base" />
              Descargar comprobante
            </button>
            <Link
              href="/"
              className="block text-center text-sm font-bold text-primary"
            >
              Volver al inicio
            </Link>
          </aside>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export const PaymentStatusTemplate = () => (
  <PublicLayout>
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <Icon name="hourglass_top" className="text-4xl" />
          </span>
          <div className="flex-1">
            <StatusBadge tone="amber">Pago pendiente</StatusBadge>
            <h1 className="mt-3 text-3xl font-black text-slate-950">
              Estamos esperando confirmacion
            </h1>
            <p className="mt-2 text-slate-600">
              Tu reserva esta bloqueada temporalmente. Si el pago no se confirma
              antes del vencimiento, los cupos se liberaran automaticamente.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Transaccion", "PSP-2026-0042"],
            ["Reserva", "AMT-2026-0842"],
            ["Vence", "15 min restantes"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-400">
                {label}
              </p>
              <p className="mt-1 font-black">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/pasarela_pagos" className="sm:w-auto">
            <Button className="w-full rounded-xl normal-case tracking-normal">
              Reintentar pago
            </Button>
          </Link>
          <Link href="/perfil/reservas" className="sm:w-auto">
            <button
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700"
              type="button"
            >
              Ver mis reservas
            </button>
          </Link>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export const CancelReservationTemplate = ({
  reservationId,
}: {
  reservationId?: string;
}) => (
  <PublicLayout>
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/perfil/reservas/detalle"
        className="inline-flex items-center gap-2 text-sm font-bold text-primary"
      >
        <Icon name="arrow_back" className="text-base" />
        Volver al detalle
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <StatusBadge tone="red">Accion sensible</StatusBadge>
          <h1 className="mt-4 text-3xl font-black text-slate-950">
            Solicitud de cancelacion
          </h1>
          <p className="mt-2 text-slate-600">
            Revisa las condiciones antes de confirmar. Esta accion notificara al
            prestador y registrara un evento en la reserva{" "}
            {reservationId ?? "AMT-2026-0842"}.
          </p>
          <div className="mt-8 space-y-5">
            <div className="rounded-2xl bg-slate-50 p-5">
              <h2 className="font-black">Politica aplicable</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Cancelacion con reembolso del 80% hasta 72 horas antes de la
                salida. Despues de ese plazo, el operador revisa el caso.
              </p>
            </div>
            <Field
              label="Motivo de cancelacion"
              options={[
                "Cambio de fechas",
                "Problema de salud",
                "Cambio de planes",
                "Error en la reserva",
                "Otro motivo",
              ]}
            />
            <Field
              label="Comentario opcional"
              placeholder="Agrega contexto para el equipo de soporte."
              textarea
            />
            <label className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              <input
                className="mt-1 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                type="checkbox"
              />
              <span>
                Entiendo que esta solicitud puede afectar cupos, pagos y
                disponibilidad del prestador.
              </span>
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/perfil/reservas/detalle">
                <button
                  className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 sm:w-auto"
                  type="button"
                >
                  No cancelar
                </button>
              </Link>
              <Link href="/perfil/reservas/cancelacion-exitosa">
                <Button className="w-full rounded-xl bg-red-600 normal-case tracking-normal hover:bg-red-700 sm:w-auto">
                  Confirmar cancelacion
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <aside className="h-fit rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 lg:sticky lg:top-24">
          <img
            src={images.waterfall}
            alt="Cascada en Caqueta"
            className="h-40 w-full rounded-2xl object-cover"
          />
          <h2 className="mt-5 text-xl font-black">Aventura en el Hacha</h2>
          <div className="mt-5 space-y-3">
            <SummaryRow label="Fecha" value="15 nov 2026" />
            <SummaryRow label="Viajeros" value="2 personas" />
            <SummaryRow label="Pagado" value="$524.300" />
            <SummaryRow label="Reembolso estimado" value="$419.440" strong />
          </div>
        </aside>
      </div>
    </section>
  </PublicLayout>
);

export const CancelSuccessTemplate = () => (
  <PublicLayout>
    <CenteredResult
      icon="event_busy"
      tone="red"
      title="Cancelacion solicitada"
      text="Registramos la solicitud y notificamos al prestador. Recibiras actualizaciones sobre el estado del reembolso."
      primaryHref="/perfil/reservas"
      primaryLabel="Ver mis reservas"
      secondaryHref="/"
      secondaryLabel="Volver al inicio"
    />
  </PublicLayout>
);

export const ReviewFormTemplate = ({
  reservationId,
}: {
  reservationId?: string;
}) => (
  <PublicLayout>
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <img
            src={images.canyon}
            alt="Viaje al Canon de las Dalias"
            className="h-48 w-full object-cover"
          />
          <div className="space-y-3 p-5">
            <StatusBadge tone="green">Viaje completado</StatusBadge>
            <h1 className="text-xl font-black">Comparte tu experiencia</h1>
            <p className="text-sm leading-6 text-slate-600">
              Reserva {reservationId ?? "AMT-2026-0842"} · Guia Laura Rojas ·
              Prestador Selva Viva
            </p>
          </div>
        </aside>
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <h2 className="text-3xl font-black text-slate-950">Dejar resena</h2>
          <p className="mt-2 text-slate-600">
            Tu opinion ayuda a otros viajeros y mejora la calidad de los
            aliados.
          </p>
          <div className="mt-8 space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Calificacion
              </p>
              <div className="mt-3 flex gap-2 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon key={star} name="star" className="text-4xl" fill />
                ))}
              </div>
            </div>
            <Field
              label="Comentario"
              placeholder="Cuenta como fue la experiencia, el guia, la seguridad y los lugares visitados."
              textarea
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Aspectos destacados
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "Guia",
                  "Puntualidad",
                  "Naturaleza",
                  "Comida",
                  "Seguridad",
                  "Comunidad",
                ].map((tag) => (
                  <button
                    key={tag}
                    className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary"
                    type="button"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
              <Icon
                name="add_photo_alternate"
                className="text-4xl text-primary"
              />
              <p className="mt-2 text-sm font-bold text-slate-700">
                Subir fotos del viaje
              </p>
              <p className="text-xs text-slate-400">JPG o PNG hasta 5 MB</p>
            </div>
            <Link href="/perfil/reservas/resena-publicada" className="block">
              <Button className="w-full rounded-xl py-4 normal-case tracking-normal">
                Publicar resena
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </section>
  </PublicLayout>
);

export const ReviewPublishedTemplate = () => (
  <PublicLayout>
    <CenteredResult
      icon="reviews"
      tone="green"
      title="Resena publicada"
      text="Gracias por ayudar a fortalecer la comunidad Amaturis. Tu comentario queda asociado a una reserva completada."
      primaryHref="/perfil/reservas"
      primaryLabel="Ver mis reservas"
      secondaryHref="/planes"
      secondaryLabel="Explorar mas planes"
    />
  </PublicLayout>
);

const CenteredResult = ({
  icon,
  tone,
  title,
  text,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  icon: string;
  tone: "green" | "red";
  title: string;
  text: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) => {
  const colors =
    tone === "green" ? "bg-primary/10 text-primary" : "bg-red-100 text-red-700";

  return (
    <section className="mx-auto flex min-h-[62vh] max-w-3xl items-center px-4 py-14 sm:px-6">
      <div className="w-full rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200 sm:p-12">
        <span
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${colors}`}
        >
          <Icon name={icon} className="text-5xl" />
        </span>
        <h1 className="mt-6 text-3xl font-black text-slate-950">{title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">{text}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={primaryHref}>
            <Button className="w-full rounded-xl normal-case tracking-normal sm:w-auto">
              {primaryLabel}
            </Button>
          </Link>
          <Link href={secondaryHref}>
            <button
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 sm:w-auto"
              type="button"
            >
              {secondaryLabel}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export const NotificationsTemplate = () => {
  const notifications = [
    [
      "payments",
      "Pago aprobado",
      "Tu pago de $524.300 fue confirmado.",
      "Hace 5 min",
      "Reservas",
      "green",
    ],
    [
      "event_available",
      "Reserva creada",
      "Aventura en el Hacha quedo registrada.",
      "Hoy",
      "Reservas",
      "blue",
    ],
    [
      "person_pin_circle",
      "Mensaje del guia",
      "Laura confirmo el punto de encuentro.",
      "Ayer",
      "Sistema",
      "slate",
    ],
    [
      "campaign",
      "Promocion",
      "Nuevas rutas de cascadas disponibles este mes.",
      "Ayer",
      "Promociones",
      "amber",
    ],
    [
      "warning",
      "Recordatorio",
      "Faltan documentos del viajero principal.",
      "2 dias",
      "Sistema",
      "red",
    ],
  ] as const;

  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">
              Notificaciones
            </h1>
            <p className="mt-2 text-slate-600">
              Estado de reservas, pagos, mensajes de guia y novedades de
              Amaturis.
            </p>
          </div>
          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
            type="button"
          >
            Marcar todas como leidas
          </button>
        </div>
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {["Todas", "Reservas", "Pagos", "Sistema", "Promociones"].map(
            (filter, index) => (
              <button
                key={filter}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  index === 0
                    ? "bg-primary text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
                type="button"
              >
                {filter}
              </button>
            ),
          )}
        </div>
        <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          {notifications.map(
            ([icon, title, text, time, category, tone], index) => (
              <div
                key={title}
                className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center ${
                  index !== notifications.length - 1
                    ? "border-b border-slate-100"
                    : ""
                }`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon name={icon} />
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-black text-slate-950">{title}</h2>
                    <StatusBadge tone={tone}>{category}</StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{text}</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <span className="text-xs font-bold uppercase text-slate-400">
                    {time}
                  </span>
                  <button
                    className="text-sm font-bold text-primary"
                    type="button"
                  >
                    Ver
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

const panelLinks = [
  ["/panel", "dashboard", "Resumen"],
  ["/panel/reservas", "event_available", "Reservas"],
  ["/panel/paquetes", "inventory_2", "Paquetes"],
];

export const PanelLayout = ({
  title,
  subtitle,
  active,
  admin,
  children,
}: {
  title: string;
  subtitle: string;
  active: string;
  admin?: boolean;
  children: React.ReactNode;
}) => {
  const links = panelLinks;
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { logout } = useAuth();
  const router = useRouter();
  const [headerSearch, setHeaderSearch] = React.useState("");

  const closeSidebar = () => setIsSidebarOpen(false);
  const handleLogout = () => {
    closeSidebar();
    logout();
  };
  const handleHeaderSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = headerSearch.trim();
    const basePath = "/panel/reservas";
    if (!q) {
      router.push(basePath);
      return;
    }
    const params = new URLSearchParams();
    params.set("q", q);
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background-light text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-y-auto border-r border-slate-200 bg-white px-4 py-6 lg:flex">
        <Link href="/" className="flex items-center gap-3 px-3 text-slate-950">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <Icon name="forest" />
          </span>
          <div>
            <p className="font-black">Amaturis</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
              {admin ? "Admin general" : "Aliados"}
            </p>
          </div>
        </Link>
        <nav className="mt-8 flex-1 space-y-1">
          {links.map(([href, icon, label]) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                label === active
                  ? "bg-primary/10 text-primary"
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary"
              }`}
            >
              <Icon name={icon} className="text-xl" />
              {label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 hover:text-red-600 cursor-pointer"
        >
          <Icon name="logout" />
          Cerrar sesion
        </button>
      </aside>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/45 transition-opacity duration-200 lg:hidden ${
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeSidebar}
        aria-hidden={!isSidebarOpen}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-slate-200 bg-white px-4 py-6 shadow-xl transition-transform duration-200 lg:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 text-slate-950"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <Icon name="forest" />
            </span>
            <div>
              <p className="font-black">Amaturis</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {admin ? "Admin general" : "Aliados"}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={closeSidebar}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            title="Cerrar menu"
          >
            <Icon name="close" />
          </button>
        </div>
        <nav className="mt-8 space-y-1">
          {links.map(([href, icon, label]) => (
            <Link
              key={`mobile-${label}`}
              href={href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                label === active
                  ? "bg-primary/10 text-primary"
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary"
              }`}
            >
              <Icon name={icon} className="text-xl" />
              {label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-red-600 cursor-pointer"
        >
          <Icon name="logout" />
          Cerrar sesion
        </button>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 lg:hidden"
                title="Abrir menu"
              >
                <Icon name="menu" />
              </button>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">
                  {title}
                </h1>
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <form
                className="relative hidden md:block"
                onSubmit={handleHeaderSearch}
              >
                <Icon
                  name="search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"
                />
                <input
                  className="w-64 rounded-xl border-0 bg-slate-50 py-2 pl-9 pr-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-primary"
                  placeholder="Buscar reserva..."
                  value={headerSearch}
                  onChange={(event) => setHeaderSearch(event.target.value)}
                  title={
                    admin
                      ? "Buscar en reservas globales"
                      : "Buscar en reservas operativas"
                  }
                />
              </form>
              <Link
                href="/notificaciones"
                className="hidden rounded-full bg-slate-50 p-2 text-slate-500 ring-1 ring-slate-200 md:inline-flex"
              >
                <Icon name="notifications" />
              </Link>
            </div>
          </div>
        </header>
        <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};

const MetricCard = ({
  icon,
  label,
  value,
  delta,
}: {
  icon: string;
  label: string;
  value: string;
  delta: string;
}) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <div className="flex items-center justify-between">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon name={icon} />
      </span>
      <span className="text-xs font-bold text-primary">{delta}</span>
    </div>
    <p className="mt-5 text-sm font-bold text-slate-500">{label}</p>
    <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
  </div>
);

export const PartnerDashboardTemplate = () => (
  <PanelLayout
    active="Resumen"
    title="Dashboard operativo"
    subtitle="Reservas, ingresos, cupos y tareas de tus experiencias."
  >
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon="event_available"
        label="Reservas activas"
        value="24"
        delta="+12%"
      />
      <MetricCard
        icon="payments"
        label="Ingresos estimados"
        value="$8.4M"
        delta="+8%"
      />
      <MetricCard
        icon="groups"
        label="Cupos proximos"
        value="68"
        delta="7 dias"
      />
      <MetricCard
        icon="star"
        label="Calificacion"
        value="4.8"
        delta="152 resenas"
      />
    </div>
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
      <TableCard
        title="Proximas reservas"
        columns={["Reserva", "Viajero", "Fecha", "Estado"]}
        rows={[
          ["Reserva_6efd3d69", "Laura Munoz", "15 nov", "Confirmada"],
          ["Reserva_97f99c22", "Camilo Rojas", "18 nov", "Pendiente"],
          ["Reserva_0f3a91bd", "Diana Vargas", "20 nov", "Confirmada"],
        ]}
        viewAllHref="/panel/reservas"
        rowLinks={[
          "/panel/reservas?reserva=Reserva_6efd3d69",
          "/panel/reservas?reserva=Reserva_97f99c22",
          "/panel/reservas?reserva=Reserva_0f3a91bd",
        ]}
      />
      <TaskPanel />
    </div>
  </PanelLayout>
);

const TaskPanel = () => (
  <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <h2 className="font-black text-slate-950">Tareas pendientes</h2>
    <div className="mt-5 space-y-3">
      {[
        ["check_circle", "Confirmar punto de encuentro", "Hoy"],
        ["photo_camera", "Actualizar galeria del paquete", "2 dias"],
        ["rate_review", "Responder resenas recientes", "3 pendientes"],
      ].map(([icon, title, meta]) => (
        <div key={title} className="flex gap-3 rounded-xl bg-slate-50 p-3">
          <Icon name={icon} className="text-primary" />
          <div>
            <p className="text-sm font-bold">{title}</p>
            <p className="text-xs text-slate-400">{meta}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const TableCard = ({
  title,
  columns,
  rows,
  viewAllHref,
  rowLinks,
}: {
  title: string;
  columns: string[];
  rows: string[][];
  viewAllHref?: string;
  rowLinks?: string[];
}) => (
  <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
    <div className="flex items-center justify-between border-b border-slate-100 p-5">
      <h2 className="font-black text-slate-950">{title}</h2>
      {viewAllHref ? (
        <Link
          href={viewAllHref}
          className="text-sm font-bold text-primary"
          title="Ver todas las reservas"
        >
          Ver todo
        </Link>
      ) : (
        <button className="text-sm font-bold text-primary" type="button">
          Ver todo
        </button>
      )}
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-5 py-3 font-black">
                {column}
              </th>
            ))}
            {rowLinks ? (
              <th className="px-5 py-3 font-black text-right">Accion</th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rowIndex) => (
            <tr key={row.join("-")} className="text-slate-700">
              {row.map((cell, index) => (
                <td key={`${cell}-${index}`} className="px-5 py-4">
                  {index === row.length - 1 ? (
                    <StatusBadge
                      tone={cell === "Pendiente" ? "amber" : "green"}
                    >
                      {cell}
                    </StatusBadge>
                  ) : (
                    cell
                  )}
                </td>
              ))}
              {rowLinks ? (
                <td className="px-5 py-4 text-right">
                  <Link
                    href={rowLinks[rowIndex] ?? "/panel/reservas"}
                    className="text-xs font-bold text-primary hover:underline"
                    title="Abrir reserva"
                  >
                    Abrir
                  </Link>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export const PackageManagementTemplate = () => (
  <PanelLayout
    active="Paquetes"
    title="Gestion de paquetes"
    subtitle="Administra publicaciones, precios, cupos y disponibilidad."
  >
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {["Todos", "Publicados", "Borradores", "Pausados"].map(
          (item, index) => (
            <button
              key={item}
              className={`rounded-full px-4 py-2 text-sm font-bold ${index === 0 ? "bg-primary text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
              type="button"
            >
              {item}
            </button>
          ),
        )}
      </div>
      <Button className="rounded-xl normal-case tracking-normal">
        <Icon name="add" />
        Crear paquete
      </Button>
    </div>
    <TableCard
      title="Paquetes turisticos"
      columns={["Nombre", "Municipio", "Precio", "Cupos", "Estado"]}
      rows={[
        ["Canon de las Dalias", "La Montanita", "$245.000", "12", "Publicada"],
        ["Ruta Rio Hacha", "Florencia", "$450.000", "8", "Publicada"],
        ["Sabores del Caqueta", "Morelia", "$180.000", "20", "Pendiente"],
        ["Cascadas La Avispa", "Florencia", "$320.000", "6", "Publicada"],
      ]}
    />
    <QuickForm
      title="Creacion rapida"
      fields={[
        "Nombre del paquete",
        "Destino principal",
        "Precio por persona",
        "Capacidad maxima",
      ]}
    />
  </PanelLayout>
);

const QuickForm = ({ title, fields }: { title: string; fields: string[] }) => (
  <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <h2 className="font-black text-slate-950">{title}</h2>
    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {fields.map((field) => (
        <Field key={field} label={field} placeholder={field} />
      ))}
    </div>
  </section>
);

export const ServicesManagementTemplate = () => (
  <PanelLayout
    active="Servicios"
    title="Servicios, sitios y productos"
    subtitle="Gestiona lo que ofrece cada prestador o comunidad."
  >
    <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
      {["Servicios", "Sitios", "Productos locales"].map((tab, index) => (
        <button
          key={tab}
          className={`rounded-full px-4 py-2 text-sm font-bold ${index === 0 ? "bg-primary text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
          type="button"
        >
          {tab}
        </button>
      ))}
    </div>
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[
        ["hotel", "Ecolodge Caqueta", "Hospedaje", "Activo"],
        ["restaurant", "Fogon Campesino", "Restaurante", "Activo"],
        ["directions_boat", "Lancha turistica", "Transporte", "Activo"],
        ["hiking", "Senderismo ecologico", "Actividad", "Inactivo"],
        ["waterfall_chart", "Cascada La Avispa", "Sitio", "Activo"],
        ["local_mall", "Cacao amazonico", "Producto", "Activo"],
      ].map(([icon, title, type, status]) => (
        <article
          key={title}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name={icon} />
            </span>
            <StatusBadge tone={status === "Activo" ? "green" : "slate"}>
              {status}
            </StatusBadge>
          </div>
          <h2 className="mt-5 font-black text-slate-950">{title}</h2>
          <p className="text-sm text-slate-500">{type}</p>
          <div className="mt-5 flex gap-2">
            <button
              className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600"
              type="button"
            >
              Editar
            </button>
            <button
              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
              type="button"
            >
              Eliminar
            </button>
          </div>
        </article>
      ))}
    </div>
  </PanelLayout>
);

export const CommunityPanelTemplate = () => (
  <PanelLayout
    active="Comunidad"
    title="Panel de comunidad"
    subtitle="Prestadores, productos, paquetes asociados e impacto local."
  >
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon="diversity_3"
        label="Prestadores"
        value="18"
        delta="3 pendientes"
      />
      <MetricCard
        icon="local_mall"
        label="Productos activos"
        value="42"
        delta="+6"
      />
      <MetricCard
        icon="inventory_2"
        label="Paquetes asociados"
        value="11"
        delta="5 municipios"
      />
      <MetricCard
        icon="payments"
        label="Ingresos estimados"
        value="$12.8M"
        delta="mes"
      />
    </div>
    <div className="mt-8 grid gap-6 xl:grid-cols-2">
      <TableCard
        title="Prestadores por aprobar"
        columns={["Nombre", "Tipo", "Municipio", "Estado"]}
        rows={[
          ["Senderos del Sur", "Guia", "Florencia", "Pendiente"],
          ["Mesa del Rio", "Restaurante", "Morelia", "Pendiente"],
          ["Lancha Yarí", "Transporte", "Solano", "Pendiente"],
        ]}
      />
      <TableCard
        title="Productos locales"
        columns={["Producto", "Categoria", "Stock", "Estado"]}
        rows={[
          ["Cacao amazonico", "Gastronomia", "80", "Publicada"],
          ["Artesania chambira", "Artesania", "25", "Publicada"],
          ["Miel de bosque", "Gastronomia", "40", "Publicada"],
        ]}
      />
    </div>
  </PanelLayout>
);

export const AdminDashboardTemplate = () => (
  <PanelLayout
    admin
    active="Resumen"
    title="Administrador general"
    subtitle="Control de usuarios, roles, pagos, ontologia y servicios tecnicos."
  >
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard icon="group" label="Usuarios" value="1.240" delta="+18%" />
      <MetricCard
        icon="event_available"
        label="Reservas mes"
        value="326"
        delta="+9%"
      />
      <MetricCard
        icon="payments"
        label="Pagos aprobados"
        value="298"
        delta="91%"
      />
      <MetricCard
        icon="inventory_2"
        label="Paquetes activos"
        value="84"
        delta="+12"
      />
      <MetricCard
        icon="person_pin"
        label="Prestadores pendientes"
        value="17"
        delta="revision"
      />
    </div>
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
      <TableCard
        title="Solicitudes recientes"
        columns={["Entidad", "Tipo", "Municipio", "Estado"]}
        rows={[
          ["Selva Expeditions", "Agencia", "Florencia", "Pendiente"],
          ["Comunidad Verde", "Comunidad", "Solano", "Pendiente"],
          ["Rutas del Fragua", "Prestador", "San Jose", "Publicada"],
        ]}
      />
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="font-black text-slate-950">Estado de servicios</h2>
        <div className="mt-5 space-y-3">
          {["FastAPI", "Fuseki", "Postgres", "n8n"].map((service) => (
            <div
              key={service}
              className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
            >
              <span className="font-bold text-slate-700">{service}</span>
              <StatusBadge tone="green">Online</StatusBadge>
            </div>
          ))}
        </div>
      </section>
    </div>
  </PanelLayout>
);

export const AdminBlobUploadTemplate = () => (
  <PanelLayout
    admin
    active="Imagenes"
    title="Imagenes RDF"
    subtitle="Carga de archivos publicos y URLs para individuos de la ontologia."
  >
    <BlobUploadTool />
  </PanelLayout>
);

export const AboutFullTemplate = () => (
  <PublicLayout>
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={images.canopy}
          alt="Selva amazonica del Caqueta"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/50 to-slate-950/85" />
      </div>
      <div className="relative mx-auto flex min-h-[70vh] max-w-7xl items-end px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="max-w-3xl text-white">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-primary">
            Turismo sostenible en Caqueta
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
            Amaturis conecta viajeros con comunidades, naturaleza y conocimiento
            local.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
            Creamos una plataforma para reservar experiencias responsables,
            proteger la biodiversidad y abrir oportunidades economicas en el
            territorio.
          </p>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {[
          [
            "eco",
            "Sostenibilidad",
            "Planes con capacidad de carga, operadores locales y cuidado del ecosistema.",
          ],
          [
            "diversity_3",
            "Comunidad",
            "Prestadores, agencias y comunidades trabajan dentro de una red visible.",
          ],
          [
            "verified_user",
            "Seguridad",
            "Reservas, pagos, roles y trazabilidad para operar con confianza.",
          ],
        ].map(([icon, title, text]) => (
          <article
            key={title}
            className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200"
          >
            <Icon name={icon} className="text-4xl text-primary" />
            <h2 className="mt-5 text-xl font-black">{title}</h2>
            <p className="mt-3 leading-7 text-slate-600">{text}</p>
          </article>
        ))}
      </div>
      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">
            Como funciona
          </p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">
            Del conocimiento territorial a una reserva clara.
          </h2>
          <div className="mt-8 space-y-5">
            {[
              "Explora planes, sitios y rutas del Caqueta.",
              "Reserva con fechas, cupos y pagos trazables.",
              "Vive la experiencia con guias y prestadores locales.",
              "Califica el viaje para mejorar la red.",
            ].map((step, index) => (
              <div
                key={step}
                className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-white">
                  {index + 1}
                </span>
                <p className="font-bold text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
          <img
            src={images.river}
            alt="Rio del Caqueta"
            className="h-72 w-full object-cover"
          />
          <div className="grid grid-cols-3 divide-x divide-slate-100 p-6 text-center">
            {[
              ["16", "municipios"],
              ["40+", "planes base"],
              ["45+", "sitios turísticos"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="text-2xl font-black text-primary">{value}</p>
                <p className="mt-1 text-xs font-bold uppercase text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-16 rounded-3xl bg-slate-950 p-8 text-white sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-black">
              Explora o aliate con Amaturis
            </h2>
            <p className="mt-2 text-white/70">
              La misma plataforma conecta viajeros, prestadores y comunidades.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/planes">
              <Button className="w-full rounded-xl normal-case tracking-normal sm:w-auto cursor-pointer">
                Explorar planes
              </Button>
            </Link>
            <Link href="/registro/agente">
              <button
                className="w-full rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white sm:w-auto cursor-pointer"
                type="button"
              >
                Ser aliado
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  </PublicLayout>
);
