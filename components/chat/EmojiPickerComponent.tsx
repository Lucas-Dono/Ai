"use client";

import EmojiPicker, { Theme } from "emoji-picker-react";

interface EmojiPickerComponentProps {
  onEmojiSelect: (emoji: string) => void;
}

/**
 * Componente wrapper para emoji-picker-react con estilos personalizados
 * Compatible con React 19 y diseño del proyecto
 */
export function EmojiPickerComponent({ onEmojiSelect }: EmojiPickerComponentProps) {
  return (
    <EmojiPicker
      onEmojiClick={(emojiObject) => onEmojiSelect(emojiObject.emoji)}
      theme={Theme.DARK}
      width={350}
      height={400}
      searchPlaceHolder="Buscar emoji..."
      previewConfig={{
        showPreview: false,
      }}
    />
  );
}
