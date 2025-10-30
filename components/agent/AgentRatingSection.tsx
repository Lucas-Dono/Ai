"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RatingDisplay } from "./RatingDisplay";
import { RatingModal } from "./RatingModal";
import { motion } from "framer-motion";

interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  userInitials: string;
  createdAt: string;
}

interface AgentRatingSectionProps {
  agentId: string;
  agentName: string;
  isOwnAgent?: boolean;
}

export function AgentRatingSection({
  agentId,
  agentName,
  isOwnAgent = false,
}: AgentRatingSectionProps) {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userReview, setUserReview] = useState<any>(null);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [agentId]);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-800/30 rounded-xl p-6">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  const hasReviews = stats.totalReviews > 0;

  return (
    <>
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              Calificaciones y Reseñas
            </h3>
            <p className="text-sm text-gray-400">
              {hasReviews
                ? `${stats.totalReviews} ${stats.totalReviews === 1 ? "reseña" : "reseñas"}`
                : "Sé el primero en calificar"}
            </p>
          </div>
          {!isOwnAgent && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Star className="w-4 h-4 mr-2" />
              {userReview ? "Actualizar" : "Calificar"}
            </Button>
          )}
        </div>

        {/* Rating Summary */}
        {hasReviews && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left: Average Rating */}
            <div className="flex flex-col items-center justify-center p-6 bg-gray-800/50 rounded-xl border border-gray-700/30">
              <div className="text-5xl font-bold text-white mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <RatingDisplay
                rating={stats.averageRating}
                totalReviews={0}
                size="lg"
                showCount={false}
              />
              <p className="text-sm text-gray-400 mt-2">
                Basado en {stats.totalReviews} {stats.totalReviews === 1 ? "reseña" : "reseñas"}
              </p>
            </div>

            {/* Right: Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
                const percentage =
                  stats.totalReviews > 0
                    ? (count / stats.totalReviews) * 100
                    : 0;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm text-gray-400">{rating}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.1 * (5 - rating) }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews List */}
        {hasReviews && reviews.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Reseñas
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {reviews.map((review, idx) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {review.userInitials}
                      </div>
                      <div>
                        <RatingDisplay
                          rating={review.rating}
                          totalReviews={0}
                          size="sm"
                          showCount={false}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(review.createdAt).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-300 mt-2">{review.comment}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasReviews && !isOwnAgent && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-gray-600" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">
              Sin calificaciones aún
            </h4>
            <p className="text-sm text-gray-400 mb-4">
              Sé el primero en compartir tu experiencia
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Star className="w-4 h-4 mr-2" />
              Dejar una reseña
            </Button>
          </div>
        )}

        {isOwnAgent && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">
              No puedes calificar tu propio compañero
            </p>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        agentId={agentId}
        agentName={agentName}
        existingReview={userReview}
        onSuccess={() => {
          fetchReviews();
        }}
      />
    </>
  );
}
