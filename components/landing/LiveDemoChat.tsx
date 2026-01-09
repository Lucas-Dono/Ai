"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

const getDemoResponses = (t: any) => [
  {
    trigger: ["hola", "hi", "hey"],
    response: t("responses.greeting"),
    emotion: t("emotions.joy"),
  },
  {
    trigger: ["bien", "genial", "excelente", "good", "great", "excellent"],
    response: t("responses.happy"),
    emotion: t("emotions.joyInterest"),
  },
  {
    trigger: ["triste", "mal", "sad", "bad"],
    response: t("responses.sad"),
    emotion: t("emotions.sadnessEmpathy"),
  },
  {
    trigger: ["default"],
    response: t("responses.default"),
    emotion: t("emotions.curiosity"),
  },
];

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  emotion?: string;
}

export function LiveDemoChat() {
  const t = useTranslations("landing.liveDemo");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: t("initialMessage"),
      sender: "ai",
      emotion: t("emotions.joy"),
    },
  ]);
  const [input, setInput] = useState("");
  const [messageCount, setMessageCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const demoResponses = getDemoResponses(t);

  const handleSend = async () => {
    if (!input.trim() || messageCount >= 3) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length,
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setMessageCount((prev) => prev + 1);
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find matching response
    const lowerInput = input.toLowerCase();
    let response = demoResponses.find((r) =>
      r.trigger.some((t) => lowerInput.includes(t))
    );

    if (!response) {
      response = demoResponses[demoResponses.length - 1];
    }

    // Add AI response
    const aiMessage: Message = {
      id: messages.length + 1,
      text: response.response,
      sender: "ai",
      emotion: response.emotion,
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsTyping(false);

    // Show signup prompt after 3 messages
    if (messageCount + 1 >= 3) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const promptMessage: Message = {
        id: messages.length + 2,
        text: t("signupPrompt"),
        sender: "ai",
        emotion: t("emotions.anticipation"),
      };
      setMessages((prev) => [...prev, promptMessage]);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-4">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {t("badge")}
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t("title")}{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              {t("titleHighlight")}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="overflow-hidden shadow-2xl border-2">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm">
                  <img
                    src="/personajes/luna/cara.webp"
                    alt="Luna"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{t("chat.header.name")}</h3>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    {t("chat.header.status")}
                  </div>
                </div>
                <div className="ml-auto">
                  <div className="text-white/80 text-sm">
                    {messageCount}/3 {t("chat.header.messages")}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-muted/20 to-transparent">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                          : "bg-card border border-border"
                      } rounded-2xl px-4 py-3 shadow-md`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      {message.emotion && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <div className="flex items-center gap-2 text-xs opacity-70">
                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                            {t("chat.emotionLabel")}: {message.emotion}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-card border border-border rounded-2xl px-4 py-3 shadow-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-border bg-muted/20">
              {messageCount >= 3 ? (
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-base font-semibold"
                  size="lg"
                >
                  {t("chat.continueButton")}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={t("chat.inputPlaceholder")}
                    className="flex-1 h-12"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Info boxes */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card className="p-4 text-center bg-card/50 backdrop-blur-sm">
              <div className="text-2xl mb-2">🧠</div>
              <div className="text-sm font-semibold">{t("info.memory")}</div>
            </Card>
            <Card className="p-4 text-center bg-card/50 backdrop-blur-sm">
              <div className="text-2xl mb-2">💭</div>
              <div className="text-sm font-semibold">{t("info.emotions")}</div>
            </Card>
            <Card className="p-4 text-center bg-card/50 backdrop-blur-sm">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-sm font-semibold">{t("info.instant")}</div>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
