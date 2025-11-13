/**
 * Event Detail Page - Detalle de un evento con participantes y submissions
 */

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  Trophy,
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  Upload,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState("");

  useEffect(() => {
    loadEvent();
    loadParticipants();
    loadWinners();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const response = await fetch(`/api/community/events/${eventId}`);
      const data = await response.json();
      setEvent(data.event);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async () => {
    try {
      const response = await fetch(`/api/community/events/${eventId}/participants`);
      const data = await response.json();
      setParticipants(data.participants || []);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const loadWinners = async () => {
    try {
      const response = await fetch(`/api/community/events/${eventId}/winners`);
      const data = await response.json();
      setWinners(data.winners || []);
    } catch (error) {
      console.error('Error loading winners:', error);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`/api/community/events/${eventId}/register`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al registrarse');
      }

      loadEvent();
      loadParticipants();
    } catch (err) {
      console.error('Error registering:', err);
      alert(err instanceof Error ? err.message : 'Error al registrarse');
    }
  };

  const handleSubmit = async () => {
    if (!submission.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/community/events/${eventId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al enviar');
      }

      setSubmission("");
      alert('Submission enviado exitosamente!');
    } catch (err) {
      console.error('Error submitting:', err);
      alert(err instanceof Error ? err.message : 'Error al enviar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Evento no encontrado</h2>
          <p className="text-muted-foreground mb-4">El evento que buscas no existe.</p>
          <Link href="/community/events">
            <Button>Volver a Eventos</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isLive = new Date() >= new Date(event.startDate) && new Date() <= new Date(event.endDate);
  const isUpcoming = new Date() < new Date(event.startDate);
  const isPast = new Date() > new Date(event.endDate);

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Header */}
      <div className="border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4">
          <Link href="/community/events">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a Eventos
            </Button>
          </Link>
        </div>
      </div>

      {/* Event Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Info */}
            <div className="bg-card border border-border rounded-2xl p-6">
              {isLive && (
                <div className="bg-red-500 text-white px-4 py-2 rounded-2xl mb-4 flex items-center justify-center gap-2 animate-pulse">
                  <div className="h-2 w-2 bg-white rounded-full" />
                  EVENTO EN VIVO
                </div>
              )}

              <h1 className="text-3xl font-bold mb-4">{event.title}</h1>

              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(event.startDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(event.startDate).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{event.currentParticipants} participantes</span>
                </div>
              </div>

              <p className="text-muted-foreground whitespace-pre-wrap mb-6">
                {event.description}
              </p>

              {/* Prizes */}
              {event.prizes && event.prizes.length > 0 && (
                <div className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold text-yellow-500">Premios</h3>
                  </div>
                  <div className="space-y-2">
                    {event.prizes.map((prize: any, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm",
                          prize.place === 1 ? "bg-yellow-500 text-white" :
                          prize.place === 2 ? "bg-gray-400 text-white" :
                          prize.place === 3 ? "bg-orange-600 text-white" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {prize.place}
                        </div>
                        <span className="text-foreground">{prize.prize}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Join/Submit Actions */}
              {isUpcoming && !event.isRegistered && (
                <Button
                  onClick={handleRegister}
                  size="lg"
                  className="w-full"
                  disabled={event.maxParticipants && event.currentParticipants >= event.maxParticipants}
                >
                  {event.maxParticipants && event.currentParticipants >= event.maxParticipants
                    ? 'Evento Lleno'
                    : 'Registrarse'}
                </Button>
              )}

              {isUpcoming && event.isRegistered && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-500 font-semibold">Ya estás registrado!</span>
                </div>
              )}

              {isLive && (event.meetingUrl || event.streamUrl) && (
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-red-500 hover:bg-red-600"
                >
                  <a href={event.meetingUrl || event.streamUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Unirse al Evento
                  </a>
                </Button>
              )}

              {(isLive || isPast) && event.isRegistered && (event.type === 'challenge' || event.type === 'competition') && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Enviar Tu Entrada
                  </h3>
                  <Textarea
                    placeholder="Describe tu submission o pega el link a tu proyecto..."
                    value={submission}
                    onChange={(e) => setSubmission(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !submission.trim()}
                    className="w-full"
                  >
                    {submitting ? 'Enviando...' : 'Enviar Submission'}
                  </Button>
                </div>
              )}
            </div>

            {/* Winners (if past event) */}
            {isPast && winners.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Ganadores
                </h3>
                <div className="space-y-4">
                  {winners.map((winner: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-accent/50 rounded-2xl">
                      <div className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg",
                        winner.place === 1 ? "bg-yellow-500 text-white" :
                        winner.place === 2 ? "bg-gray-400 text-white" :
                        winner.place === 3 ? "bg-orange-600 text-white" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {winner.place}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{winner.user.name}</p>
                        <p className="text-sm text-muted-foreground">{winner.submission}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Participants */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participantes ({participants.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {participants.slice(0, 20).map((participant: any) => (
                  <div key={participant.id} className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                      {participant.user.image ? (
                        <img
                          src={participant.user.image}
                          alt={participant.user.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold">
                          {participant.user.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm truncate">{participant.user.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
