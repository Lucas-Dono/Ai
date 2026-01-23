"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserPlus,
  UserCheck,
  UserMinus,
  Loader2,
  Bell,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { friendshipEvents } from "@/lib/events/friendship-events";

interface FriendRequest {
  id: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
  };
}

interface FriendRequestsPanelProps {
  className?: string;
  popoverSide?: "top" | "bottom";
  popoverAlign?: "start" | "end";
}

export function FriendRequestsPanel({ className, popoverSide = "bottom", popoverAlign = "end" }: FriendRequestsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar conteo al montar
  useEffect(() => {
    fetchCount();
    // Polling cada 30 segundos
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cargar solicitudes cuando se abre el panel
  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const fetchCount = async () => {
    try {
      const response = await fetch("/api/friends/requests/count");
      if (response.ok) {
        const data = await response.json();
        setCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching count:", error);
    }
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/friends/requests?type=received&limit=5");
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const response = await fetch(`/api/friends/requests/${requestId}/accept`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        // Encontrar el request para obtener el userId del solicitante
        const request = requests.find((r) => r.id === requestId);
        if (request) {
          // Emitir evento para sincronización
          friendshipEvents.emitRequestAccepted(
            data.friendship.addresseeId,
            request.user.id,
            requestId
          );
        }
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        setCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const response = await fetch(`/api/friends/requests/${requestId}/decline`, {
        method: "POST",
      });
      if (response.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        setCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error declining request:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "ahora";
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`;
    return `hace ${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón trigger */}
      <Button
        variant="ghost"
        size="icon"
        className={cn("relative", className)}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Users className="w-5 h-5" />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center"
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </Button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: popoverSide === "top" ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: popoverSide === "top" ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute w-80 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl z-50",
              popoverSide === "top" ? "bottom-full mb-2" : "top-full mt-2",
              popoverAlign === "start" ? "left-0" : "right-0"
            )}
          >
            <div className="p-3 border-b border-border">
              <h3 className="font-semibold flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Solicitudes de amistad
              </h3>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Bell className="w-10 h-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No tienes solicitudes pendientes
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {requests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Link href={`/profile/${request.user.id}`} onClick={() => setIsOpen(false)}>
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={request.user.image || undefined}
                              alt={request.user.name || ""}
                            />
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {getInitials(request.user.name)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/profile/${request.user.id}`}
                            onClick={() => setIsOpen(false)}
                            className="font-medium text-sm hover:underline truncate block"
                          >
                            {request.user.name || "Usuario"}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {getTimeAgo(request.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => handleAccept(request.id)}
                          disabled={processingId === request.id}
                        >
                          {processingId === request.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserCheck className="w-3 h-3" />
                          )}
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1"
                          onClick={() => handleDecline(request.id)}
                          disabled={processingId === request.id}
                        >
                          {processingId === request.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserMinus className="w-3 h-3" />
                          )}
                          Rechazar
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {requests.length > 0 && (
              <div className="p-3 border-t border-border">
                <Link href="/friends?tab=requests" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full text-sm">
                    Ver todas las solicitudes
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
