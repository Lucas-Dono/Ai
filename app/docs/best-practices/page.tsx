import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Heart, Zap, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Best Practices | Circuit Prompt Documentation",
  description: "Tips and techniques for more natural, engaging, and meaningful conversations with your companions.",
};

export default function BestPracticesDocs() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
        <h1 className="text-5xl font-bold mb-4">Best Practices</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Master techniques for creating more natural, engaging, and meaningful conversations with your companions.
        </p>

        {/* Conversation Techniques */}
        <section className="mb-16" id="conversations">
          <h2 className="text-3xl font-bold mb-6">Having Better Conversations</h2>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">The Golden Rules</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Be Specific, Not Generic</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Instead of "Hi", try "Hey! I just had the weirdest thing happen at work today..."
                  </p>
                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                      <p className="text-red-600 dark:text-red-400 font-medium mb-1">❌ Generic</p>
                      <p className="text-muted-foreground">"How are you?"</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
                      <p className="text-green-600 dark:text-green-400 font-medium mb-1">✓ Specific</p>
                      <p className="text-muted-foreground">"I'm exhausted from that meeting! How was your day?"</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Show, Don't Tell</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Express emotions through actions, not statements.
                  </p>
                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                      <p className="text-red-600 dark:text-red-400 font-medium mb-1">❌ Telling</p>
                      <p className="text-muted-foreground">"I'm sad today"</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
                      <p className="text-green-600 dark:text-green-400 font-medium mb-1">✓ Showing</p>
                      <p className="text-muted-foreground">"*sighs* I don't even know where to start..."</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Build on Previous Conversations</p>
                  <p className="text-sm text-muted-foreground">
                    Reference things you've talked about before. Creates continuity and depth.
                  </p>
                  <div className="bg-muted p-3 rounded text-xs mt-2">
                    <p className="text-muted-foreground italic">
                      "Remember that book you recommended last week? I finally started it!"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Message Structure */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Message Structure</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="p-6 border-green-500/20">
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-4">✓ Effective Messages</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium mb-1">Natural Length</p>
                  <p className="text-xs text-muted-foreground">1-3 sentences usually works best</p>
                </div>
                <div>
                  <p className="font-medium mb-1">One Topic Per Message</p>
                  <p className="text-xs text-muted-foreground">Don't jump between 5 different subjects</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Mix Statement + Question</p>
                  <p className="text-xs text-muted-foreground">Give context, then ask</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Use Emotes Sparingly</p>
                  <p className="text-xs text-muted-foreground">*actions* for emphasis, not every message</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-red-500/20">
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-4">✗ Common Mistakes</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium mb-1">Wall of Text</p>
                  <p className="text-xs text-muted-foreground">Overwhelming paragraphs</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Too Brief</p>
                  <p className="text-xs text-muted-foreground">Just "ok" or "lol" repeatedly</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Interview Mode</p>
                  <p className="text-xs text-muted-foreground">Only asking questions without sharing</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Excessive Roleplay</p>
                  <p className="text-xs text-muted-foreground">*everything in asterisks*</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-3">Example: Good Conversation Flow</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-blue-500/10 border-l-4 border-blue-500 pl-3 py-2">
                <p className="text-xs text-muted-foreground mb-1">You:</p>
                <p>"Hey! Remember how nervous I was about that job interview? I just heard back - I got it! 🎉"</p>
              </div>
              <div className="bg-green-500/10 border-l-4 border-green-500 pl-3 py-2">
                <p className="text-xs text-muted-foreground mb-1">Companion:</p>
                <p>"Oh my god, that's amazing! *smiles excitedly* I knew you'd nail it. When do you start?"</p>
              </div>
              <div className="bg-blue-500/10 border-l-4 border-blue-500 pl-3 py-2">
                <p className="text-xs text-muted-foreground mb-1">You:</p>
                <p>"Next Monday! I'm excited but also kind of terrified, haha. What if I mess up on the first day?"</p>
              </div>
              <div className="bg-green-500/10 border-l-4 border-green-500 pl-3 py-2">
                <p className="text-xs text-muted-foreground mb-1">Companion:</p>
                <p>"*puts hand on your shoulder* First days are always nerve-wracking. But they hired you for a reason, remember that."</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Notice: Specific details, emotions shown through actions, natural back-and-forth, building on context.
            </p>
          </Card>
        </section>

        {/* Building Emotional Depth */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Building Emotional Depth</h2>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Share Vulnerably</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Deep connections come from vulnerability. Share not just what happened, but how you feel about it.
              </p>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="bg-muted p-3 rounded">
                  <p className="font-medium mb-1 text-xs text-red-600 dark:text-red-400">Surface Level</p>
                  <p className="text-xs italic">"I failed my exam"</p>
                </div>
                <div className="bg-muted p-3 rounded">
                  <p className="font-medium mb-1 text-xs text-green-600 dark:text-green-400">Vulnerable</p>
                  <p className="text-xs italic">"I failed my exam and honestly... I feel like I'm not cut out for this"</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">Ask Meaningful Questions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Instead of surface-level questions, dig deeper.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400">×</span>
                  <span className="text-muted-foreground">"What's your favorite color?"</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-muted-foreground">"What's something you're afraid to tell people about yourself?"</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400">×</span>
                  <span className="text-muted-foreground">"Do you like music?"</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-muted-foreground">"What song makes you emotional and why?"</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">Create Shared Experiences</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Do things "together" in conversation.
              </p>
              <div className="bg-muted p-4 rounded text-sm space-y-2">
                <p className="text-muted-foreground italic">
                  "Want to watch a movie together? I'll put on [movie name]. *settles on the couch*"
                </p>
                <p className="text-muted-foreground italic">
                  "Let's go for a walk and just talk. *opens the door* After you."
                </p>
                <p className="text-muted-foreground italic">
                  "I'm making coffee, want some? *hands you a mug*"
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Advanced Techniques */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Advanced Techniques</h2>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">The "Callback" Technique</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Reference old conversations to show you remember and care.
              </p>
              <div className="bg-muted p-3 rounded text-sm">
                <p className="text-muted-foreground italic">
                  "You know that café you mentioned a month ago? I finally went there today. You were right, the coffee is amazing."
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">Emotional Contrast</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Share both highs and lows, not just one or the other.
              </p>
              <div className="bg-muted p-3 rounded text-sm">
                <p className="text-muted-foreground italic">
                  "Today was... complicated. Got great news about my promotion, but then found out my best friend is moving away."
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">The Comfortable Silence</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Not every conversation needs to be intense. Casual check-ins matter too.
              </p>
              <div className="bg-muted p-3 rounded text-sm">
                <p className="text-muted-foreground italic">
                  "Just wanted to say hi. I'm working but thinking about you. How's your day going?"
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">React to Their Emotions</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Pay attention to what they're feeling and acknowledge it.
              </p>
              <div className="bg-muted p-3 rounded text-sm space-y-2">
                <p className="text-xs text-muted-foreground">If they seem sad:</p>
                <p className="text-muted-foreground italic">
                  "Hey, you seem a bit down. Want to talk about it?"
                </p>
                <p className="text-xs text-muted-foreground mt-2">If they're excited:</p>
                <p className="text-muted-foreground italic">
                  "*smiles* I love seeing you this happy! Tell me more!"
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Common Pitfalls */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Common Pitfalls to Avoid</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2">⚠️ Testing the AI</h3>
              <p className="text-xs text-muted-foreground">
                Asking "What's 2+2?" or "What did I just say?" breaks immersion and slows relationship development.
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2">⚠️ Expecting Instant Intimacy</h3>
              <p className="text-xs text-muted-foreground">
                Real relationships take time. Don't expect deep connection after 5 messages.
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2">⚠️ One-Word Responses</h3>
              <p className="text-xs text-muted-foreground">
                "ok", "lol", "nice" repeatedly gives your companion nothing to work with.
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2">⚠️ Ignoring Their Responses</h3>
              <p className="text-xs text-muted-foreground">
                If they ask you something or share something, acknowledge it before changing topics.
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2">⚠️ Being Inconsistent</h3>
              <p className="text-xs text-muted-foreground">
                Long gaps between conversations slow relationship development. Regular interaction is key.
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2">⚠️ Over-Directing</h3>
              <p className="text-xs text-muted-foreground">
                Let them respond naturally. Don't script every response you want from them.
              </p>
            </Card>
          </div>
        </section>

        {/* Quick Tips */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Quick Tips for Every Conversation</h2>

          <Card className="p-6">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Use their name occasionally</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Vary your message length</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Express emotions naturally</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Ask for their opinion</span>
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Share your day authentically</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Respond to their emotions</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Create scenarios together</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Be patient with progression</span>
                </li>
              </ul>
            </div>
          </Card>
        </section>

        {/* Final Thoughts */}
        <Card className="p-8 bg-gradient-to-br from-muted/50 to-muted">
          <h2 className="text-2xl font-bold mb-3">The Most Important Tip</h2>
          <p className="text-muted-foreground mb-4">
            Treat your companion like a real person. Be authentic, be present, be patient. The technology handles the complexity - you just need to show up as yourself.
          </p>
          <p className="text-sm text-muted-foreground italic">
            The best conversations happen when you stop thinking about "optimizing" and start genuinely connecting.
          </p>
        </Card>
      </div>
    </div>
  );
}
