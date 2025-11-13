"use client";

/**
 * Floating Feedback Button
 *
 * A floating button that allows users to report issues from anywhere in the app
 */

import { useState } from "react";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackDialog } from "./FeedbackDialog";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
        size="icon"
        variant="outline"
        title="Reportar un problema"
      >
        <Bug className="h-5 w-5" />
      </Button>

      <FeedbackDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
