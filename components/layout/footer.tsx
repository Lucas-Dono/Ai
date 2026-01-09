"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Heart, Github, Twitter, Mail, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: t("sections.product.title"),
      links: [
        { label: t("sections.product.features"), href: "/dashboard" },
        { label: t("sections.product.pricing"), href: "/dashboard/billing/plans" },
        { label: t("sections.product.community"), href: "/community" },
      ],
    },
    {
      title: t("sections.resources.title"),
      links: [
        { label: t("sections.resources.help"), href: "/legal/ayuda" },
        { label: t("sections.resources.guides"), href: "/legal/ayuda" },
        { label: t("sections.resources.api"), href: "/api/docs" },
        { label: t("sections.resources.status"), href: "/status" },
      ],
    },
    {
      title: t("sections.company.title"),
      links: [
        { label: t("sections.company.about"), href: "/legal/sobre-nosotros" },
        { label: t("sections.company.blog"), href: "/community" },
        { label: t("sections.company.contact"), href: "/legal/contacto" },
      ],
    },
    {
      title: t("sections.legal.title"),
      links: [
        { label: t("sections.legal.terms"), href: "/legal/terminos" },
        { label: t("sections.legal.privacy"), href: "/legal/privacidad" },
        { label: t("sections.legal.cookies"), href: "/legal/privacidad#cookies" },
      ],
    },
  ];

  const socialLinks = [
    {
      href: "https://github.com/circuitprompt",
      icon: Github,
      label: t("socialLinks.github"),
      ariaLabel: "GitHub"
    },
    {
      href: "https://twitter.com/circuitprompt",
      icon: Twitter,
      label: t("socialLinks.twitter"),
      ariaLabel: "Twitter"
    },
    {
      href: "mailto:support@creadorinteligencias.com",
      icon: Mail,
      label: t("socialLinks.email"),
      ariaLabel: "Email"
    },
    {
      href: "/legal/sobre-nosotros",
      icon: Globe,
      label: t("socialLinks.website"),
      ariaLabel: "Website"
    }
  ];

  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {sections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          {/* Brand & Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-sm text-muted-foreground">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-6 h-6 flex items-center justify-center group-hover:opacity-90 transition-opacity">
                <img src="/logo.png" alt="Blaniel Logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="font-semibold text-foreground">Blaniel</span>
            </Link>
            <span className="hidden sm:inline">•</span>
            <span>© {currentYear}</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              {t("madeWith")} <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" />
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  target={social.href.startsWith('http') ? "_blank" : undefined}
                  rel={social.href.startsWith('http') ? "noopener noreferrer" : undefined}
                  className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
                  aria-label={social.ariaLabel}
                  title={social.label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Language & Region */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            {t("language")}: Español (ES) • {t("region")}: Global
          </p>
        </div>
      </div>
    </footer>
  );
}
