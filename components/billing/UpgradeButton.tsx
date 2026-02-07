"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Crown, Zap } from "lucide-react";
import { usePaymentModal } from "@/hooks/usePaymentModal";
import { cn } from "@/lib/utils";

interface UpgradeButtonProps {
  variant?: "default" | "outline" | "ghost" | "gradient";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  currentPlan?: "free" | "plus" | "ultra";
  showIcon?: boolean;
}

export function UpgradeButton({
  variant = "gradient",
  size = "default",
  className,
  children,
  currentPlan = "free",
  showIcon = true,
}: UpgradeButtonProps) {
  const { open } = usePaymentModal();

  const getIcon = () => {
    if (!showIcon) return null;
    switch (currentPlan) {
      case "free":
        return <Crown className="w-4 h-4" />;
      case "plus":
        return <Zap className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const defaultText = currentPlan === "free"
    ? "Mejorar Plan"
    : currentPlan === "plus"
    ? "Mejorar a Ultra"
    : "Ver Planes";

  return (
    <Button
      onClick={() => open(currentPlan)}
      variant={variant === "gradient" ? "default" : variant}
      size={size}
      className={cn(
        variant === "gradient" &&
          "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300",
        className
      )}
    >
      {showIcon && getIcon()}
      <span className={showIcon ? "ml-2" : ""}>
        {children || defaultText}
      </span>
    </Button>
  );
}
