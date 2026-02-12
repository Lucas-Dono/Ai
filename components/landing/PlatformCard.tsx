"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, ArrowRight } from "lucide-react";

interface PlatformCardProps {
  platform: "android" | "minecraft";
  title: string;
  description: string;
  benefits: string[];
  downloadUrl: string;
  icon: ReactNode;
  accentColor: string;
  badge?: string;
  onDownload?: (platform: "android" | "minecraft") => void;
}

export function PlatformCard({
  platform,
  title,
  description,
  benefits,
  downloadUrl,
  icon,
  accentColor,
  badge,
  onDownload,
}: PlatformCardProps) {
  const handleDownload = () => {
    if (onDownload) {
      onDownload(platform);
    }
    window.open(downloadUrl, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="relative overflow-hidden h-full flex flex-col border border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
        {/* Gradiente de fondo sutil */}
        <div
          className="absolute top-0 left-0 right-0 h-32 opacity-10"
          style={{
            background: `linear-gradient(to bottom, ${accentColor}, transparent)`,
          }}
        />

        <div className="p-6 flex flex-col flex-1 relative z-10">
          {/* Badge superior derecho */}
          {badge && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold">
              {badge}
            </div>
          )}

          {/* Icono */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-md text-white"
            style={{ backgroundColor: accentColor }}
          >
            <div className="w-10 h-10">{icon}</div>
          </div>

          {/* Título y descripción */}
          <h3 className="text-2xl font-bold mb-3">{title}</h3>
          <p className="text-muted-foreground mb-6 text-sm">{description}</p>

          {/* Beneficios */}
          <ul className="space-y-3 mb-8 flex-1">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  style={{ color: accentColor }}
                />
                <span className="text-sm">{benefit}</span>
              </li>
            ))}
          </ul>

          {/* Botón de descarga */}
          <Button
            size="lg"
            className="w-full text-white font-semibold group-hover:scale-105 transition-transform"
            style={{ backgroundColor: accentColor }}
            onClick={handleDownload}
          >
            <Download className="w-5 h-5 mr-2" />
            Descargar {title}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
