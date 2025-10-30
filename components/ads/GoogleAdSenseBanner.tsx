"use client";

/**
 * Google AdSense Banner Component
 * Muestra banner ads de AdSense en la web
 */

import { useEffect } from "react";

interface AdSenseBannerProps {
  adSlot: string; // Tu ad slot ID de AdSense
  adFormat?: "auto" | "rectangle" | "vertical" | "horizontal";
  fullWidthResponsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function GoogleAdSenseBanner({
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
  className = "",
}: AdSenseBannerProps) {
  useEffect(() => {
    try {
      // Push ad to AdSense
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}

/**
 * Uso:
 *
 * 1. Agregar script de AdSense en app/layout.tsx:
 *
 * <Script
 *   async
 *   src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
 *   crossOrigin="anonymous"
 *   strategy="afterInteractive"
 * />
 *
 * 2. Usar componente:
 *
 * <GoogleAdSenseBanner
 *   adSlot="1234567890"
 *   adFormat="horizontal"
 * />
 */
