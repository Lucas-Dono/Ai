"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowRight, MapPin, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

export function OpenPositions() {
  const t = useTranslations("careers.positions");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const positions = [
    {
      id: "fullstack",
      title: t("fullstack.title"),
      type: t("fullstack.type"),
      location: t("fullstack.location"),
      compensation: t("fullstack.compensation"),
      brief: t("fullstack.brief"),
      description: t("fullstack.description"),
      skills: [
        "React Native (Expo)",
        "Node.js / Express",
        "Prisma",
        "PostgreSQL",
        "OpenAI / Anthropic APIs",
        "TypeScript",
      ],
      responsibilities: [
        t("fullstack.resp1"),
        t("fullstack.resp2"),
        t("fullstack.resp3"),
        t("fullstack.resp4"),
      ],
      requirements: [
        t("fullstack.req1"),
        t("fullstack.req2"),
        t("fullstack.req3"),
        t("fullstack.req4"),
      ],
    },
    {
      id: "designer",
      title: t("designer.title"),
      type: t("designer.type"),
      location: t("designer.location"),
      compensation: t("designer.compensation"),
      brief: t("designer.brief"),
      description: t("designer.description"),
      skills: ["Figma", "Design Systems", "Mobile UX", "Micro-interactions", "Prototyping"],
      responsibilities: [
        t("designer.resp1"),
        t("designer.resp2"),
        t("designer.resp3"),
        t("designer.resp4"),
      ],
      requirements: [
        t("designer.req1"),
        t("designer.req2"),
        t("designer.req3"),
        t("designer.req4"),
      ],
    },
    {
      id: "community",
      title: t("community.title"),
      type: t("community.type"),
      location: t("community.location"),
      compensation: t("community.compensation"),
      brief: t("community.brief"),
      description: t("community.description"),
      skills: [
        "Discord / Reddit",
        "Community Management",
        "Content Creation",
        "Bilingual (ES/EN)",
        "User Support",
      ],
      responsibilities: [
        t("community.resp1"),
        t("community.resp2"),
        t("community.resp3"),
        t("community.resp4"),
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
          {positions.map((position, index) => (
            <motion.div
              key={position.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="border-border overflow-hidden bg-card/50 backdrop-blur-sm hover:border-foreground/20 transition-all duration-300">
                {/* Header */}
                <button
                  onClick={() =>
                    setExpandedId(expandedId === position.id ? null : position.id)
                  }
                  className="w-full p-6 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{position.title}</h3>
                        <span className="px-2 py-1 rounded-lg bg-muted text-xs font-medium text-muted-foreground">
                          {position.type}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{position.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{position.compensation}</span>
                        </div>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {position.brief}
                      </p>
                    </div>

                    <motion.div
                      animate={{ rotate: expandedId === position.id ? 180 : 0 }}
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
                    expandedId === position.id
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
                        {position.description}
                      </p>
                    </div>

                    {/* Responsibilities */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">
                        {t("whatYouWillDo")}
                      </h4>
                      <ul className="space-y-2">
                        {position.responsibilities.map((resp, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground flex gap-3"
                          >
                            <span className="text-foreground/50 flex-shrink-0">
                              •
                            </span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">
                        {t("whatWeLookingFor")}
                      </h4>
                      <ul className="space-y-2">
                        {position.requirements.map((req, i) => (
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
                        {t("requiredSkills")}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {position.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-medium text-muted-foreground border border-border/50"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div className="pt-4">
                      <a href={`mailto:jobs@blaniel.com?subject=Application for ${position.title}`}>
                        <Button className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90">
                          {t("applyButton")}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
