/**
 * Refund Policy - Public legal page
 * Shows transparent, honest refund policy
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Check, AlertCircle, Calculator } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Badge className="mb-4 bg-blue-500/10 text-blue-600 border-blue-500/20">
          Legal
        </Badge>
        <h1 className="text-4xl font-bold mb-2">Política de Reembolso Proporcional</h1>
        <p className="text-muted-foreground">
          Última actualización: Enero 2025 • 100% Transparente
        </p>
      </div>

      {/* Summary Card */}
      <Card className="p-6 mb-8 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent border-2 border-blue-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Resumen Ejecutivo</h2>
            <p className="text-muted-foreground mb-4">
              Ofrecemos una política de reembolso proporcional de 14 días justa y transparente
              que protege tanto al usuario como a la sostenibilidad del servicio.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span>Reembolso en 14 días</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span>Solo pagas lo que usas</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span>100% Transparente</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span>Procesamiento 3-5 días</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Section 1 */}
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Período de Elegibilidad</h2>
          <Card className="p-6">
            <p className="mb-4">
              Los usuarios tienen <strong>14 días naturales</strong> desde la fecha de pago
              para solicitar un reembolso proporcional.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Ejemplo:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Fecha de suscripción: 1 de enero</li>
                <li>• Último día para reembolso: 14 de enero (23:59 UTC)</li>
              </ul>
            </div>
          </Card>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-2xl font-bold mb-4">2. Cálculo del Reembolso</h2>
          <Card className="p-6">
            <div className="mb-6">
              <p className="mb-4">El reembolso se calcula de la siguiente manera:</p>
              <div className="bg-blue-500/10 border-2 border-blue-500/20 rounded-lg p-4">
                <p className="font-mono text-lg mb-2">
                  <strong>Reembolso = Pago Total - Costos de Uso Real</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Donde:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Pago Total = Monto pagado por el plan mensual</li>
                  <li>• Costos de Uso Real = Suma de todos los costos de IA consumidos</li>
                </ul>
              </div>
            </div>

            <h3 className="font-semibold mb-3">Costos por Feature:</h3>
            <div className="space-y-2">
              <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm">Mensaje de texto simple (~600 tokens)</span>
                <span className="font-medium text-sm">$0.001</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm">Mensaje con contexto extendido</span>
                <span className="font-medium text-sm">$0.002</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm">Análisis de imagen (visión AI)</span>
                <span className="font-medium text-sm">$0.05</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm">Mensaje de voz (generación + transcripción)</span>
                <span className="font-medium text-sm">$0.17</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm">Generación de imagen (Flux Ultra)</span>
                <span className="font-medium text-sm">$0.12</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              * Los costos incluyen API de IA (Mistral Small, ElevenLabs, Flux Ultra), infraestructura,
              almacenamiento y desarrollo del sistema.
            </p>
          </Card>
        </section>

        {/* Section 3 - Examples */}
        <section>
          <h2 className="text-2xl font-bold mb-4">3. Ejemplos Prácticos</h2>

          <div className="space-y-4">
            <Card className="p-6 border-2 border-green-500/20 bg-green-500/5">
              <div className="flex items-start gap-3 mb-4">
                <Calculator className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1 text-green-700 dark:text-green-400">
                    Caso 1: Usuario con poco uso
                  </h3>
                  <p className="text-sm text-muted-foreground">Ejemplo de reembolso favorable</p>
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">Plus ($5/mes)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duración:</span>
                  <span className="font-medium">3 días de uso</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uso:</span>
                  <span className="font-medium">50 mensajes + 2 imágenes</span>
                </div>
                <div className="border-t border-border pt-2 mt-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>• 50 mensajes × $0.001</span>
                  <span>$0.05</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>• 2 imágenes × $0.05</span>
                  <span>$0.10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Costo de uso:</span>
                  <span className="font-medium text-orange-600">$0.15</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Reembolso:</span>
                  <span className="text-green-600">$4.85 (97%)</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-red-500/20 bg-red-500/5">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1 text-red-700 dark:text-red-400">
                    Caso 2: Usuario con uso intensivo
                  </h3>
                  <p className="text-sm text-muted-foreground">Ejemplo sin reembolso</p>
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">Plus ($5/mes)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duración:</span>
                  <span className="font-medium">10 días de uso</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uso:</span>
                  <span className="font-medium">3000 mensajes + 20 imágenes + 10 voz + 5 gen</span>
                </div>
                <div className="border-t border-border pt-2 mt-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>• 3000 mensajes × $0.001</span>
                  <span>$3.00</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>• 20 imágenes × $0.05</span>
                  <span>$1.00</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>• 10 voz × $0.17</span>
                  <span>$1.70</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>• 5 gen. imágenes × $0.12</span>
                  <span>$0.60</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Costo de uso:</span>
                  <span className="font-medium text-orange-600">$6.30</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Reembolso:</span>
                  <span className="text-red-600">$0 (uso excedió pago)</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">
                Nota: Este es un caso de uso extremadamente intensivo. No cobramos la diferencia,
                el usuario solo pierde el pago inicial ($5).
              </p>
            </Card>
          </div>
        </section>

        {/* Section 4 - Process */}
        <section>
          <h2 className="text-2xl font-bold mb-4">4. Proceso de Solicitud</h2>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Solicitar reembolso</h4>
                  <p className="text-sm text-muted-foreground">
                    Ve a Dashboard → Billing → Cancelar Suscripción y selecciona
                    "Solicitar reembolso proporcional"
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Revisión automática</h4>
                  <p className="text-sm text-muted-foreground">
                    Recibirás un email con el desglose detallado de uso y el cálculo del reembolso
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Procesamiento</h4>
                  <p className="text-sm text-muted-foreground">
                    El reembolso se procesa en 3-5 días hábiles al método de pago original
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">
                ¿Por qué no ofrecen 7 días gratis o reembolso del 100%?
              </h3>
              <p className="text-sm text-muted-foreground">
                Como startup que depende de APIs de IA con costos reales por mensaje,
                un reembolso del 100% sin medir uso nos llevaría a la bancarrota.
                Nuestra política es justa: solo pagas por lo que usas.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">
                ¿Cómo sé que el cálculo es correcto?
              </h3>
              <p className="text-sm text-muted-foreground">
                En tu dashboard puedes ver el desglose exacto de cada mensaje, imagen y
                costo en tiempo real. Es 100% transparente y actualizamos cada 30 segundos.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">
                ¿Es esto legal?
              </h3>
              <p className="text-sm text-muted-foreground">
                Sí, 100%. Es similar a la política de AWS, Google Cloud, y otros servicios
                basados en consumo. Cumplimos con leyes de Argentina, Europa (GDPR),
                USA (FTC) y Brasil. Lo importante es la transparencia, y nosotros la garantizamos.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">
                ¿Cuándo podrán ofrecer trial gratis?
              </h3>
              <p className="text-sm text-muted-foreground">
                Cuando tengamos suficiente capital y usuarios pagos para absorber el riesgo
                de abuso. Nuestro objetivo es implementarlo en 6-12 meses después del lanzamiento.
              </p>
            </Card>
          </div>
        </section>

        {/* Contact */}
        <Card className="p-6 bg-blue-500/5 border-blue-500/20">
          <h3 className="font-semibold mb-2">Contacto</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Para solicitar reembolsos o consultas:
          </p>
          <ul className="text-sm space-y-1">
            <li>
              <strong>Email:</strong>{" "}
              <a href="mailto:billing@creador-ia.com" className="text-primary hover:underline">
                billing@creador-ia.com
              </a>
            </li>
            <li>
              <strong>Dashboard:</strong> /dashboard/billing
            </li>
            <li>
              <strong>Tiempo de respuesta:</strong> 24-48 horas
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
