import React from "react";
import LoginForm from "../organisms/LoginForm";
import LoginBranding from "../organisms/LoginBranding";
import Icon from "@/components/shared/atoms/Icon";
import Link from "next/link";

const LoginTemplate: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background-light text-slate-900">
      <LoginBranding />

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-20 xl:px-32 bg-background-light">
        <div className="w-full max-w-md space-y-8">
          <Link
            href="/"
            className="flex flex-col items-center lg:hidden"
            title="Ir a inicio"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white mb-4">
              <Icon name="forest" className="text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Amaturis</h2>
          </Link>

          <LoginForm />
        </div>

        <div className="mt-auto flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500 pt-10">
          <Link
            href="/politica-de-privacidad"
            className="hover:text-primary"
            title="Política de privacidad"
          >
            Política de privacidad
          </Link>
          <Link
            href="/terminos-del-servicio"
            className="hover:text-primary"
            title="Términos del servicio"
          >
            Términos del servicio
          </Link>
          <Link
            href="/centro-de-ayuda"
            className="hover:text-primary"
            title="Centro de ayuda"
          >
            Centro de ayuda
          </Link>
          <span className="text-slate-300">|</span>
          <span>© {year} Amaturis</span>
        </div>
      </div>
    </div>
  );
};

export default LoginTemplate;
