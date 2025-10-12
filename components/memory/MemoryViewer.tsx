/**
 * Memory Viewer Component
 * UI for viewing, searching, and managing agent memories
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Search, Trash2, Loader2, AlertCircle } from "lucide-react";

interface MemoryStats {
  totalMemories: number;
  oldestMemory: string | null;
  newestMemory: string | null;
  averageSimilarity: number;
}

interface SearchResult {
  content: string;
  role: string;
  timestamp: string;
  similarity: number;
}

interface MemoryViewerProps {
  agentId: string;
  agentName: string;
}

export function MemoryViewer({ agentId, agentName }: MemoryViewerProps) {
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, [agentId]);

  const loadStats = async () => {
    setIsLoadingStats(true);
    setError(null);

    try {
      const response = await fetch(`/api/agents/${agentId}/memory`);

      if (!response.ok) {
        throw new Error("Failed to load memory stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/agents/${agentId}/memory/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, limit: 20 }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setSearchResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = async () => {
    if (
      !confirm(
        `Are you sure you want to clear all memories for ${agentName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsClearing(true);
    setError(null);

    try {
      const response = await fetch(`/api/agents/${agentId}/memory`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear memories");
      }

      setSearchResults([]);
      await loadStats();
      alert("Memories cleared successfully");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsClearing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  if (isLoadingStats) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Memory System</h2>
            <p className="text-sm text-muted-foreground">
              Long-term memory for {agentName}
            </p>
          </div>
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={handleClear}
          disabled={isClearing || stats?.totalMemories === 0}
        >
          {isClearing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Clear All
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </Card>
      )}

      {/* Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Memories</p>
            <p className="text-2xl font-bold">{stats?.totalMemories || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Oldest Memory</p>
            <p className="text-sm font-mono">
              {formatDate(stats?.oldestMemory || null)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Newest Memory</p>
            <p className="text-sm font-mono">
              {formatDate(stats?.newestMemory || null)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg. Relevance</p>
            <p className="text-2xl font-bold">
              {Math.round((stats?.averageSimilarity || 0) * 100)}%
            </p>
          </div>
        </div>
      </Card>

      {/* Search */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Search Memories</h3>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search past conversations..."
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Search Results ({searchResults.length})
          </h3>
          <div className="space-y-4">
            {searchResults.map((result, idx) => (
              <Card
                key={idx}
                className="p-4 border-l-4 border-l-primary/50"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={result.role === "user" ? "default" : "secondary"}
                    >
                      {result.role === "user" ? "You" : agentName}
                    </Badge>
                    <Badge variant="outline">
                      {Math.round(result.similarity * 100)}% relevant
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(result.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{result.content}</p>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {stats?.totalMemories === 0 && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">No Memories Yet</p>
            <p className="text-sm">
              Start chatting with {agentName} to build long-term memory
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
