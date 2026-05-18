"use client";

import React, { useState } from "react";
import Link from "next/link";
import Icon from "@/components/shared/atoms/Icon";
import Button from "@/components/shared/atoms/Button";
import Input from "@/components/shared/atoms/Input";
import LoginBranding from "@/components/features/login/organisms/LoginBranding";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setSubmitted(false);

    await new Promise((resolve) => window.setTimeout(resolve, 800));

    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background-light text-slate-900">
      <LoginBranding />

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-20 xl:px-32 bg-background-light">
        <div className="w-full max-w-md space-y-7">
          <Link
            href="/"
            className="flex flex-col items-center lg:hidden"
            title="Ir a inicio"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
              <Icon name="forest" className="text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Amaturis</h2>
          </Link>

          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-extrabold text-slate-900">
              Recuperar contraseña
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Ingresa tu correo y te enviaremos instrucciones para recuperar
              acceso.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {submitted && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                Si el correo existe en Amaturis, recibirás un enlace de
                recuperación en los próximos minutos.
              </div>
            )}

            <Input
              id="recovery_email"
              label="Correo electrónico"
              type="email"
              required
              autoComplete="email"
              placeholder="aventurero.amazonia@gmail.com"
              value={email}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(event.target.value)
              }
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
            </Button>
          </form>

          <div className="space-y-3 text-center text-sm text-slate-600">
            <p>
              ¿Recordaste tu contraseña?{" "}
              <Link href="/login" className="font-bold text-primary">
                Volver a iniciar sesión
              </Link>
            </p>
            <p>
              ¿No tienes cuenta?{" "}
              <Link href="/registro" className="font-bold text-primary">
                Crear cuenta
              </Link>
            </p>
          </div>

          <div className="pt-3 text-center text-xs text-slate-500">
            <Link href="/politica-de-privacidad" className="hover:text-primary">
              Política de privacidad
            </Link>
            <span className="px-2">·</span>
            <Link href="/terminos-del-servicio" className="hover:text-primary">
              Términos del servicio
            </Link>
            <span className="px-2">·</span>
            <Link href="/centro-de-ayuda" className="hover:text-primary">
              Centro de ayuda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
