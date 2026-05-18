"use client";

import React, { useState } from "react";
import Input from "@/components/shared/atoms/Input";
import Button from "@/components/shared/atoms/Button";
import Icon from "@/components/shared/atoms/Icon";
import SocialButtons from "../molecules/SocialButtons";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const RegisterForm: React.FC = () => {
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Validación en cliente antes de enviar
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!nombreCompleto.trim()) {
      errors.nombreCompleto = "El nombre completo es obligatorio";
    }
    if (!email.trim()) {
      errors.email = "El correo electrónico es obligatorio";
    }
    if (password.length < 8) {
      errors.password = "La contraseña debe tener al menos 8 caracteres";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/usuarios/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_completo: nombreCompleto,
          email,
          password,
          rol_id: 2,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al crear la cuenta");
      }

      const data = await response.json();
      // Inicia sesión automáticamente tras el registro
      login(data.access_token, data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <h1 className="sr-only">Crear cuenta en Amaturis</h1>

      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-extrabold text-slate-900">
          Únete a la aventura
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Crea tu cuenta y comienza a explorar la Amazonía colombiana
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <SocialButtons />

        {/* Separador */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background-light px-2 text-slate-500">
              O regístrate con tu correo
            </span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleRegister} className="space-y-5" noValidate>
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 text-red-600 p-3.5 rounded-lg text-sm font-medium border border-red-100">
              <Icon
                name="error_outline"
                className="text-base mt-0.5 shrink-0"
              />
              <span>{error}</span>
            </div>
          )}

          <Input
            id="nombre_completo"
            label="Nombre completo"
            placeholder="Juan Explorador"
            type="text"
            required
            autoComplete="name"
            value={nombreCompleto}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNombreCompleto(e.target.value);
              setFieldErrors((prev) => ({ ...prev, nombreCompleto: "" }));
            }}
            error={fieldErrors.nombreCompleto}
          />

          <Input
            id="email"
            label="Correo electrónico"
            placeholder="aventurero.amazonia@gmail.com"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setEmail(e.target.value);
              setFieldErrors((prev) => ({ ...prev, email: "" }));
            }}
            error={fieldErrors.email}
          />

          <Input
            id="password"
            label="Contraseña"
            placeholder="Mín. 8 caracteres"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPassword(e.target.value);
              setFieldErrors((prev) => ({ ...prev, password: "" }));
            }}
            error={fieldErrors.password}
            icon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                <Icon name={showPassword ? "visibility_off" : "visibility"} />
              </button>
            }
          />

          {/* Indicador de fortaleza de contraseña */}
          {password.length > 0 && <PasswordStrength password={password} />}

          <Input
            id="confirm_password"
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            type={showConfirm ? "text" : "password"}
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setConfirmPassword(e.target.value);
              setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            error={fieldErrors.confirmPassword}
            icon={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                title={showConfirm ? "Ocultar contraseña" : "Ver contraseña"}
              >
                <Icon name={showConfirm ? "visibility_off" : "visibility"} />
              </button>
            }
          />

          {/* Términos */}
          <p className="text-xs text-slate-500 leading-relaxed">
            Al crear una cuenta aceptas nuestros{" "}
            <Link
              href="/terminos-del-servicio"
              className="font-semibold text-primary hover:text-primary/80"
            >
              Términos del servicio
            </Link>{" "}
            y la{" "}
            <Link
              href="/politica-de-privacidad"
              className="font-semibold text-primary hover:text-primary/80"
            >
              Política de privacidad
            </Link>
            .
          </p>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Icon
                  name="progress_activity"
                  className="text-base animate-spin"
                />
                Creando tu cuenta...
              </span>
            ) : (
              "Crear mi cuenta"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-bold text-primary hover:text-primary/80"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

// --- Sub-componente: indicador de fortaleza ---
const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const getStrength = (
    pw: string,
  ): { level: number; label: string; color: string } => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { level: 1, label: "Débil", color: "bg-red-400" };
    if (score === 2)
      return { level: 2, label: "Regular", color: "bg-yellow-400" };
    if (score === 3) return { level: 3, label: "Buena", color: "bg-blue-400" };
    return { level: 4, label: "Fuerte", color: "bg-green-500" };
  };

  const strength = getStrength(password);

  return (
    <div className="space-y-1.5 -mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= strength.level ? strength.color : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Fortaleza:{" "}
        <span
          className={`font-semibold ${
            strength.level <= 1
              ? "text-red-500"
              : strength.level === 2
                ? "text-yellow-500"
                : strength.level === 3
                  ? "text-blue-500"
                  : "text-green-600"
          }`}
        >
          {strength.label}
        </span>
      </p>
    </div>
  );
};

export default RegisterForm;
