"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GifPickerProps {
  onSelect: (gifUrl: string, description: string) => void;
}

interface TenorGif {
  id: string;
  media_formats: {
    gif: { url: string };
    tinygif: { url: string };
  };
  content_description: string;
}

export function GifPicker({ onSelect }: GifPickerProps) {
  const [search, setSearch] = useState("");
  const [gifs, setGifs] = useState<TenorGif[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const TENOR_API_KEY = process.env.NEXT_PUBLIC_TENOR_API_KEY || "AIzaSyAr7Y_OGMPfJXS7W3Uk7kIkW-2uFOKxqr4"; // Key p�blica de demo
  const TENOR_CLIENT_KEY = "creador-inteligencias";

  useEffect(() => {
    // Cargar GIFs trending al inicio
    fetchTrendingGifs();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const timer = setTimeout(() => {
        searchGifs(search);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      fetchTrendingGifs();
    }
  }, [search]);

  const fetchTrendingGifs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}&limit=20`
      );
      if (!response.ok) throw new Error("Failed to fetch trending GIFs");
      const data = await response.json();
      setGifs(data.results || []);
    } catch (err) {
      console.error("Error fetching trending GIFs:", err);
      setError("No se pudieron cargar los GIFs");
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(
          query
        )}&key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}&limit=20`
      );
      if (!response.ok) throw new Error("Failed to search GIFs");
      const data = await response.json();
      setGifs(data.results || []);
    } catch (err) {
      console.error("Error searching GIFs:", err);
      setError("No se pudieron buscar los GIFs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[400px] flex flex-col">
      {/* Search Bar */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar GIFs..."
            className="pl-9"
          />
        </div>
      </div>

      {/* GIFs Grid */}
      <ScrollArea className="flex-1 p-3">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            {error}
          </div>
        )}

        {!loading && !error && gifs.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No se encontraron GIFs
          </div>
        )}

        {!loading && !error && gifs.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => onSelect(
                  gif.media_formats.gif.url,
                  gif.content_description || "GIF animado"
                )}
                className="relative aspect-square overflow-hidden rounded-lg hover:opacity-80 transition-opacity bg-muted group"
                title={gif.content_description || "GIF"}
              >
                <Image
                  src={gif.media_formats.tinygif.url}
                  alt={gif.content_description || "GIF"}
                  fill
                  className="object-cover"
                  unoptimized // GIFs no se optimizan
                />
                {/* Tooltip con descripción */}
                <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                  {gif.content_description || "GIF"}
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t text-center">
        <p className="text-xs text-muted-foreground">
          Powered by{" "}
          <a
            href="https://tenor.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Tenor
          </a>
        </p>
      </div>
    </div>
  );
}
