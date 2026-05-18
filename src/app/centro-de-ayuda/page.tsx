import Link from "next/link";
import Navbar from "@/components/shared/organisms/Navbar";
import Footer from "@/components/shared/organisms/Footer";

const faqItems = [
  {
    question: "¿Cómo reservo un plan?",
    answer:
      "Selecciona un plan, define fecha y viajeros, completa el pago y recibirás confirmación en tu perfil.",
  },
  {
    question: "¿Cómo cancelo una reserva?",
    answer:
      "En tu perfil entra a Mis reservas, abre el detalle y usa la opción Cancelar reserva según la política del plan.",
  },
  {
    question: "¿Dónde veo mis comprobantes?",
    answer:
      "En el detalle de cada reserva encontrarás el estado y la información de pago asociada.",
  },
  {
    question: "¿Cómo contacto soporte?",
    answer:
      "Usa el chat de la plataforma o escribe al correo soporte@amaturis.com con el ID de reserva.",
  },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-background-light text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-12 space-y-8">
        <header className="space-y-3">
          <h1 className="text-4xl font-extrabold">Centro de ayuda</h1>
          <p className="text-slate-600">
            Resolvemos dudas sobre cuenta, reservas, pagos y políticas de uso.
          </p>
        </header>

        <section className="grid gap-4">
          {faqItems.map((item) => (
            <article
              key={item.question}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <h2 className="text-lg font-bold">{item.question}</h2>
              <p className="mt-2 text-slate-700">{item.answer}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
          <h2 className="text-xl font-bold">Recursos legales</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/politica-de-privacidad" className="text-primary font-semibold">
              Política de privacidad
            </Link>
            <Link href="/terminos-del-servicio" className="text-primary font-semibold">
              Términos del servicio
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
