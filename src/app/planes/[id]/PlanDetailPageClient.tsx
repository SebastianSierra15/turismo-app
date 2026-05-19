"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/shared/organisms/Navbar";
import Footer from "@/components/shared/organisms/Footer";
import PlanDetailTemplate from "@/components/features/planes/templates/PlanDetailTemplate";
import { useAuth } from "@/context/AuthContext";
import { isOperatorOrAdminRole } from "@/lib/roles";
import {
  getPlanDetail,
  mapPackageDetailToPlanDetail,
} from "@/services/planDetail";
import { getOperatorPackageDetailForPlanAccess } from "@/services/operatorPackages";
import { type PlanDetail } from "@/types/planDetail";

type PlanDetailPageClientProps = {
  id: string;
};

const PlanAccessMessage = ({
  title,
  text,
}: {
  title: string;
  text: string;
}) => (
  <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-slate-900">
    <Navbar />
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-black text-slate-950">{title}</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
          {text}
        </p>
        <Link
          href="/planes"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white"
        >
          Ver planes publicados
        </Link>
      </section>
    </main>
    <Footer />
  </div>
);

const PlanDetailPageClient: React.FC<PlanDetailPageClientProps> = ({ id }) => {
  const { token, loading: authLoading, user } = useAuth();
  const [plan, setPlan] = React.useState<PlanDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    let isCancelled = false;

    const loadPlan = async () => {
      setIsLoading(true);
      setMessage("");

      const publicPlan = await getPlanDetail(id);
      if (isCancelled) return;

      if (publicPlan) {
        setPlan(publicPlan);
        setIsLoading(false);
        return;
      }

      if (authLoading) {
        return;
      }

      if (!token || !isOperatorOrAdminRole(user?.rol)) {
        setPlan(null);
        setMessage("El plan no esta publicado o no existe.");
        setIsLoading(false);
        return;
      }

      try {
        const privateDetail = await getOperatorPackageDetailForPlanAccess(
          token,
          id,
        );
        if (isCancelled) return;
        setPlan(mapPackageDetailToPlanDetail(privateDetail, id));
      } catch {
        if (isCancelled) return;
        setPlan(null);
        setMessage("No tienes permisos para ver este plan.");
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPlan().catch(() => {
      if (isCancelled) return;
      setPlan(null);
      setMessage("No se pudo cargar el plan.");
      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [authLoading, id, token, user?.rol]);

  if (isLoading || authLoading) {
    return (
      <PlanAccessMessage
        title="Cargando plan"
        text="Estamos validando la disponibilidad y los permisos de acceso."
      />
    );
  }

  if (!plan) {
    return (
      <PlanAccessMessage
        title="Plan no disponible"
        text={message || "El plan no esta publicado o no existe."}
      />
    );
  }

  return <PlanDetailTemplate plan={plan} />;
};

export default PlanDetailPageClient;
