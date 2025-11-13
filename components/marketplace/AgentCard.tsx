"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Copy, Heart, Share2 } from "lucide-react";
import { useState } from "react";
import { ShareAgentDialog } from "@/components/share/ShareAgentDialog";

interface AgentCardProps {
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
    user: {
      name: string | null;
      email: string;
    } | null;
    _count: {
      reviews: number;
    };
  };
  onViewDetails: (agentId: string) => void;
  onClone: (agentId: string) => void;
}

export function AgentCard({ agent, onViewDetails, onClone }: AgentCardProps) {
  const [isCloning, setIsCloning] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const tags = Array.isArray(agent.tags) ? agent.tags : [];

  const handleClone = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCloning(true);
    try {
      await onClone(agent.id);
    } finally {
      setIsCloning(false);
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-muted-foreground text-xs">No ratings</span>;

    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
        />
      );
    }
    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-xs text-muted-foreground ml-1">
          ({agent._count.reviews})
        </span>
      </div>
    );
  };

  return (
    <Card
      className="cursor-pointer hover:border-primary transition-all group hover-lift-glow"
      onClick={() => onViewDetails(agent.id)}
    >
      {agent.featured && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Heart className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12 border-2 border-border">
            <AvatarImage src={agent.avatar || (agent as any).referenceImageUrl || ""} alt={agent.name} />
            <AvatarFallback>{agent.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
              {agent.name}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              by {agent.user?.name || agent.user?.email?.split("@")[0] || "Unknown"}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {agent.description || "No description available"}
        </p>

        <div className="flex items-center gap-2 mt-3">
          <Badge variant={agent.kind === "companion" ? "secondary" : "outline"}>
            {agent.kind}
          </Badge>
          {tags.slice(0, 2).map((tag: string, idx: number) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <span className="text-xs text-muted-foreground">+{tags.length - 2}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-3 border-t">
        <div className="flex flex-col gap-1">
          {renderStars(agent.rating)}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Copy className="w-3 h-3" />
            {agent.cloneCount} clones
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setShowShareDialog(true);
            }}
            className="px-2"
          >
            <Share2 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClone}
            disabled={isCloning}
            className="group-hover:bg-primary group-hover:text-primary-foreground"
          >
            <Copy className="w-3 h-3 mr-1" />
            {isCloning ? "Cloning..." : "Clone"}
          </Button>
        </div>
      </CardFooter>

      {/* Share Dialog */}
      <ShareAgentDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        agent={{
          id: agent.id,
          name: agent.name,
          avatar: agent.avatar,
          description: agent.description,
        }}
      />
    </Card>
  );
}
