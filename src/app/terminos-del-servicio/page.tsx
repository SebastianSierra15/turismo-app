import Link from "next/link";
import Navbar from "@/components/shared/organisms/Navbar";
import Footer from "@/components/shared/organisms/Footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background-light text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-12 space-y-8">
        <header className="space-y-3">
          <h1 className="text-4xl font-extrabold">Términos del servicio</h1>
          <p className="text-slate-600">
            Al usar Amaturis aceptas estas condiciones de uso para reservas,
            pagos y operación de la plataforma.
          </p>
        </header>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Cuenta y acceso</h2>
          <p className="text-slate-700">
            Eres responsable de la seguridad de tu cuenta y de mantener tus
            credenciales actualizadas.
          </p>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Reservas y pagos</h2>
          <p className="text-slate-700">
            Las reservas se confirman según disponibilidad del paquete y
            validación del pago.
          </p>
          <p className="text-slate-700">
            Las políticas de cancelación pueden variar por plan y operador.
          </p>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Uso permitido</h2>
          <p className="text-slate-700">
            No está permitido usar la plataforma para fraude, suplantación o
            extracción no autorizada de datos.
          </p>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Contacto</h2>
          <p className="text-slate-700">
            Si tienes dudas contractuales o sobre reembolsos, contáctanos en el{" "}
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
