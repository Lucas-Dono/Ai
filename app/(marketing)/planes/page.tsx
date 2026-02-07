import { Metadata } from "next";
import { PricingTable } from "@/components/billing/PricingTable";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Planes y Precios - Blaniel",
  description: "Elige el plan perfecto para ti. Desbloquea todo el potencial de tus compañeros IA con características exclusivas.",
};

export default async function PlanesPage() {
  const session = await getServerSession();

  // Si no está autenticado, mostrar planes de todos modos (para marketing)
  // Si está autenticado, obtener su plan actual
  const currentPlan = (session?.user as any)?.plan || "free";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Planes diseñados para ti
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Desde principiantes hasta usuarios avanzados, tenemos el plan perfecto
            para llevar tu experiencia con IA al siguiente nivel
          </p>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="pb-20 px-4">
        <PricingTable
          currentPlan={currentPlan as "free" | "plus" | "ultra"}
          onSelectPlan={async (planId) => {
            "use server";
            // Si el usuario no está autenticado, redirigir a login
            if (!session) {
              redirect("/auth/signin?callbackUrl=/planes");
            }
            // Si está autenticado, esto será manejado por el modal
          }}
        />
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-6">
            <div className="bg-background p-6 rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2">
                ¿Puedo cambiar de plan en cualquier momento?
              </h3>
              <p className="text-muted-foreground">
                Sí, puedes actualizar o cancelar tu plan en cualquier momento.
                Los cambios se aplicarán al final de tu período de facturación actual.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2">
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="text-muted-foreground">
                Aceptamos tarjetas de crédito, débito, Mercado Pago y otros métodos
                de pago locales a través de nuestra plataforma de pago segura.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2">
                ¿Hay algún compromiso a largo plazo?
              </h3>
              <p className="text-muted-foreground">
                No, todos nuestros planes son mensuales sin compromiso. Puedes
                cancelar en cualquier momento y mantendrás acceso hasta el final
                de tu período de facturación.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2">
                ¿Qué pasa con mis datos si cancelo?
              </h3>
              <p className="text-muted-foreground">
                Tus datos permanecen guardados de forma segura. Si regresas y te
                suscribes nuevamente, todo tu contenido estará exactamente como
                lo dejaste.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2">
                ¿Ofrecen descuentos para equipos?
              </h3>
              <p className="text-muted-foreground">
                Sí, ofrecemos planes especiales para equipos y empresas. Contáctanos
                en team@circuitprompt.ai para más información.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Únete a miles de usuarios que ya están creando compañeros IA increíbles
          </p>
          {!session && (
            <a
              href="/auth/signin"
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Comenzar Gratis
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
