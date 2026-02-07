"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, Code, Palette, Users } from "lucide-react";
import { useTranslations } from "next-intl";

export function AreasOfInterest() {
  const t = useTranslations("careers.areas");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const areas = [
    {
      id: "engineering",
      icon: Code,
      title: t("engineering.title"),
      brief: t("engineering.brief"),
      description: t("engineering.description"),
      skills: [
        "React Native (Expo)",
        "Node.js / Express",
        "Prisma",
        "PostgreSQL",
        "OpenAI / Anthropic APIs",
        "TypeScript",
      ],
      requirements: [
        t("engineering.req1"),
        t("engineering.req2"),
        t("engineering.req3"),
        t("engineering.req4"),
      ],
    },
    {
      id: "design",
      icon: Palette,
      title: t("design.title"),
      brief: t("design.brief"),
      description: t("design.description"),
      skills: ["Figma", "Design Systems", "Mobile UX", "Micro-interactions", "Prototyping"],
      requirements: [
        t("design.req1"),
        t("design.req2"),
        t("design.req3"),
        t("design.req4"),
      ],
    },
    {
      id: "community",
      icon: Users,
      title: t("community.title"),
      brief: t("community.brief"),
      description: t("community.description"),
      skills: [
        "Discord / Reddit",
        "Community Management",
        "In-App Community",
        "Content Moderation",
        "Content Creation",
        "Social Media",
        "User Support",
      ],
      requirements: [
        t("community.req1"),
        t("community.req2"),
        t("community.req3"),
        t("community.req4"),
      ],
    },
  ];

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {areas.map((area, index) => {
            const Icon = area.icon;

            return (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="border-border overflow-hidden bg-card/50 backdrop-blur-sm hover:border-foreground/20 transition-all duration-300">
                  {/* Header */}
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === area.id ? null : area.id)
                    }
                    className="w-full p-6 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                            <Icon className="w-5 h-5" strokeWidth={1.5} />
                          </div>
                          <h3 className="text-xl font-semibold">{area.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {area.brief}
                        </p>
                      </div>

                      <motion.div
                        animate={{ rotate: expandedId === area.id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={
                      expandedId === area.id
                        ? { height: "auto", opacity: 1 }
                        : { height: 0, opacity: 0 }
                    }
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 border-t border-border/50 pt-6 space-y-6">
                      {/* Description */}
                      <div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {area.description}
                        </p>
                      </div>

                      {/* Requirements */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm">
                          {t("whatWeLookFor")}
                        </h4>
                        <ul className="space-y-2">
                          {area.requirements.map((req, i) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground flex gap-3"
                            >
                              <span className="text-foreground/50 flex-shrink-0">
                                •
                              </span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Skills */}
                      <div>
                        <h4 className="font-semibold mb-3 text-sm">
                          {t("skills")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {area.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-medium text-muted-foreground border border-border/50"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
