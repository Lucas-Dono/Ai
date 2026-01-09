"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export function LandingNav() {
  const t = useTranslations("landing.nav");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Google Play URL from environment variable
  const googlePlayUrl = process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/docs", labelKey: "docs" },
    { href: "/pricing", labelKey: "pricing" },
    { href: "/community", labelKey: "community" },
    { href: "/careers", labelKey: "careers" },
    { href: "/sponsors", labelKey: "sponsors" },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2 group">
            <div className="w-7 h-7 flex items-center justify-center group-hover:opacity-90 transition-opacity">
              <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
            </div>
            <span className="font-semibold text-base">{t("logo")}</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
              >
                {t(link.labelKey)}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {/* Google Play Button - Only show if URL is configured */}
            {googlePlayUrl && (
              <a
                href={googlePlayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black hover:bg-black/90 text-white text-xs font-medium transition-all duration-200 hover:scale-105"
                title="Descargar en Google Play"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <span className="hidden lg:inline">Google Play</span>
                <Smartphone className="lg:hidden w-3.5 h-3.5" />
              </a>
            )}

            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                {t("login")}
              </Button>
            </Link>
            <Link href="/registro">
              <Button
                size="sm"
                className="bg-foreground text-background hover:bg-foreground/90 text-sm font-medium"
              >
                {t("getStarted")}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  {t(link.labelKey)}
                </a>
              ))}

              <div className="pt-4 mt-4 border-t border-border space-y-2">
                {/* Google Play Button Mobile - Only show if URL is configured */}
                {googlePlayUrl && (
                  <a
                    href={googlePlayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-black hover:bg-black/90 text-white text-sm font-medium transition-colors w-full"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                    </svg>
                    Descargar en Google Play
                  </a>
                )}

                <Link href="/login" className="block">
                  <Button variant="outline" size="sm" className="w-full text-sm font-medium border-border">
                    {t("login")}
                  </Button>
                </Link>
                <Link href="/registro" className="block">
                  <Button
                    size="sm"
                    className="w-full bg-foreground text-background hover:bg-foreground/90 text-sm font-medium"
                  >
                    {t("getStarted")}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
