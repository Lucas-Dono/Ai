/**
 * Community Events Page - Calendario de eventos de la comunidad
 */

"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Trophy,
  Users,
  Filter,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { EventCard } from "@/components/community";
import { useTranslations } from "next-intl";

interface Event {
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
}

type EventFilter = 'all' | 'upcoming' | 'live' | 'past';
type EventType = 'all' | 'challenge' | 'workshop' | 'ama' | 'competition';

export default function CommunityEventsPage() {
  const t = useTranslations('community.events');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EventFilter>('upcoming');
  const [eventType, setEventType] = useState<EventType>('all');

  useEffect(() => {
    loadEvents();
  }, [filter, eventType]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (eventType !== 'all') params.append('type', eventType);

      const response = await fetch(`/api/community/events?${params.toString()}`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    try {
      const response = await fetch(`/api/community/events/${eventId}/register`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al registrarse');
      }

      loadEvents();
    } catch (err) {
      console.error('Error registering:', err);
      alert(err instanceof Error ? err.message : t('errors.register'));
    }
  };

  const filterTabs = [
    { type: 'upcoming' as EventFilter, label: t('filters.upcoming'), icon: Calendar },
    { type: 'live' as EventFilter, label: t('filters.live'), icon: Clock },
    { type: 'past' as EventFilter, label: t('filters.past'), icon: Trophy },
    { type: 'all' as EventFilter, label: t('filters.all'), icon: Filter },
  ];

  const typeTabs = [
    { type: 'all' as EventType, label: t('types.all') },
    { type: 'challenge' as EventType, label: t('types.challenge') },
    { type: 'workshop' as EventType, label: t('types.workshop') },
    { type: 'ama' as EventType, label: t('types.ama') },
    { type: 'competition' as EventType, label: t('types.competition') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20 lg:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border/50 bg-card/80 backdrop-blur-xl safe-area-inset-top">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-4">
              <Link href="/community">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t('header.back')}
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-1 md:mb-2">
                  {t('header.title')}
                </h1>
                <p className="text-muted-foreground text-xs md:text-sm">
                  {t('header.subtitle')}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3 -mx-4 px-4 md:mx-0 md:px-0">
            {filterTabs.map((tab) => (
              <button
                key={tab.type}
                onClick={() => setFilter(tab.type)}
                className={cn(
                  "flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-full whitespace-nowrap transition-all min-h-[44px] md:min-h-0",
                  filter === tab.type
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
                    : "bg-background/50 hover:bg-background/80 text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-xs md:text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Type Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {typeTabs.map((tab) => (
              <button
                key={tab.type}
                onClick={() => setEventType(tab.type)}
                className={cn(
                  "px-2.5 md:px-3 py-1.5 rounded-full whitespace-nowrap transition-all text-[10px] md:text-xs font-semibold min-h-[36px] md:min-h-0",
                  eventType === tab.type
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-background/30 hover:bg-background/60 text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-12"
          >
            <Calendar className="h-24 w-24 text-muted-foreground/30 mb-6" />
            <h3 className="text-2xl font-bold mb-2">{t('empty.title')}</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('empty.description')}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <EventCard event={event} onRegister={handleRegister} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
