import React from "react";
import Link from "next/link";
import Icon from "@/components/shared/atoms/Icon";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0d162b] text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white">
                <Icon name="forest" className="text-xl" />
              </div>
              <span className="text-xl font-bold text-white">Amaturis</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-md">
              Impulsamos el turismo sostenible y la conservación de la región
              amazónica de Colombia. Te conectamos con experiencias locales
              auténticas.
            </p>
            <div className="flex gap-3">
              <a
                className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                href="#"
                title="Ver ranking social"
              >
                <Icon name="social_leaderboard" className="text-lg" />
              </a>
              <a
                className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                href="#"
                title="Visitar sitio público"
              >
                <Icon name="public" className="text-lg" />
              </a>
              <a
                className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                href="#"
                title="Ver videos"
              >
                <Icon name="play_circle" className="text-lg" />
              </a>
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-white font-semibold">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="#"
                  title="Ver tours y actividades"
                >
                  Tours y Actividades
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="#"
                  title="Conocer la región"
                >
                  Sobre la Región
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="#"
                  title="Viaje responsable"
                >
                  Viaje Responsable
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="#"
                  title="Contactar soporte"
                >
                  Contacto y Soporte
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h4 className="text-white font-semibold">Soporte</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/centro-de-ayuda"
                  title="Ir al centro de ayuda"
                >
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/terminos-del-servicio"
                  title="Ver política de reservas"
                >
                  Política de Reservas
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="#"
                  title="Guías de seguridad"
                >
                  Guías de Seguridad
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="#"
                  title="Alíate con nosotros"
                >
                  Alíate con Nosotros
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <span>© {year} Amaturis. Todos los derechos reservados.</span>
          <div className="flex gap-6">
            <Link
              className="hover:text-white transition-colors"
              href="/politica-de-privacidad"
              title="Política de privacidad"
            >
              Política de Privacidad
            </Link>
            <Link
              className="hover:text-white transition-colors"
              href="/terminos-del-servicio"
              title="Términos de servicio"
            >
              Términos de Servicio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
