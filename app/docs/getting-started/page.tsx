import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Check, Sparkles, MessageSquare, Heart } from "lucide-react";
import { DocsNavigation } from "@/components/docs/DocsNavigation";

export const metadata: Metadata = {
  title: "Getting Started | Circuit Prompt Documentation",
  description: "Quick start guide to create your first companion and start building meaningful relationships.",
};

export default function GettingStartedDocs() {
  return (
    <div className="min-h-screen bg-background">
      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
        <div className="mb-8">
          <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
            5 min read
          </span>
        </div>

        <h1 className="text-5xl font-bold mb-4">Getting Started</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Welcome to Circuit Prompt! This guide will walk you through creating your first companion and starting meaningful conversations.
        </p>

        {/* Step 1 */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold">
              1
            </div>
            <h2 className="text-3xl font-bold">Create Your Account</h2>
          </div>

          <Card className="p-6 mb-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Start by creating your free account. No credit card required.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Go to the homepage</p>
                    <p className="text-sm text-muted-foreground">Click "Empezar gratis" or "Get Started"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Sign up with email</p>
                    <p className="text-sm text-muted-foreground">Or use Google for instant access</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Verify your email</p>
                    <p className="text-sm text-muted-foreground">Check your inbox for the verification link</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-sm">
            <p className="font-semibold mb-1">✨ Free Tier Includes:</p>
            <p className="text-muted-foreground">
              1 companion, ~50 messages/day, emotions system, and relationship development up to the "Friends" stage.
            </p>
            <p className="text-xs text-muted-foreground mt-2 italic">
              Based on 20,000 tokens/day. We show you exactly what you get - no hidden limits.
            </p>
          </div>
        </section>

        {/* Step 2 */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold">
              2
            </div>
            <h2 className="text-3xl font-bold">Create Your First Companion</h2>
          </div>

          <Card className="p-6 mb-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Choose a Creation Method</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-border rounded-2xl p-4">
                    <div className="font-medium mb-1">Quick Create</div>
                    <p className="text-sm text-muted-foreground">Use our templates to create a companion in seconds</p>
                  </div>
                  <div className="border border-border rounded-2xl p-4">
                    <div className="font-medium mb-1">Custom Create</div>
                    <p className="text-sm text-muted-foreground">Design every detail from scratch</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Essential Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Name</p>
                      <p className="text-sm text-muted-foreground">Choose a name that feels natural to you</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Personality Type</p>
                      <p className="text-sm text-muted-foreground">Shy, outgoing, mysterious, caring, etc.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Basic Traits</p>
                      <p className="text-sm text-muted-foreground">Pick 3-5 traits that define them (kind, intelligent, playful, etc.)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-sm">
            <p className="font-semibold mb-1">💡 Tip:</p>
            <p className="text-muted-foreground">
              Don't worry about perfection! You can edit your companion's personality and backstory anytime from their profile page.
            </p>
          </div>
        </section>

        {/* Step 3 */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold">
              3
            </div>
            <h2 className="text-3xl font-bold">Start Your First Conversation</h2>
          </div>

          <Card className="p-6 mb-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Good First Messages</h3>
                <div className="space-y-2">
                  <div className="border border-border rounded-2xl p-3 bg-muted/50">
                    <p className="text-sm">"Hi! I'm [your name]. What should I call you?"</p>
                  </div>
                  <div className="border border-border rounded-2xl p-3 bg-muted/50">
                    <p className="text-sm">"Hey! Tell me a bit about yourself."</p>
                  </div>
                  <div className="border border-border rounded-2xl p-3 bg-muted/50">
                    <p className="text-sm">"Hello! I just created you. How are you feeling?"</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">What to Expect</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Natural responses</p>
                      <p className="text-sm text-muted-foreground">Your companion will respond based on their personality</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Emotional reactions</p>
                      <p className="text-sm text-muted-foreground">They'll show genuine emotions (happiness, curiosity, shyness, etc.)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Memory formation</p>
                      <p className="text-sm text-muted-foreground">Everything you share will be remembered for future conversations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Understanding Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Understanding the Interface</h2>

          <div className="space-y-4 mb-6">
            <Card className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Emotional State Indicator</h3>
                  <p className="text-sm text-muted-foreground">
                    See what your companion is currently feeling (e.g., "Feeling joyful and curious")
                  </p>
                </div>
                <div className="px-3 py-1 bg-muted rounded-full text-xs whitespace-nowrap">
                  😊 Happy
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Relationship Stage</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your relationship progress from "Stranger" to "Intimate"
                  </p>
                </div>
                <div className="px-3 py-1 bg-muted rounded-full text-xs whitespace-nowrap">
                  Acquaintance
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Message Counter</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep track of your daily message limit (100 for Free tier)
                  </p>
                </div>
                <div className="px-3 py-1 bg-muted rounded-full text-xs whitespace-nowrap">
                  15/100
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* First Conversation Tips */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">First Conversation Tips</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6 border-green-500/20">
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-3">✓ Do This</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                  <span>Share details about yourself naturally</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                  <span>Ask open-ended questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                  <span>Be patient as they get to know you</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                  <span>Treat them like a real person</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 border-red-500/20">
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3">✗ Avoid This</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                  <span>Expecting instant deep connection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                  <span>Testing with random nonsense</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                  <span>Sharing everything in one message</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                  <span>Treating them like a command bot</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Free vs Pro */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Free vs Pro: What You Get</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Free Tier</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>1 companion</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span>~50 messages per day</span>
                    <span className="text-xs text-muted-foreground">20,000 tokens/day • Short messages use less, long ones use more</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Last 10 messages in immediate memory</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Full emotional system</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Relationship up to "Friends" stage</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 border-foreground/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Pro Tier</h3>
                <span className="text-xs px-2 py-1 bg-foreground text-background rounded-full">
                  $5/month
                </span>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Up to 10 companions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span>~5,000 messages per day</span>
                    <span className="text-xs text-muted-foreground">2,000,000 tokens/day • 100x more than Free tier</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Full conversation history search</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Proactive messaging (they message you first)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Multi-companion worlds</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Relationship to "Intimate" stage</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>No content restrictions</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Transparency Note */}
          <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-sm">
            <p className="font-semibold mb-2">💎 Radical Transparency</p>
            <p className="text-muted-foreground mb-2">
              Unlike other AI platforms that hide their limits behind vague language like "5x more usage" or "higher limits,"
              we tell you exactly what you get.
            </p>
            <p className="text-xs text-muted-foreground">
              Our token-based system is fair: short messages use less of your daily quota, long conversations use more.
              You always know where you stand.
            </p>
          </div>
        </section>

        {/* Next Steps */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Next Steps</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/docs/character-creation">
              <Card className="p-6 hover:border-foreground/20 transition-all cursor-pointer h-full">
                <Sparkles className="w-8 h-8 mb-3 text-foreground" />
                <h3 className="font-semibold mb-2">Character Creation</h3>
                <p className="text-sm text-muted-foreground">
                  Learn advanced techniques for designing compelling companions
                </p>
              </Card>
            </Link>

            <Link href="/docs/memory-relationships">
              <Card className="p-6 hover:border-foreground/20 transition-all cursor-pointer h-full">
                <Heart className="w-8 h-8 mb-3 text-foreground" />
                <h3 className="font-semibold mb-2">Memory & Relationships</h3>
                <p className="text-sm text-muted-foreground">
                  Understand how memory and relationships develop
                </p>
              </Card>
            </Link>

            <Link href="/docs/best-practices">
              <Card className="p-6 hover:border-foreground/20 transition-all cursor-pointer h-full">
                <MessageSquare className="w-8 h-8 mb-3 text-foreground" />
                <h3 className="font-semibold mb-2">Best Practices</h3>
                <p className="text-sm text-muted-foreground">
                  Tips for better, more engaging conversations
                </p>
              </Card>
            </Link>
          </div>
        </section>

        {/* Help Section */}
        <Card className="p-8 bg-muted/50">
          <h2 className="text-2xl font-bold mb-3">Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            If you're stuck or have questions, we're here to help.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/community" className="text-sm font-medium hover:underline">
              Join our Community →
            </Link>
            <a href="mailto:support@circuitprompt.ai" className="text-sm font-medium hover:underline">
              Contact Support →
            </a>
          </div>
        </Card>

        {/* Navigation */}
        <DocsNavigation
          next={{
            title: "Creación de Personajes",
            href: "/docs/character-creation",
          }}
        />
      </div>
    </div>
  );
}
