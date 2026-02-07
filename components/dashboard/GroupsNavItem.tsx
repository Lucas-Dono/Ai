"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, ChevronDown, Hash } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Group {
  id: string;
  name: string;
  _count?: {
    messages: number;
  };
  members: Array<{
    memberType: string;
  }>;
  lastMessageAt?: Date;
}

interface GroupsNavItemProps {
  label: string;
  isActive: boolean;
}

export function GroupsNavItem({ label, isActive }: GroupsNavItemProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-expand when in a group route
  useEffect(() => {
    if (pathname.startsWith("/dashboard/grupos/") && pathname.length > "/dashboard/grupos/".length) {
      setIsExpanded(true);
    }
  }, [pathname]);

  // Fetch user's groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("/api/groups/user-groups");
        if (response.ok) {
          const data = await response.json();
          setGroups(data.groups || []);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      {/* Main Groups Item */}
      <div className="relative">
        <Link href="/dashboard/grupos" data-tour="groups-link">
          <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
          >
            <Network className="h-5 w-5" />
            <span className="font-medium flex-1">{label}</span>

            {groups.length > 0 && (
              <button
                onClick={handleToggle}
                className="p-1 hover:bg-background/10 rounded transition-colors"
                aria-label={isExpanded ? "Contraer grupos" : "Expandir grupos"}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>
            )}
          </motion.div>
        </Link>
      </div>

      {/* Expandable Groups List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-4">
              {isLoading ? (
                <div className="px-4 py-2 text-xs text-muted-foreground">
                  Cargando grupos...
                </div>
              ) : groups.length === 0 ? (
                <div className="px-4 py-2 text-xs text-muted-foreground">
                  No tienes grupos aún
                </div>
              ) : (
                groups.map((group) => {
                  const isGroupActive = pathname === `/dashboard/grupos/${group.id}`;
                  const aiCount = group.members.filter(m => m.memberType === "agent").length;

                  return (
                    <Link key={group.id} href={`/dashboard/grupos/${group.id}`}>
                      <motion.div
                        whileHover={{ x: 2 }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm",
                          isGroupActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-accent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate flex-1">{group.name}</span>
                        {aiCount > 0 && (
                          <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                            {aiCount}
                          </span>
                        )}
                      </motion.div>
                    </Link>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
