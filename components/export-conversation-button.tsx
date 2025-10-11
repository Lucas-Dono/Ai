"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileText, Copy, Check, FileCode } from "lucide-react";
import { ConversationExporter } from "@/lib/export";

interface Message {
  id: string;
  role: string;
  content: string;
  metadata?: {
    emotions?: string[];
    agentName?: string;
    relationLevel?: string;
  };
  createdAt?: Date | string;
}

interface ExportConversationButtonProps {
  messages: Message[];
  agentName?: string;
  worldName?: string;
  variant?: "default" | "outline" | "ghost";
}

export function ExportConversationButton({
  messages,
  agentName,
  worldName,
  variant = "outline",
}: ExportConversationButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await ConversationExporter.copyToClipboard(messages, agentName, worldName);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => ConversationExporter.exportToJSON(messages, agentName, worldName)}>
          <FileJson className="h-4 w-4 mr-2" />
          Exportar como JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => ConversationExporter.exportToTXT(messages, agentName, worldName)}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar como TXT
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => ConversationExporter.exportToMarkdown(messages, agentName, worldName)}>
          <FileCode className="h-4 w-4 mr-2" />
          Exportar como Markdown
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-500" />
              ¡Copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copiar al portapapeles
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
