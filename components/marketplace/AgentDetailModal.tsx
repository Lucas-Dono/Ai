"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Copy, Heart, User, Calendar } from "lucide-react";
import { useState } from "react";
import { ReviewForm } from "./ReviewForm";
import { format } from "date-fns";

interface AgentDetailModalProps {
  agent: {
    id: string;
    name: string;
    description: string | null;
    avatar: string | null;
    kind: string;
    rating: number | null;
    cloneCount: number;
    featured: boolean;
    tags: any;
    personality: string | null;
    tone: string | null;
    purpose: string | null;
    gender: string | null;
    createdAt: string;
    user: {
      name: string | null;
      email: string;
    };
    _count: {
      reviews: number;
    };
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClone: (agentId: string) => void;
  onReviewSubmit: (agentId: string, rating: number, comment: string) => void;
}

export function AgentDetailModal({
  agent,
  open,
  onOpenChange,
  onClone,
  onReviewSubmit,
}: AgentDetailModalProps) {
  const [isCloning, setIsCloning] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  if (!agent) return null;

  const tags = Array.isArray(agent.tags) ? agent.tags : [];

  const handleClone = async () => {
    setIsCloning(true);
    try {
      await onClone(agent.id);
      onOpenChange(false);
    } finally {
      setIsCloning(false);
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    await onReviewSubmit(agent.id, rating, comment);
    setActiveTab("overview");
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;

    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
        />
      );
    }
    return <div className="flex items-center gap-1">{stars}</div>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 border-2 border-border">
              <AvatarImage src={agent.avatar || ""} alt={agent.name} />
              <AvatarFallback>{agent.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl">{agent.name}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2 mt-1">
                    <User className="w-3 h-3" />
                    by {agent.user.name || agent.user.email.split("@")[0]}
                  </DialogDescription>
                </div>

                {agent.featured && (
                  <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Heart className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 mt-3">
                {agent.rating && (
                  <div className="flex items-center gap-2">
                    {renderStars(agent.rating)}
                    <span className="text-sm font-medium">{agent.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">
                      ({agent._count.reviews} reviews)
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Copy className="w-4 h-4" />
                  {agent.cloneCount} clones
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(agent.createdAt), "MMM yyyy")}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant={agent.kind === "companion" ? "secondary" : "outline"}>
                  {agent.kind}
                </Badge>
                {tags.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="review">Leave Review</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">
                {agent.description || "No description available"}
              </p>
            </div>

            {agent.purpose && (
              <div>
                <h3 className="font-semibold mb-2">Purpose</h3>
                <p className="text-sm text-muted-foreground">{agent.purpose}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button onClick={handleClone} disabled={isCloning} className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                {isCloning ? "Cloning..." : "Clone Agent"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {agent.personality && (
              <div>
                <h3 className="font-semibold mb-2">Personality</h3>
                <p className="text-sm text-muted-foreground">{agent.personality}</p>
              </div>
            )}

            {agent.tone && (
              <div>
                <h3 className="font-semibold mb-2">Tone</h3>
                <p className="text-sm text-muted-foreground">{agent.tone}</p>
              </div>
            )}

            {agent.gender && (
              <div>
                <h3 className="font-semibold mb-2">Gender</h3>
                <p className="text-sm text-muted-foreground capitalize">{agent.gender}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Type</h3>
              <p className="text-sm text-muted-foreground capitalize">
                {agent.kind === "companion" ? "Emotional Companion" : "Administrative Assistant"}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="review">
            <ReviewForm onSubmit={handleReviewSubmit} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
