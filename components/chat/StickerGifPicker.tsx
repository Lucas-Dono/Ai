"use client";

/**
 * Sticker & GIF Picker Component
 *
 * Permite al usuario enviar stickers y GIFs:
 * - Stickers predefinidos por categorías
 * - Búsqueda de GIFs usando Giphy API
 * - Preview antes de enviar
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StickerGifPickerProps {
  onSend: (url: string, type: "sticker" | "gif") => void;
  onClose: () => void;
}

// Stickers predefinidos organizados por categoría
const STICKERS = {
  "Emociones": [
    { id: "happy", emoji: "😊", url: "/stickers/happy.png" },
    { id: "love", emoji: "😍", url: "/stickers/love.png" },
    { id: "laugh", emoji: "😂", url: "/stickers/laugh.png" },
    { id: "sad", emoji: "😢", url: "/stickers/sad.png" },
    { id: "angry", emoji: "😠", url: "/stickers/angry.png" },
    { id: "surprised", emoji: "😮", url: "/stickers/surprised.png" },
    { id: "cool", emoji: "😎", url: "/stickers/cool.png" },
    { id: "thinking", emoji: "🤔", url: "/stickers/thinking.png" },
  ],
  "Reacciones": [
    { id: "thumbs-up", emoji: "👍", url: "/stickers/thumbs-up.png" },
    { id: "clap", emoji: "👏", url: "/stickers/clap.png" },
    { id: "fire", emoji: "🔥", url: "/stickers/fire.png" },
    { id: "heart", emoji: "❤️", url: "/stickers/heart.png" },
    { id: "star", emoji: "⭐", url: "/stickers/star.png" },
    { id: "check", emoji: "✅", url: "/stickers/check.png" },
    { id: "celebrate", emoji: "🎉", url: "/stickers/celebrate.png" },
    { id: "strong", emoji: "💪", url: "/stickers/strong.png" },
  ],
  "Animales": [
    { id: "cat", emoji: "🐱", url: "/stickers/cat.png" },
    { id: "dog", emoji: "🐶", url: "/stickers/dog.png" },
    { id: "panda", emoji: "🐼", url: "/stickers/panda.png" },
    { id: "fox", emoji: "🦊", url: "/stickers/fox.png" },
    { id: "lion", emoji: "🦁", url: "/stickers/lion.png" },
    { id: "unicorn", emoji: "🦄", url: "/stickers/unicorn.png" },
    { id: "dragon", emoji: "🐉", url: "/stickers/dragon.png" },
    { id: "owl", emoji: "🦉", url: "/stickers/owl.png" },
  ],
};

interface GiphyGif {
  id: string;
  url: string;
  preview: string;
  title: string;
}

export function StickerGifPicker({
  onSend,
  onClose,
}: StickerGifPickerProps) {
  const [activeTab, setActiveTab] = useState<"stickers" | "gifs">("stickers");
  const [gifSearchQuery, setGifSearchQuery] = useState("");
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Buscar GIFs en Giphy
  const searchGifs = async (query: string) => {
    if (!query.trim()) {
      // Mostrar trending GIFs si no hay búsqueda
      loadTrendingGifs();
      return;
    }

    setIsLoadingGifs(true);

    try {
      // Nota: En producción, la API key debe estar en variables de entorno
      // y las llamadas deben hacerse desde el backend
      const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY || "demo";
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20&rating=g`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch GIFs");
      }

      const data = await response.json();

      const gifs: GiphyGif[] = data.data.map((gif: any) => ({
        id: gif.id,
        url: gif.images.original.url,
        preview: gif.images.fixed_width_small.url,
        title: gif.title,
      }));

      setGifs(gifs);
    } catch (error) {
      console.error("Error fetching GIFs:", error);
      setGifs([]);
    } finally {
      setIsLoadingGifs(false);
    }
  };

  // Cargar GIFs trending
  const loadTrendingGifs = async () => {
    setIsLoadingGifs(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY || "demo";
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20&rating=g`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch trending GIFs");
      }

      const data = await response.json();

      const gifs: GiphyGif[] = data.data.map((gif: any) => ({
        id: gif.id,
        url: gif.images.original.url,
        preview: gif.images.fixed_width_small.url,
        title: gif.title,
      }));

      setGifs(gifs);
    } catch (error) {
      console.error("Error fetching trending GIFs:", error);
      setGifs([]);
    } finally {
      setIsLoadingGifs(false);
    }
  };

  // Efecto para búsqueda con debounce
  useEffect(() => {
    if (activeTab !== "gifs") return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchGifs(gifSearchQuery);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gifSearchQuery, activeTab]);

  // Cargar trending GIFs al abrir la pestaña
  useEffect(() => {
    if (activeTab === "gifs" && gifs.length === 0) {
      loadTrendingGifs();
    }
     
  }, [activeTab, gifs.length]);

  return (
    <div className="bg-[#1f1f1f] rounded-2xl border border-[#2a2a2a] shadow-xl max-w-md w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
        <h3 className="text-white font-semibold">Stickers y GIFs</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "stickers" | "gifs")}
        className="w-full"
      >
        <TabsList className="w-full bg-[#2a2a2a] border-b border-[#3a3a3a]">
          <TabsTrigger value="stickers" className="flex-1">
            Stickers
          </TabsTrigger>
          <TabsTrigger value="gifs" className="flex-1">
            GIFs
          </TabsTrigger>
        </TabsList>

        {/* Stickers Tab */}
        <TabsContent value="stickers" className="p-4 max-h-[400px] overflow-y-auto">
          <div className="space-y-4">
            {Object.entries(STICKERS).map(([category, stickers]) => (
              <div key={category}>
                <h4 className="text-sm text-gray-400 mb-2 font-semibold">
                  {category}
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {stickers.map((sticker) => (
                    <button
                      key={sticker.id}
                      onClick={() => {
                        // Por ahora enviamos el emoji como sticker
                        // En producción, se enviaría la URL de la imagen
                        onSend(sticker.emoji, "sticker");
                        onClose();
                      }}
                      className="aspect-square bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a] transition-colors flex items-center justify-center text-4xl"
                    >
                      {sticker.emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* GIFs Tab */}
        <TabsContent value="gifs" className="p-4">
          {/* Búsqueda de GIFs */}
          <div className="mb-4">
            <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={gifSearchQuery}
                onChange={(e) => setGifSearchQuery(e.target.value)}
                placeholder="Buscar GIFs..."
                className="flex-1 bg-transparent text-white placeholder:text-gray-500 outline-none text-sm"
              />
              {gifSearchQuery && (
                <button
                  onClick={() => setGifSearchQuery("")}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Grid de GIFs */}
          <div className="max-h-[320px] overflow-y-auto">
            {isLoadingGifs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : gifs.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {gifs.map((gif) => (
                  <button
                    key={gif.id}
                    onClick={() => {
                      onSend(gif.url, "gif");
                      onClose();
                    }}
                    className="aspect-square bg-[#2a2a2a] rounded-lg overflow-hidden hover:ring-2 hover:ring-green-500 transition-all"
                  >
                    <img
                      src={gif.preview}
                      alt={gif.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                {gifSearchQuery
                  ? "No se encontraron GIFs"
                  : "Busca GIFs para comenzar"}
              </div>
            )}
          </div>

          {/* Attribution */}
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              Powered by{" "}
              <a
                href="https://giphy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:underline"
              >
                GIPHY
              </a>
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
