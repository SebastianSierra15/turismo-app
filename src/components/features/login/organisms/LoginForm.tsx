"use client";

import React, { useState } from "react";
import Input from "@/components/shared/atoms/Input";
import Button from "@/components/shared/atoms/Button";
import Icon from "@/components/shared/atoms/Icon";
import SocialButtons from "../molecules/SocialButtons";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { buildApiUrl } from "@/lib/api";

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // FastAPI con OAuth2PasswordRequestForm espera 'username' y 'password' como Form Data
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const response = await fetch(buildApiUrl("/usuarios/login"), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = "Error al iniciar sesion";
        try {
          const errorData = await response.json();
          if (errorData?.detail) {
            message = String(errorData.detail);
          }
        } catch {
          const text = (await response.text()).trim();
          if (text) {
            message = text.slice(0, 200);
          }
        }
        throw new Error(message);
      }

      const data = await response.json();

      // Guardar sesión
      login(data.access_token, data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesiÃ³n");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <h1 className="sr-only">Iniciar sesión en Amaturis</h1>
      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-extrabold text-slate-900">
          Bienvenido de vuelta
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Ingresa tus datos para acceder a tu panel
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <SocialButtons />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background-light px-2 text-slate-500">
              O continúa con tu correo
            </span>
          </div>
        </div>

        {/* --- FORMULARIO CONECTADO --- */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <Input
            id="email"
            label="Correo electrónico"
            placeholder="aventurero.amazonia@gmail.com"
            type="email"
            required
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />

          <Input
            id="password"
            label="Contraseña"
            placeholder="••••••••"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            icon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Icon name={showPassword ? "visibility_off" : "visibility"} />
              </button>
            }
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-slate-700"
              >
                Recordarme
              </label>
            </div>
            <Link
              href="/olvide-contrasena"
              className="text-sm font-semibold text-primary hover:text-primary/80"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Cargando..." : "Iniciar sesión en la aventura"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600">
          ¿Nuevo en la selva?{" "}
          <Link
            href="/registro"
            className="font-bold text-primary hover:text-primary/80"
          >
            Crea una cuenta
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
