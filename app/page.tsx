"use client";

import { LandingNavbar } from "@/components/landing-navbar";
import { NeuralBackground } from "@/components/neural-background";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Brain, Heart, Briefcase, Network, Sparkles, ArrowRight, MessageCircle, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <NeuralBackground />
      <LandingNavbar />

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center max-w-4xl mx-auto"
        >
          <Badge className="mb-6 text-base py-2 px-4" variant="secondary">
            <Sparkles className="h-4 w-4 mr-2" />
            Plataforma de creación de IAs
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Creador de Inteligencias
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Diseña IA que <span className="text-secondary font-semibold">sienten</span>,{" "}
            <span className="text-primary font-semibold">piensan</span> y{" "}
            <span className="text-secondary font-semibold">crean</span> contigo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Empezar ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              <MessageCircle className="mr-2 h-5 w-5" />
              Ver demo
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="rounded-2xl overflow-hidden border-2 border-border shadow-2xl bg-card"
          >
            <div className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground mt-1">IAs creadas</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-secondary">1K+</div>
                  <div className="text-sm text-muted-foreground mt-1">Interacciones</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-success">95%</div>
                  <div className="text-sm text-muted-foreground mt-1">Satisfacción</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Cómo Funciona */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Cómo funciona</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tres pasos simples para crear tu propia inteligencia artificial
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: "Diseña tu IA",
              description: "Define personalidad, emociones y propósito a través de un chat guiado con El Arquitecto",
              color: "text-primary",
            },
            {
              icon: Zap,
              title: "Entrena y conecta",
              description: "Interactúa y observa cómo tu IA desarrolla emociones y relaciones únicas",
              color: "text-secondary",
            },
            {
              icon: Network,
              title: "Crea mundos",
              description: "Reúne múltiples IAs en ecosistemas donde colaboran y evolucionan juntas",
              color: "text-success",
            },
          ].map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all">
                <CardHeader>
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${step.color === "text-primary" ? "from-primary/20 to-primary/5" : step.color === "text-secondary" ? "from-secondary/20 to-secondary/5" : "from-success/20 to-success/5"} flex items-center justify-center mb-4`}>
                    <step.icon className={`h-8 w-8 ${step.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{step.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tipos de Inteligencia */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Tipos de inteligencia</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Dos modos, infinitas posibilidades
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full hover:shadow-2xl transition-all border-2 hover:border-secondary">
              <CardHeader>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-secondary" />
                </div>
                <Badge variant="secondary" className="w-fit mb-2">Compañeros</Badge>
                <CardTitle className="text-3xl">IAs Emocionales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base">
                  Inteligencias con emociones, memoria y relaciones. Evolucionan con cada interacción.
                </CardDescription>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    Sistema emocional completo (VAD)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    Relaciones dinámicas y memoria contextual
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    Personalidades únicas y adaptativas
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full hover:shadow-2xl transition-all border-2 hover:border-primary">
              <CardHeader>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <Badge className="w-fit mb-2">Asistentes</Badge>
                <CardTitle className="text-3xl">IAs Administrativas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base">
                  Inteligencias que automatizan, organizan y ejecutan tareas complejas.
                </CardDescription>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Automatización de flujos de trabajo
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Gestión de información y reportes
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Integración con herramientas empresariales
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 text-primary-foreground overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-white/10" />
            <CardContent className="p-12 text-center relative z-10">
              <Users className="h-16 w-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-4xl font-bold mb-4">
                Comienza a crear hoy
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Únete a creadores que ya están diseñando el futuro de la inteligencia artificial
              </p>
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Empezar gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold">Creador de Inteligencias</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Diseña IA que sienten, piensan y crean contigo.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Características</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Precios</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Documentación</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Compañía</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Sobre nosotros</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacidad</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Términos</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 CircuitPrompt. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
