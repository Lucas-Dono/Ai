"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, Globe, Clock, Repeat } from "lucide-react";

export function OurAudience() {
  const stats = [
    {
      icon: Users,
      value: "100K",
      label: "Meta MAU año 1",
      sublabel: "Proyección conservadora",
    },
    {
      icon: Clock,
      value: "25-35 min",
      label: "Sesión promedio target",
      sublabel: "Ref: Character.AI avg",
    },
    {
      icon: Repeat,
      value: "4-6x",
      label: "Sesiones/semana objetivo",
      sublabel: "Benchmark industria IA",
    },
    {
      icon: TrendingUp,
      value: "75-85%",
      label: "Early adopters tech",
      sublabel: "Perfil audiencia target",
    },
  ];

  const demographics = [
    {
      category: "Edad",
      segments: [
        { label: "18-24 años", value: "15%" },
        { label: "25-34 años", value: "42%" },
        { label: "35-45 años", value: "30%" },
        { label: "45+ años", value: "13%" },
      ],
    },
    {
      category: "Geografía",
      segments: [
        { label: "Argentina", value: "40%" },
        { label: "México", value: "25%" },
        { label: "USA", value: "20%" },
        { label: "Brasil", value: "10%" },
        { label: "Otros LATAM", value: "5%" },
      ],
    },
    {
      category: "Ingresos",
      segments: [
        { label: "$40K-60K USD/año", value: "28%" },
        { label: "$60K-80K USD/año", value: "30%" },
        { label: "$80K-100K USD/año", value: "25%" },
        { label: "$100K+ USD/año", value: "17%" },
      ],
    },
  ];

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-muted/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Audiencia Target:{" "}
            <span className="text-blue-600">Alto Poder Adquisitivo</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Basado en benchmarks de Character.AI, Replika y sector de IA conversacional
          </p>
        </motion.div>

        {/* Key Stats Grid */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="p-6 border border-border hover:border-foreground/20 transition-all duration-300 bg-card/50 backdrop-blur-sm h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-foreground/5 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <div className="text-3xl font-bold mb-1 text-foreground">{stat.value}</div>
                        <div className="text-sm font-semibold mb-1 text-foreground">{stat.label}</div>
                        <div className="text-xs text-foreground/60 font-medium">{stat.sublabel}</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Demographics Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-6xl mx-auto"
        >
          <Card className="p-8 border border-border bg-card/50 backdrop-blur-sm">
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">Perfil Demográfico Target</h3>
              <p className="text-sm text-muted-foreground">
                Basado en datos públicos de Character.AI (20M+ usuarios) y Replika (10M+ usuarios)
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {demographics.map((demo, index) => (
                <div key={index}>
                  <h4 className="text-sm font-bold mb-4 text-foreground uppercase tracking-wide">
                    {demo.category}
                  </h4>
                  <div className="space-y-3">
                    {demo.segments.map((segment, segIndex) => (
                      <div key={segIndex}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-foreground/70 font-medium">
                            {segment.label}
                          </span>
                          <span className="text-sm font-bold text-foreground">{segment.value}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-foreground rounded-full transition-all duration-500"
                            style={{ width: segment.value }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Behavioral Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-6xl mx-auto mt-8"
        >
          <Card className="p-8 border border-border bg-blue-500/5 backdrop-blur-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Benchmarks de Industria</h3>
              <p className="text-sm text-muted-foreground">Promedios del sector AI conversacional (Character.AI, Replika, Chai)</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                  <h4 className="text-lg font-semibold">Comportamiento de Compra</h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>
                      <strong className="text-foreground">85-90%</strong> compran online regularmente
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>
                      <strong className="text-foreground">70-80%</strong> dispuestos a probar nuevas marcas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>
                      <strong className="text-foreground">80%+</strong> influenciados por recomendaciones
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>
                      <strong className="text-foreground">60-70%</strong> educación universitaria
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-6 h-6 text-blue-600" />
                  <h4 className="text-lg font-semibold">Engagement Típico</h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>
                      <strong className="text-foreground">40-50 mensajes/día</strong> usuarios activos
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>
                      <strong className="text-foreground">65-75%</strong> retención diaria
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>
                      Mayoría early adopters de IA
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>
                      Valoran autenticidad sobre publicidad tradicional
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            El sector de IA conversacional muestra <span className="text-foreground font-semibold">25-35 min promedio</span> por sesión -
            significativamente más que redes sociales (8-12 min). El target perfecto
            para brands que buscan <span className="text-foreground font-semibold">engagement profundo y conversiones reales</span>.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
