import Link from "next/link";
import Navbar from "@/components/shared/organisms/Navbar";
import Footer from "@/components/shared/organisms/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background-light text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-12 space-y-8">
        <header className="space-y-3">
          <h1 className="text-4xl font-extrabold">Política de privacidad</h1>
          <p className="text-slate-600">
            Esta política explica cómo Amaturis recopila, usa y protege tus
            datos personales cuando utilizas la plataforma.
          </p>
        </header>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Datos que recopilamos</h2>
          <p className="text-slate-700">
            Recopilamos datos de identificación, contacto, historial de
            reservas y preferencias de viaje para operar la plataforma.
          </p>
          <p className="text-slate-700">
            También registramos datos técnicos mínimos de navegación para
            seguridad y mejora del servicio.
          </p>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Uso de la información</h2>
          <p className="text-slate-700">
            Usamos tus datos para autenticarte, gestionar reservas, procesar
            pagos, enviarte notificaciones y brindarte soporte.
          </p>
          <p className="text-slate-700">
            No vendemos tus datos personales a terceros.
          </p>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Tus derechos</h2>
          <p className="text-slate-700">
            Puedes solicitar acceso, actualización o eliminación de tus datos,
            de acuerdo con la normativa aplicable.
          </p>
          <p className="text-slate-700">
            Para ejercer estos derechos, usa el{" "}
            <Link href="/centro-de-ayuda" className="font-semibold text-primary">
              centro de ayuda
            </Link>
            .
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
