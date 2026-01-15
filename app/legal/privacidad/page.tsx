"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function PrivacidadPage() {
  const t = useTranslations("legal.privacy");

  // Estructura de secciones con numeración
  const sections = [
    { id: "introduction", number: "1" },
    { id: "dataCollection", number: "2", subsections: ["personal", "usage", "technical", "sensitive"] },
    { id: "dataUsage", number: "3", subsections: ["purposes", "legalBasis", "aiProcessing"] },
    { id: "cookies", number: "4" },
    { id: "sharing", number: "5", subsections: ["serviceProviders", "legal", "businessTransfers"] },
    { id: "international", number: "6" },
    { id: "security", number: "7", subsections: ["measures", "encryption", "limitations"] },
    { id: "retention", number: "8" },
    { id: "rights", number: "9", subsections: ["gdpr", "ccpa", "exercise"] },
    { id: "minors", number: "10" },
    { id: "changes", number: "11" },
    { id: "contact", number: "12" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header sencillo */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6 text-neutral-600 dark:text-neutral-400">
              ← {t("backToHome")}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            {t("title")}
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {t("lastUpdated")}: {t("updateDate")}
          </p>
        </div>

        <Separator className="mb-8" />

        {/* Contenido principal */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <div className="text-neutral-700 dark:text-neutral-300 space-y-8">

            {/* Preámbulo */}
            <div className="mb-10">
              <p className="text-base leading-relaxed whitespace-pre-line">
                {t("preamble")}
              </p>
            </div>

            {/* Secciones numeradas */}
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-20">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                  {section.number}. {t(`sections.${section.id}.title`)}
                </h2>

                {/* Content solo si no tiene subsecciones */}
                {!section.subsections && (
                  <div className="text-base leading-relaxed whitespace-pre-line mb-6">
                    {t(`sections.${section.id}.content`)}
                  </div>
                )}

                {/* Subsecciones si existen */}
                {section.subsections && (
                  <div className="ml-6 space-y-6">
                    {section.subsections.map((subsection, idx) => (
                      <div key={subsection}>
                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-3">
                          {section.number}.{idx + 1}. {t(`sections.${section.id}.subsections.${subsection}.title`)}
                        </h3>
                        <div className="text-base leading-relaxed whitespace-pre-line">
                          {t(`sections.${section.id}.subsections.${subsection}.content`)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}

            {/* Información de contacto final */}
            <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 whitespace-pre-line">
                {t("footer.text")}
              </p>
              <Link href="/legal/contacto">
                <Button variant="outline" size="sm">
                  {t("footer.contactButton")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
