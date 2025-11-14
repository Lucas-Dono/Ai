"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Star, Quote, Shield, Github, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

export function SocialProof() {
  const t = useTranslations("landing.socialProof");

  const testimonials = [
    {
      rating: 5,
    },
    {
      rating: 5,
    },
    {
      rating: 5,
    },
    {
      rating: 5,
    },
    {
      rating: 5,
    },
  ];

  const trustBadges = [
    {
      icon: Shield,
    },
    {
      icon: Github,
    },
    {
      icon: Zap,
    },
  ];

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Stats - Professional Version */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="p-6 text-center border border-border hover:border-foreground/20 transition-all duration-300 bg-card/50 backdrop-blur-sm">
                  <div className="text-3xl md:text-4xl font-bold mb-1">
                    {t(`stats.stat${index + 1}.value`)}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground font-medium">
                    {t(`stats.stat${index + 1}.label`)}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {t("testimonials.title")}{" "}
            <span className="text-muted-foreground">
              {t("testimonials.titleHighlight")}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("testimonials.subtitle")}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="p-6 h-full border border-border hover:border-foreground/20 transition-all duration-300 group bg-card/50 backdrop-blur-sm relative">
                {/* Quote icon */}
                <Quote className="absolute top-4 right-4 w-6 h-6 text-muted-foreground/10" strokeWidth={1.5} />

                {/* Avatar & Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{t(`testimonials.list.testimonial${index + 1}.name`)}</h4>
                    <p className="text-xs text-muted-foreground">
                      {t(`testimonials.list.testimonial${index + 1}.role`)}
                    </p>
                    {/* Stars */}
                    <div className="flex gap-0.5 mt-1.5">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 fill-foreground text-foreground"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Testimonial text */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {t(`testimonials.list.testimonial${index + 1}.text`)}
                </p>

                {/* Highlight badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-muted border border-border">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                  <span className="text-xs font-medium">
                    {t(`testimonials.list.testimonial${index + 1}.highlight`)}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-4xl mx-auto p-8 md:p-12 border border-border bg-card/50 backdrop-blur-sm">
            <h3 className="text-xl md:text-2xl font-bold text-center mb-8">
              {t("trust.title")}
            </h3>

            <div className="grid md:grid-cols-3 gap-8">
              {trustBadges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="text-center"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <h4 className="font-semibold text-sm mb-2">{t(`trust.badges.badge${index + 1}.title`)}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t(`trust.badges.badge${index + 1}.description`)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Footer text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground">
            {t("footer")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
