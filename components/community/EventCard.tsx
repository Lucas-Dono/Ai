/**
 * EventCard - Card para eventos de la comunidad
 */

"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  Trophy,
  MapPin,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    type: string;
    startDate: string;
    endDate: string;
    registrationDeadline?: string;
    maxParticipants?: number;
    currentParticipants: number;
    prizes?: Array<{ place: number; prize: string }>;
    meetingUrl?: string;
    streamUrl?: string;
    community?: {
      name: string;
      slug: string;
      primaryColor: string;
    };
    organizer: {
      name: string;
      image?: string;
    };
    isRegistered: boolean;
    status: string;
  };
  onRegister?: (eventId: string) => void;
  compact?: boolean;
}

const EVENT_TYPE_CONFIG = {
  challenge: { label: 'Desafío', color: 'text-orange-400 bg-orange-500/10', icon: Trophy },
  workshop: { label: 'Workshop', color: 'text-blue-400 bg-blue-500/10', icon: Users },
  ama: { label: 'AMA', color: 'text-purple-400 bg-purple-500/10', icon: Users },
  meetup: { label: 'Meetup', color: 'text-green-400 bg-green-500/10', icon: MapPin },
  competition: { label: 'Competencia', color: 'text-red-400 bg-red-500/10', icon: Trophy },
  release: { label: 'Lanzamiento', color: 'text-pink-400 bg-pink-500/10', icon: ExternalLink },
};

export function EventCard({ event, onRegister, compact = false }: EventCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isLive, setIsLive] = useState(false);

  const typeConfig = EVENT_TYPE_CONFIG[event.type as keyof typeof EVENT_TYPE_CONFIG] || EVENT_TYPE_CONFIG.meetup;
  const TypeIcon = typeConfig.icon;

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const start = new Date(event.startDate).getTime();
      const end = new Date(event.endDate).getTime();

      if (now >= start && now <= end) {
        setIsLive(true);
        setTimeLeft("En vivo ahora");
      } else if (now < start) {
        setIsLive(false);
        const distance = start - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
      } else {
        setIsLive(false);
        setTimeLeft("Finalizado");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [event.startDate, event.endDate]);

  const isFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants;
  const registrationClosed = event.registrationDeadline && new Date(event.registrationDeadline) < new Date();

  return (
    <motion.div
      className={cn(
        "bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all group relative hover-lift-glow",
        compact && "p-4"
      )}
    >
      {/* Glass effect background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
            <div className="h-2 w-2 bg-white rounded-full" />
            LIVE
          </div>
        </div>
      )}

      <div className={cn("p-6", compact && "p-4")}>
        {/* Type Badge & Community */}
        <div className="flex items-center gap-3 mb-3">
          <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", typeConfig.color)}>
            <TypeIcon className="h-3 w-3" />
            {typeConfig.label}
          </div>
          {event.community && (
            <Link
              href={`/community/${event.community.slug}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: event.community.primaryColor }}
              />
              <span className="text-xs font-semibold text-foreground/80">
                {event.community.name}
              </span>
            </Link>
          )}
        </div>

        {/* Title */}
        <Link href={`/community/events/${event.id}`}>
          <h3 className={cn(
            "font-bold mb-2 group-hover:text-primary transition-colors",
            compact ? "text-lg" : "text-xl"
          )}>
            {event.title}
          </h3>
        </Link>

        {/* Description */}
        <p className={cn(
          "text-muted-foreground mb-4",
          compact ? "line-clamp-2 text-sm" : "line-clamp-3"
        )}>
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          {/* Date & Time */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">
              {new Date(event.startDate).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
            <span className="text-foreground">
              {new Date(event.startDate).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">
              {event.currentParticipants} participantes
              {event.maxParticipants && ` / ${event.maxParticipants}`}
            </span>
            {isFull && (
              <span className="text-xs text-yellow-500 font-semibold">(Lleno)</span>
            )}
          </div>

          {/* Countdown */}
          {timeLeft && (
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold",
              isLive ? "bg-red-500/20 text-red-400" :
              event.status === 'completed' ? "bg-muted text-muted-foreground" :
              "bg-primary/20 text-primary"
            )}>
              <Clock className="h-3 w-3" />
              {timeLeft}
            </div>
          )}
        </div>

        {/* Prizes (for competitions/challenges) */}
        {event.prizes && event.prizes.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border border-yellow-500/20 rounded-2xl p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-500">Premios</span>
            </div>
            <div className="space-y-1">
              {event.prizes.slice(0, 3).map((prize, index) => (
                <div key={index} className="text-xs text-foreground/80">
                  {prize.place}° Lugar: {prize.prize}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onRegister && event.status !== 'completed' && !registrationClosed && (
            <Button
              onClick={() => onRegister(event.id)}
              disabled={isFull || event.isRegistered}
              className={cn(
                "flex-1",
                event.isRegistered && "bg-green-500 hover:bg-green-600"
              )}
            >
              {event.isRegistered ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Registrado
                </>
              ) : isFull ? (
                'Evento Lleno'
              ) : (
                'Registrarse'
              )}
            </Button>
          )}

          <Link href={`/community/events/${event.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Ver Detalles
            </Button>
          </Link>

          {/* Join Live Button */}
          {isLive && (event.meetingUrl || event.streamUrl) && (
            <Button
              asChild
              variant="default"
              className="bg-red-500 hover:bg-red-600 flex-1"
            >
              <a href={event.meetingUrl || event.streamUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Unirse Ahora
              </a>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
