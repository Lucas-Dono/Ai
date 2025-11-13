"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ExternalLink, Globe, Tv, BookOpen, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CharacterSearchResult } from "@/lib/profile/multi-source-character-search";

interface CharacterSearchSelectorProps {
  characterName: string;
  results: CharacterSearchResult[];
  isLoading: boolean;
  onSelect: (result: CharacterSearchResult) => void;
  onCustomUrl: (url: string) => void;
  onManualDescription: () => void;
  disabled?: boolean;
}

const sourceIcons = {
  wikipedia: Globe,
  jikan: Tv,
  fandom: BookOpen,
  custom: LinkIcon,
};

const sourceLabels = {
  wikipedia: 'Wikipedia',
  jikan: 'MyAnimeList',
  fandom: 'Fandom Wiki',
  custom: 'Personalizado',
};

const sourceBadgeColors = {
  wikipedia: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  jikan: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  fandom: 'bg-green-500/10 text-green-500 border-green-500/20',
  custom: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

export function CharacterSearchSelector({
  characterName,
  results,
  isLoading,
  onSelect,
  onCustomUrl,
  onManualDescription,
  disabled = false,
}: CharacterSearchSelectorProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [showMore, setShowMore] = useState(false);

  const displayedResults = showMore ? results : results.slice(0, 3);

  const handleCustomUrlSubmit = () => {
    if (customUrl.trim()) {
      onCustomUrl(customUrl.trim());
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center">
            <p className="font-semibold mb-1">Buscando "{characterName}"...</p>
            <p className="text-sm text-muted-foreground">
              Buscando en Wikipedia, MyAnimeList, Fandom y otras fuentes
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Encontramos {results.length} resultado{results.length !== 1 ? 's' : ''}. ¿Cuál es el personaje que querés crear?
          </p>

          <AnimatePresence mode="popLayout">
            {displayedResults.map((result, index) => {
              const SourceIcon = sourceIcons[result.source];
              const badgeColor = sourceBadgeColors[result.source];

              return (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="cursor-pointer hover:border-primary transition-all hover:shadow-md"
                    onClick={() => !disabled && onSelect(result)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        {/* Avatar/Image */}
                        <Avatar className="h-16 w-16 border-2">
                          {result.imageUrl ? (
                            <AvatarImage src={result.imageUrl} alt={result.name} />
                          ) : (
                            <AvatarFallback>
                              <SourceIcon className="h-8 w-8 text-muted-foreground" />
                            </AvatarFallback>
                          )}
                        </Avatar>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <CardTitle className="text-base leading-tight">
                              {result.name}
                            </CardTitle>
                            <Badge variant="outline" className={`shrink-0 ${badgeColor}`}>
                              <SourceIcon className="h-3 w-3 mr-1" />
                              {sourceLabels[result.source]}
                            </Badge>
                          </div>

                          <CardDescription className="text-sm line-clamp-2">
                            {result.description}
                          </CardDescription>

                          {result.url && (
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Ver fuente
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Show More Button */}
          {results.length > 3 && !showMore && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowMore(true)}
              disabled={disabled}
            >
              Ver más resultados ({results.length - 3} restantes)
            </Button>
          )}

          {showMore && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowMore(false)}
              disabled={disabled}
            >
              Ver menos
            </Button>
          )}
        </div>
      )}

      {/* No results message */}
      {results.length === 0 && (
        <Card className="p-6 text-center border-dashed">
          <p className="text-sm text-muted-foreground mb-4">
            No encontramos resultados para "{characterName}". Podés proporcionar información de otra manera:
          </p>
        </Card>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {results.length > 0 ? 'O usar otra opción' : 'Opciones alternativas'}
          </span>
        </div>
      </div>

      {/* Custom URL Option */}
      {!showUrlInput ? (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => setShowUrlInput(true)}
            disabled={disabled}
            className="w-full"
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            Pegar URL
          </Button>

          <Button
            variant="outline"
            onClick={onManualDescription}
            disabled={disabled}
            className="w-full"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Describir manualmente
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex gap-2">
            <Input
              placeholder="https://ejemplo.com/personaje"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomUrlSubmit()}
              disabled={disabled}
              className="flex-1"
            />
            <Button
              onClick={handleCustomUrlSubmit}
              disabled={disabled || !customUrl.trim()}
            >
              Buscar
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowUrlInput(false);
              setCustomUrl("");
            }}
            className="w-full"
            disabled={disabled}
          >
            Cancelar
          </Button>
        </motion.div>
      )}
    </div>
  );
}
