"use client";

import React from "react";
import Logo from "@/components/shared/atoms/Logo";
import Button from "@/components/shared/atoms/Button";
import Icon from "@/components/shared/atoms/Icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isOperatorOrAdminRole } from "@/lib/roles";

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  const navItems = [
    { href: "/", label: "Inicio", title: "Ir a Inicio" },
    { href: "/planes", label: "Planes", title: "Ir a Planes" },
    { href: "/sitios", label: "Sitios", title: "Ir a Sitios" },
    { href: "/acerca_de", label: "Acerca de", title: "Ir a Acerca de" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-primary/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group" title="Ir al inicio">
            <Logo
              variant="primary"
              size="md"
              uppercase
              className="transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  className={`text-sm transition-colors ${active
                      ? "text-primary font-bold"
                      : "text-slate-600 hover:text-primary font-semibold"
                    }`}
                  href={item.href}
                  title={item.title}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            {loading ? (
              <div className="hidden sm:block h-9 w-36 rounded-full bg-slate-100 animate-pulse" />
            ) : isAuthenticated ? (
              /* --- VISTA CUANDO EL USUARIO ESTA LOGUEADO --- */
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-xs font-bold text-slate-900 leading-none">
                    {user?.nombre_completo}
                  </span>
                  <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">
                    {user?.rol}
                  </span>
                </div>

                <div className="relative group">
                  <button
                    type="button"
                    title="Abrir menú de cuenta"
                    className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
                  >
                    <Icon name="person" />
                  </button>
                  <div className="invisible pointer-events-none absolute right-0 top-11 z-[70] w-56 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                    <Link
                      href="/perfil"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary"
                    >
                      <Icon name="person" className="text-base" />
                      Mi perfil
                    </Link>
                    {isOperatorOrAdminRole(user?.rol) && (
                      <Link
                        href="/panel"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary"
                      >
                        <Icon name="dashboard" className="text-base" />
                        Centro operativo
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={logout}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <Icon name="logout" className="text-base" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* --- VISTA CUANDO NO HAY NADIE LOGUEADO --- */
              <Link href="/login" title="Ir a iniciar sesión">
                <Button
                  variant="primary"
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold normal-case tracking-normal shadow-md shadow-primary/20 hover:shadow-primary/30 cursor-pointer"
                >
                  <Icon name="login" className="text-sm" />
                  Iniciar sesión
                </Button>
              </Link>
            )}

            {/* Botón menú móvil (se mantiene igual) */}
            <button
              className="md:hidden text-slate-900 p-2 rounded-full hover:bg-primary/10 transition-colors"
              type="button"
              title={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-panel"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <Icon name={mobileMenuOpen ? "close" : "menu"} />
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Cerrar menú móvil"
          className="md:hidden fixed inset-0 top-16 z-40 bg-slate-900/35"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div
        id="mobile-nav-panel"
        className={`md:hidden absolute left-0 right-0 top-16 z-50 border-b border-primary/10 bg-white shadow-lg transition-all duration-200 ${
          mobileMenuOpen
            ? "max-h-[80vh] opacity-100"
            : "pointer-events-none max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <nav className="px-4 py-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={`mobile-${item.href}`}>
                  <Link
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 text-sm font-semibold ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                    title={item.title}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {isAuthenticated && (
              <>
                <li className="pt-2">
                  <div className="border-t border-slate-100" />
                </li>
                <li>
                  <Link
                    href="/perfil"
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    title="Ir a mi perfil"
                  >
                    Mi perfil
                  </Link>
                </li>
                {isOperatorOrAdminRole(user?.rol) && (
                  <li>
                    <Link
                      href="/panel"
                      className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      title="Ir al centro operativo"
                    >
                      Centro operativo
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
                    title="Cerrar sesión"
                  >
                    Cerrar sesión
                  </button>
                </li>
              </>
            )}
            {!loading && !isAuthenticated && (
              <li className="pt-2">
                <Link
                  href="/login"
                  className="block rounded-lg bg-primary px-3 py-2 text-center text-sm font-bold text-white"
                  title="Ir a iniciar sesión"
                >
                  Iniciar sesión
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
