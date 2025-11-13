/**
 * Docs Navigation
 * Previous/Next buttons for better navigation flow
 * Similar to Next.js, React, and Stripe docs
 */

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DocsNavigationProps {
  previous?: {
    title: string;
    href: string;
  };
  next?: {
    title: string;
    href: string;
  };
}

export function DocsNavigation({ previous, next }: DocsNavigationProps) {
  if (!previous && !next) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16 pt-8 border-t border-border">
      {/* Previous */}
      {previous ? (
        <Link href={previous.href}>
          <Card className="p-6 hover:border-foreground/20 transition-all cursor-pointer h-full">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <ArrowLeft className="w-3 h-3" />
              <span>Anterior</span>
            </div>
            <p className="font-medium">{previous.title}</p>
          </Card>
        </Link>
      ) : (
        <div /> // Empty div to maintain grid layout
      )}

      {/* Next */}
      {next && (
        <Link href={next.href}>
          <Card className="p-6 hover:border-foreground/20 transition-all cursor-pointer h-full text-right">
            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mb-2">
              <span>Siguiente</span>
              <ArrowRight className="w-3 h-3" />
            </div>
            <p className="font-medium">{next.title}</p>
          </Card>
        </Link>
      )}
    </div>
  );
}
