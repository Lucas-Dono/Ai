"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function LandingFooter() {
  const t = useTranslations("landing.footer");

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center text-background font-bold text-sm">
                AI
              </div>
              <span className="font-semibold text-base">{t("brand")}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("description")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">{t("product")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  {t("features")}
                </a>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  {t("pricing")}
                </Link>
              </li>
              <li>
                <a href="#demo" className="hover:text-foreground transition-colors">
                  {t("demo")}
                </a>
              </li>
              <li>
                <Link href="/docs" className="hover:text-foreground transition-colors">
                  {t("documentation")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold mb-4">{t("community")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/community" className="hover:text-foreground transition-colors">
                  {t("community")}
                </Link>
              </li>
              <li>
                <Link href="/community/marketplace/characters" className="hover:text-foreground transition-colors">
                  {t("marketplace")}
                </Link>
              </li>
              <li>
                <a
                  href="https://discord.gg/your-discord"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  {t("discord")}
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/your-twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  {t("twitter")}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">{t("legal")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-foreground transition-colors">
                  {t("cookies")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {t("copyright")}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a
              href="https://github.com/your-repo"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {t("github")}
            </a>
            <a
              href="https://twitter.com/your-twitter"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {t("twitter")}
            </a>
            <a
              href="https://discord.gg/your-discord"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {t("discord")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
