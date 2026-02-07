"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Star,
  Copy,
  Calendar,
  Heart,
  Loader2,
  MapPin,
  Edit,
  ExternalLink,
} from "lucide-react";
import { ReviewForm } from "@/components/marketplace/ReviewForm";
import { ShareAgentDialog } from "@/components/share/ShareAgentDialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AgentInfoModalProps {
  agentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
}

interface AgentData {
  id: string;
  name: string;
  description?: string;
  purpose?: string;
  avatar?: string | null;
  personality?: string;
  tone?: string;
  gender?: string;
  tags?: string[];
  categories?: string[];
  locationCity?: string;
  locationCountry?: string;
  kind: string;
  visibility: string;
  featured: boolean;
  rating?: number;
  reviewCount?: number;
  cloneCount?: number;
  createdAt: string;
  userId: string;
  voiceId?: string;
  nsfwMode?: boolean;
  godModeEnabled?: boolean;
  user?: {
    name?: string;
  };
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  userInitials?: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export function AgentInfoModal({
  agentId,
  open,
  onOpenChange,
  currentUserId,
}: AgentInfoModalProps) {
  // Estados
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Fetch agent data on open
  useEffect(() => {
    if (open && agentId) {
      fetchAgentData();
    }
  }, [open, agentId]);

  // Fetch reviews when switching to Reviews tab
  useEffect(() => {
    if (activeTab === "reviews" && !reviews.length && agentData) {
      fetchReviews();
    }
  }, [activeTab, agentData]);

  const fetchAgentData = async () => {
    setLoadingAgent(true);
    try {
      const res = await fetch(`/api/agents/${agentId}`);
      if (!res.ok) throw new Error("Failed to fetch agent");
      const data = await res.json();
      setAgentData(data);
    } catch (error) {
      console.error("Error fetching agent:", error);
      toast.error("Error al cargar información del agente");
    } finally {
      setLoadingAgent(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`/api/agents/${agentId}/reviews`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data.reviews || []);
      setReviewStats(data.stats || null);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Error al cargar reseñas");
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    try {
      const res = await fetch(`/api/agents/${agentId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      if (!res.ok) throw new Error("Failed to submit review");

      toast.success("¡Reseña enviada exitosamente!");

      // Refetch reviews after submit
      await fetchReviews();

      // Switch to overview tab
      setActiveTab("overview");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Error al enviar reseña");
    }
  };

  // Loading state
  if (loadingAgent) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <VisuallyHidden>
            <DialogTitle>Cargando información del agente</DialogTitle>
          </VisuallyHidden>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!agentData) return null;

  const isOwner = currentUserId === agentData.userId;
  const tags = Array.isArray(agentData.tags) ? agentData.tags : [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {/* HEADER */}
          <DialogHeader>
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16 border-2 border-border">
                <AvatarImage src={agentData.avatar || ""} alt={agentData.name} />
                <AvatarFallback>
                  {agentData.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <DialogTitle className="text-2xl">{agentData.name}</DialogTitle>
                  {agentData.featured && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                      <Heart className="w-3 h-3 mr-1" />
                      Destacado
                    </Badge>
                  )}
                </div>

                {/* Creator info */}
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Por {agentData.user?.name || "Usuario"}
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                  {/* Rating */}
                  {agentData.rating && agentData.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{agentData.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({agentData.reviewCount || 0})
                      </span>
                    </div>
                  )}

                  {/* Clone count */}
                  {agentData.cloneCount !== undefined && (
                    <div className="flex items-center gap-1">
                      <Copy className="w-4 h-4" />
                      <span>{agentData.cloneCount} clones</span>
                    </div>
                  )}

                  {/* Created date */}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(agentData.createdAt), "MMM yyyy", {
                      locale: es,
                    })}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {agentData.gender && (
                    <Badge variant="secondary" className="capitalize">
                      {agentData.gender === "male" ? "Masculino" :
                       agentData.gender === "female" ? "Femenino" :
                       agentData.gender === "non-binary" ? "No binario" :
                       agentData.gender}
                    </Badge>
                  )}
                  {agentData.visibility === "public" ? (
                    <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      Público
                    </Badge>
                  ) : (
                    <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                      Privado
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* TABS */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="reviews">Reseñas</TabsTrigger>
            </TabsList>

            {/* TAB 1: OVERVIEW */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Description */}
              {agentData.description && (
                <div>
                  <h4 className="font-semibold mb-2">Descripción</h4>
                  <p className="text-sm text-muted-foreground">
                    {agentData.description}
                  </p>
                </div>
              )}

              {/* Purpose */}
              {agentData.purpose && (
                <div>
                  <h4 className="font-semibold mb-2">Propósito</h4>
                  <p className="text-sm text-muted-foreground">
                    {agentData.purpose}
                  </p>
                </div>
              )}

              {/* Location */}
              {(agentData.locationCity || agentData.locationCountry) && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Ubicación
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {[agentData.locationCity, agentData.locationCountry]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-4 flex-wrap">
                <Button
                  onClick={() => setShowShareDialog(true)}
                  variant="outline"
                  className="flex-1 min-w-[120px]"
                >
                  Compartir
                </Button>

                {isOwner && (
                  <Button
                    onClick={() => {
                      window.location.href = `/agentes/${agentId}/edit`;
                    }}
                    variant="outline"
                    className="flex-1 min-w-[120px]"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}

                <Button
                  onClick={() => {
                    window.location.href = `/create-character?mode=manual&cloneId=${agentId}`;
                  }}
                  variant="default"
                  className="flex-1 min-w-[120px]"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Clonar Agente
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: DETAILS */}
            <TabsContent value="details" className="space-y-4 mt-4">
              {/* Personality */}
              {agentData.personality && (
                <div>
                  <h4 className="font-semibold mb-2">Personalidad</h4>
                  <p className="text-sm text-muted-foreground">
                    {agentData.personality}
                  </p>
                </div>
              )}

              {/* Tone */}
              {agentData.tone && (
                <div>
                  <h4 className="font-semibold mb-2">Tono</h4>
                  <p className="text-sm text-muted-foreground">{agentData.tone}</p>
                </div>
              )}

              {/* Gender */}
              {agentData.gender && (
                <div>
                  <h4 className="font-semibold mb-2">Género</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {agentData.gender}
                  </p>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {agentData.categories && agentData.categories.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Categorías</h4>
                  <div className="flex flex-wrap gap-2">
                    {agentData.categories.map((cat: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Flags */}
              {(agentData.voiceId || agentData.nsfwMode || agentData.godModeEnabled) && (
                <div>
                  <h4 className="font-semibold mb-2">Configuración</h4>
                  <div className="space-y-2 text-sm">
                    {agentData.voiceId && (
                      <p className="text-muted-foreground">✓ Voz habilitada</p>
                    )}
                    {agentData.nsfwMode && (
                      <p className="text-muted-foreground">✓ Modo NSFW</p>
                    )}
                    {agentData.godModeEnabled && (
                      <p className="text-muted-foreground">✓ Modo Dios</p>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB 3: REVIEWS */}
            <TabsContent value="reviews" className="space-y-4 mt-4">
              {loadingReviews ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                </div>
              ) : (
                <>
                  {/* Review Stats */}
                  {reviewStats && reviewStats.totalReviews > 0 && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-3xl font-bold">
                            {reviewStats.averageRating.toFixed(1)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {reviewStats.totalReviews} reseña
                            {reviewStats.totalReviews !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "w-5 h-5",
                                star <= Math.round(reviewStats.averageRating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted"
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Rating Distribution */}
                      <div className="space-y-1">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div
                            key={rating}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="w-8">{rating}★</span>
                            <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400"
                                style={{
                                  width: `${
                                    reviewStats.totalReviews > 0
                                      ? ((reviewStats.ratingDistribution[rating] ||
                                          0) /
                                          reviewStats.totalReviews) *
                                        100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="w-8 text-right text-muted-foreground">
                              {reviewStats.ratingDistribution[rating] || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Form (solo si NO es el owner) */}
                  {!isOwner && (
                    <div>
                      <h4 className="font-semibold mb-3">Deja tu reseña</h4>
                      <ReviewForm onSubmit={handleReviewSubmit} />
                    </div>
                  )}

                  {/* Reviews List */}
                  {reviews.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Reseñas recientes</h4>
                      {reviews.slice(0, 5).map((review) => (
                        <div key={review.id} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "w-3 h-3",
                                    star <= review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-muted"
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(review.createdAt), "d MMM yyyy", {
                                locale: es,
                              })}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-muted-foreground">
                              {review.comment}
                            </p>
                          )}
                          {review.userInitials && (
                            <p className="text-xs text-muted-foreground mt-1">
                              — {review.userInitials}
                            </p>
                          )}
                        </div>
                      ))}

                      {reviews.length > 5 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.location.href = `/agentes/${agentId}`;
                          }}
                          className="w-full"
                        >
                          Ver todas las reseñas ({reviews.length})
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      {isOwner
                        ? "Este agente aún no tiene reseñas"
                        : "No hay reseñas todavía. ¡Sé el primero en dejar una!"}
                    </p>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      {agentData && (
        <ShareAgentDialog
          agent={{
            id: agentData.id,
            name: agentData.name,
            description: agentData.description,
            avatar: agentData.avatar,
            category: agentData.categories?.[0],
          }}
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
        />
      )}
    </>
  );
}
