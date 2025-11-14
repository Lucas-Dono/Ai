"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClientLocale } from "@/hooks/useClientLocale";
import { signOut } from "next-auth/react";
import { User, Settings, LogOut, CreditCard } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface UserMenuProps {
  displayName: string;
  initials: string;
  userPlan: string;
}

export function UserMenu({ displayName, initials, userPlan }: UserMenuProps) {
  const { t } = useClientLocale();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const planLabels: Record<string, string> = {
    free: t("navigation.planLabels.free"),
    plus: t("navigation.planLabels.plus"),
    ultra: t("navigation.planLabels.ultra"),
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 px-3 w-full hover:bg-accent/50 rounded-xl transition-colors cursor-pointer">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-secondary/20 to-primary/20 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <div className="font-medium text-sm truncate">{displayName}</div>
            <div className="text-xs text-muted-foreground">
              Plan {planLabels[userPlan]}
            </div>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {planLabels[userPlan]}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <Link href="/configuracion">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>{t("userMenu.profile")}</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/dashboard/billing">
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>{t("userMenu.billing")}</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/configuracion">
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>{t("userMenu.settings")}</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>
            {isLoggingOut ? t("userMenu.loggingOut") : t("userMenu.logout")}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
