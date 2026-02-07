"use client";

import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  existingReview?: {
    rating: number;
    comment?: string | null;
  } | null;
  onSuccess?: () => void;
}

export function RatingModal({
  isOpen,
  onClose,
  agentId,
  agentName,
  existingReview,
  onSuccess,
}: RatingModalProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Por favor selecciona una calificación");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/agents/${agentId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar calificación");
      }

      // Success
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al enviar calificación");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {existingReview ? "Actualizar" : "Calificar"} a {agentName}
                  </h2>
                  <p className="text-sm text-gray-400">
                    Comparte tu experiencia con este compañero
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-700 rounded-2xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Rating Stars */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Tu calificación
                </label>
                <div className="flex items-center gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-600"
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
                {rating > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-sm text-gray-400 mt-2"
                  >
                    {rating === 1 && "Muy malo"}
                    {rating === 2 && "Malo"}
                    {rating === 3 && "Regular"}
                    {rating === 4 && "Bueno"}
                    {rating === 5 && "Excelente"}
                  </motion.p>
                )}
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Comentario (opcional)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntanos sobre tu experiencia..."
                  rows={4}
                  className="w-full bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 resize-none focus:border-purple-500"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {comment.length}/500 caracteres
                </p>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={submitting || rating === 0}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar calificación"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
