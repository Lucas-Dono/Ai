"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgentCard } from "@/components/marketplace/AgentCard";
import { AgentDetailModal } from "@/components/marketplace/AgentDetailModal";
import { Search, Filter, Sparkles, TrendingUp, Star, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Agent {
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
}

export default function MarketplacePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [showFeatured, setShowFeatured] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    filterAndSortAgents();
  }, [agents, searchQuery, kindFilter, sortBy, showFeatured]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/marketplace/agents");
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortAgents = () => {
    let filtered = [...agents];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (agent) =>
          agent.name.toLowerCase().includes(query) ||
          agent.description?.toLowerCase().includes(query)
      );
    }

    // Kind filter
    if (kindFilter !== "all") {
      filtered = filtered.filter((agent) => agent.kind === kindFilter);
    }

    // Featured filter
    if (showFeatured) {
      filtered = filtered.filter((agent) => agent.featured);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.cloneCount - a.cloneCount;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredAgents(filtered);
  };

  const handleViewDetails = async (agentId: string) => {
    try {
      const response = await fetch(`/api/marketplace/agents?limit=100`);
      const data = await response.json();
      const agent = data.agents.find((a: Agent) => a.id === agentId);
      if (agent) {
        setSelectedAgent(agent);
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching agent details:", error);
    }
  };

  const handleClone = async (agentId: string) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    try {
      const response = await fetch(`/api/marketplace/agents/${agentId}/clone`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to clone agent");
        return;
      }

      const data = await response.json();
      alert(`Successfully cloned "${data.agent.name}"!`);
      fetchAgents(); // Refresh to update clone counts
    } catch (error) {
      console.error("Error cloning agent:", error);
      alert("Failed to clone agent");
    }
  };

  const handleReviewSubmit = async (agentId: string, rating: number, comment: string) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    try {
      const response = await fetch(`/api/marketplace/agents/${agentId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to submit review");
        return;
      }

      alert("Review submitted successfully!");
      fetchAgents(); // Refresh to update ratings
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review");
    }
  };

  const featuredAgents = agents.filter((agent) => agent.featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI Marketplace</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Amazing AI Agents
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Browse, clone, and customize AI agents created by the community
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => setShowFeatured(!showFeatured)}>
                <Filter className={`w-4 h-4 ${showFeatured ? "text-primary" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Agents */}
      {featuredAgents.length > 0 && !searchQuery && !showFeatured && (
        <div className="border-b bg-muted/20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <h2 className="text-2xl font-bold">Featured Agents</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onViewDetails={handleViewDetails}
                  onClone={handleClone}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <Badge
                variant={kindFilter === "all" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setKindFilter("all")}
              >
                All
              </Badge>
              <Badge
                variant={kindFilter === "companion" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setKindFilter("companion")}
              >
                Companions
              </Badge>
              <Badge
                variant={kindFilter === "assistant" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setKindFilter("assistant")}
              >
                Assistants
              </Badge>
              {showFeatured && (
                <Badge variant="secondary">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Featured Only
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Most Popular
                    </div>
                  </SelectItem>
                  <SelectItem value="rating">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Highest Rated
                    </div>
                  </SelectItem>
                  <SelectItem value="recent">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Most Recent
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading agents...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No agents found matching your criteria</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {filteredAgents.length} {filteredAgents.length === 1 ? "agent" : "agents"} found
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onViewDetails={handleViewDetails}
                  onClone={handleClone}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Agent Detail Modal */}
      <AgentDetailModal
        agent={selectedAgent}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onClone={handleClone}
        onReviewSubmit={handleReviewSubmit}
      />
    </div>
  );
}
