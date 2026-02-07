"use client";

import { motion } from "framer-motion";
import { Brain, Clock, Globe, MessageSquare, Palette, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics/track-client";
import { LandingEventType } from "@/lib/analytics/types";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState, useRef } from "react";

export function FeaturesGrid() {
  const t = useTranslations("landing.features");
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true, // Cambiamos a loop para que el autoplay sea continuo
    align: "start",
    slidesToScroll: 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAutoplayActive, setIsAutoplayActive] = useState(true);
  const autoplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Pausar autoplay por 40 segundos cuando el usuario interactúa
  const pauseAutoplay = useCallback(() => {
    setIsAutoplayActive(false);

    // Limpiar timer de pausa anterior si existe
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }

    // Reactivar después de 20 segundos
    pauseTimerRef.current = setTimeout(() => {
      setIsAutoplayActive(true);
    }, 15000);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Autoplay: avanzar cada 7.5 segundos
  useEffect(() => {
    if (!emblaApi || !isAutoplayActive) return;

    autoplayTimerRef.current = setInterval(() => {
      emblaApi.scrollNext();
    }, 7500);

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [emblaApi, isAutoplayActive]);

  // Detectar interacciones del usuario para pausar autoplay
  useEffect(() => {
    if (!emblaApi) return;

    const onPointerDown = () => pauseAutoplay();

    emblaApi.on("pointerDown", onPointerDown);

    return () => {
      emblaApi.off("pointerDown", onPointerDown);
    };
  }, [emblaApi, pauseAutoplay]);

  const features = [
    {
      icon: Clock,
      title: t("list.memory.title"),
      description: t("list.memory.description"),
      tier: t("list.memory.tier"),
    },
    {
      icon: Brain,
      title: t("list.emotions.title"),
      description: t("list.emotions.description"),
      tier: t("list.emotions.tier"),
    },
    {
      icon: Palette,
      title: t("list.personalities.title"),
      description: t("list.personalities.description"),
      tier: t("list.personalities.tier"),
    },
    {
      icon: Heart,
      title: t("list.relationships.title"),
      description: t("list.relationships.description"),
      tier: t("list.relationships.tier"),
    },
    {
      icon: MessageSquare,
      title: t("list.proactive.title"),
      description: t("list.proactive.description"),
      tier: t("list.proactive.tier"),
    },
    {
      icon: Globe,
      title: t("list.worlds.title"),
      description: t("list.worlds.description"),
      tier: t("list.worlds.tier"),
    },
  ];

  return (
    <section className="pt-0 pb-12 sm:py-16 md:py-24 lg:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-left lg:text-center mb-12 lg:mb-16 max-w-3xl lg:mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            <span className="text-[#EDEDED] lg:text-foreground">
              {t("title")}{" "}
            </span>
            <span className="text-muted-foreground">
              {t("titleHighlight")}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Carrusel para móvil */}
        <div className="sm:hidden max-w-7xl mx-auto">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex-[0_0_85%] min-w-0 pl-4 first:pl-0"
                  >
                    <Card
                      className="p-5 h-full border-border hover:border-foreground/20 transition-all duration-300 group bg-card/50 backdrop-blur-sm cursor-pointer"
                      onClick={() => {
                        trackEvent({
                          eventType: LandingEventType.FEATURE_CLICK,
                          metadata: {
                            featureName: feature.title,
                            featureIndex: index,
                            featureTier: feature.tier,
                          },
                        }).catch(() => {});
                      }}
                    >
                      <div className="space-y-3">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                          <Icon className="w-5 h-5" strokeWidth={1.5} />
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                          <h3 className="text-base font-semibold">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                          {/* Tier badge */}
                          <div className="pt-1">
                            <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                              {feature.tier}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dots de navegación */}
          <div className="flex justify-center gap-2 mt-6">
            {features.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === selectedIndex
                    ? "bg-foreground w-6"
                    : "bg-muted-foreground/30"
                }`}
                onClick={() => {
                  emblaApi?.scrollTo(index);
                  pauseAutoplay(); // Pausar cuando el usuario hace click en un dot
                }}
                aria-label={`Ir a slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Grid para tablet y desktop */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card
                  className="p-6 h-full border-border hover:border-foreground/20 transition-all duration-300 group bg-card/50 backdrop-blur-sm cursor-pointer"
                  onClick={() => {
                    trackEvent({
                      eventType: LandingEventType.FEATURE_CLICK,
                      metadata: {
                        featureName: feature.title,
                        featureIndex: index,
                        featureTier: feature.tier,
                      },
                    }).catch(() => {});
                  }}
                >
                  <div className="space-y-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                      <Icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                      {/* Tier badge */}
                      <div className="pt-2">
                        <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                          {feature.tier}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
