"use client";

import { EmojiPicker } from "frimousse";

interface EmojiPickerComponentProps {
  onEmojiSelect: (emoji: string) => void;
}

/**
 * Componente wrapper para Frimousse emoji picker con estilos personalizados
 * Compatible con React 19 y diseño del proyecto
 */
export function EmojiPickerComponent({ onEmojiSelect }: EmojiPickerComponentProps) {
  return (
    <EmojiPicker.Root
      onEmojiSelect={({ emoji }) => onEmojiSelect(emoji)}
      className="bg-popover border border-border rounded-lg overflow-hidden w-[350px] h-[400px]"
    >
      {/* Search Bar */}
      <div className="p-3 border-b border-border">
        <EmojiPicker.Search
          placeholder="Buscar emoji..."
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Emoji List */}
      <EmojiPicker.Viewport className="h-[340px] overflow-y-auto">
        <EmojiPicker.Loading className="flex items-center justify-center h-full text-sm text-muted-foreground">
          Cargando emojis...
        </EmojiPicker.Loading>

        <EmojiPicker.Empty className="flex items-center justify-center h-full text-sm text-muted-foreground">
          No se encontraron emojis
        </EmojiPicker.Empty>

        <EmojiPicker.List className="p-2 grid gap-1" />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}
