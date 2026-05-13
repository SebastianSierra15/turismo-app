"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type RoleAccessGateProps = {
  allowedRoles: string[];
  sectionLabel: string;
  children: React.ReactNode;
};

const normalizeRole = (value: unknown) => String(value ?? "").trim().toLowerCase();

const RoleAccessGate: React.FC<RoleAccessGateProps> = ({
  allowedRoles,
  sectionLabel,
  children,
}) => {
  const { loading, token, user } = useAuth();
  const router = useRouter();

  const allowedSet = React.useMemo(
    () => new Set(allowedRoles.map((role) => normalizeRole(role))),
    [allowedRoles]
  );

  const currentRole = normalizeRole(user?.rol);
  const hasRoleAccess = currentRole !== "" && allowedSet.has(currentRole);

  React.useEffect(() => {
    if (!loading && !token) {
      router.replace("/login");
    }
  }, [loading, router, token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <p className="text-sm font-semibold text-slate-500">Validando acceso...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <p className="text-sm font-semibold text-slate-500">Redirigiendo a inicio de sesion...</p>
      </div>
    );
  }

  if (!hasRoleAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light p-4">
        <div className="w-full max-w-xl rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">No autorizado</h1>
          <p className="mt-3 text-sm font-semibold text-slate-600">
            Tu rol actual no tiene permisos para entrar a {sectionLabel}.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/perfil"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white"
            >
              Ir a mi perfil
            </Link>
            <Link
              href="/"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700"
            >
              Ir a inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleAccessGate;
