"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface RatingDisplayProps {
  rating: number;
  totalReviews: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export function RatingDisplay({
  rating,
  totalReviews,
  size = "md",
  showCount = true,
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const starSize = sizeClasses[size];
  const textSize = textSizeClasses[size];

  const renderStars = () => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5

    for (let i = 1; i <= 5; i++) {
      const fill = i <= roundedRating;
      const half = i - 0.5 === roundedRating;

      stars.push(
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
        >
          <Star
            className={`${starSize} ${
              fill
                ? "fill-yellow-400 text-yellow-400"
                : half
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-gray-600"
            }`}
          />
        </motion.div>
      );
    }
    return stars;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">{renderStars()}</div>
      <span className={`${textSize} font-medium text-white`}>
        {rating.toFixed(1)}
      </span>
      {showCount && totalReviews > 0 && (
        <span className={`${textSize} text-gray-400`}>({totalReviews})</span>
      )}
    </div>
  );
}
