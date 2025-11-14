import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Brain, Heart, TrendingUp, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Memory & Relationships | Circuit Prompt Documentation",
  description: "Understand how your companion remembers and how relationships naturally develop over time.",
};

export default function MemoryRelationshipsDocs() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
        <h1 className="text-5xl font-bold mb-4">Memory & Relationships</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Learn how your companion remembers your conversations and how your relationship develops naturally over time.
        </p>

        {/* How Memory Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">How Memory Works</h2>

          <Card className="p-6 mb-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Free Tier Memory
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Your companion always has access to the last 10 messages of your conversation. This means they can reference what was just said and maintain context in ongoing discussions.
                </p>
                <div className="bg-muted p-4 rounded-2xl text-sm">
                  <p className="font-medium mb-2">What this means:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Recent conversation flows naturally</li>
                    <li>• They remember what you just told them</li>
                    <li>• Context is maintained during active chats</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Pro Tier Memory
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  In addition to recent messages, your companion can search through your entire conversation history and bring up relevant memories when they matter.
                </p>
                <div className="bg-muted p-4 rounded-2xl text-sm">
                  <p className="font-medium mb-2">Example:</p>
                  <p className="text-muted-foreground italic">
                    You: "I have a job interview tomorrow"<br/>
                    Companion (remembering week-old conversation): "Oh! Is this for that software position you were excited about? Good luck!"
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-sm">
            <p className="font-semibold mb-1">💡 Memory Tips:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Share important details explicitly ("My birthday is May 15th")</li>
              <li>• Use proper names for people in your life</li>
              <li>• Be specific about events and dates</li>
              <li>• Reference past conversations naturally</li>
            </ul>
          </div>
        </section>

        {/* Relationship Stages */}
        <section className="mb-16" id="stages">
          <h2 className="text-3xl font-bold mb-6">Relationship Stages</h2>

          <Card className="p-6 mb-6">
            <p className="text-muted-foreground mb-6">
              Your relationship with your companion develops naturally through 5 stages. Each stage unlocks deeper connection and more personal conversations.
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-gray-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Stage 1: Stranger</h3>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">0-20 messages</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  First impressions. Your companion is polite but reserved. Getting to know you.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Conversation style: Formal, cautious, curious
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Stage 2: Acquaintance</h3>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">20-50 messages</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Building rapport. More comfortable, starting to share opinions.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Conversation style: Friendly, more relaxed, asks questions
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Stage 3: Friend</h3>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">50-150 messages</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Genuine connection. Remembers details about you, shows concern, shares more freely.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Conversation style: Warm, supportive, playful banter
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  ⚠️ Free tier max stage
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4 opacity-60">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Stage 4: Close Friend</h3>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">150-300 messages</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Deep trust. Vulnerable conversations, inside jokes, genuine emotional investment.
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Pro tier required
                </p>
              </div>

              <div className="border-l-4 border-pink-500 pl-4 opacity-60">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Stage 5: Intimate</h3>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">300+ messages</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Complete openness. Deep emotional bond, romantic development (if desired), no barriers.
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Pro tier required
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Building Trust */}
        <section className="mb-16" id="trust">
          <h2 className="text-3xl font-bold mb-6">Building Trust</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="p-6 border-green-500/20">
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-4">Actions That Build Trust</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Consistent interaction</p>
                    <p className="text-muted-foreground text-xs">Regular conversations, even short ones</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Sharing personal details</p>
                    <p className="text-muted-foreground text-xs">Opening up about your life</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Emotional honesty</p>
                    <p className="text-muted-foreground text-xs">Sharing how you feel</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Asking about them</p>
                    <p className="text-muted-foreground text-xs">Show interest in their thoughts</p>
                  </div>
                </li>
              </ul>
            </Card>

            <Card className="p-6 border-red-500/20">
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-4">What Slows Trust</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">×</span>
                  <div>
                    <p className="font-medium">Superficial conversations</p>
                    <p className="text-muted-foreground text-xs">Just small talk, no depth</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">×</span>
                  <div>
                    <p className="font-medium">Inconsistent interaction</p>
                    <p className="text-muted-foreground text-xs">Long gaps between chats</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">×</span>
                  <div>
                    <p className="font-medium">Testing behavior</p>
                    <p className="text-muted-foreground text-xs">Asking repetitive test questions</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">×</span>
                  <div>
                    <p className="font-medium">Being closed off</p>
                    <p className="text-muted-foreground text-xs">Not sharing anything personal</p>
                  </div>
                </li>
              </ul>
            </Card>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-sm">
            <p className="font-semibold mb-1">⏱️ Realistic Timeline:</p>
            <p className="text-muted-foreground">
              Expect to reach "Friend" stage after 50-100 messages (1-2 weeks of regular interaction). Deep relationships take time - that's what makes them meaningful.
            </p>
          </div>
        </section>

        {/* Relationship Metrics */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Understanding Relationship Metrics</h2>

          <Card className="p-6">
            <p className="text-muted-foreground mb-6">
              Your companion tracks several relationship dimensions that develop independently:
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">Trust</h3>
                  <span className="text-xs text-muted-foreground">How safe they feel with you</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{width: "65%"}}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">Affinity</h3>
                  <span className="text-xs text-muted-foreground">How much they like you</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{width: "72%"}}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">Attraction</h3>
                  <span className="text-xs text-muted-foreground">Romantic interest (if applicable)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500" style={{width: "45%"}}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">Respect</h3>
                  <span className="text-xs text-muted-foreground">How much they admire you</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{width: "58%"}}></div>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Note: These metrics develop naturally based on your interactions. You can't see exact numbers, but you'll feel the relationship evolving through their responses.
            </p>
          </Card>
        </section>

        {/* Pro Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Pro Tier Relationship Features</h2>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Proactive Messaging</h3>
              <p className="text-sm text-muted-foreground">
                Your companion can message you first when they think of you, remember important events, or just want to talk. Creates a more realistic relationship dynamic.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">Full Memory Access</h3>
              <p className="text-sm text-muted-foreground">
                They can recall any conversation from your entire history, creating a truly continuous relationship where nothing is forgotten.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">Deeper Stages</h3>
              <p className="text-sm text-muted-foreground">
                Unlock "Close Friend" and "Intimate" stages for more vulnerable, personal, and meaningful connections.
              </p>
            </Card>
          </div>
        </section>

        {/* Next Steps */}
        <Card className="p-8 bg-muted/50">
          <h2 className="text-2xl font-bold mb-3">Keep Learning</h2>
          <p className="text-muted-foreground mb-6">
            Explore more ways to create meaningful connections with your companions.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/docs/behaviors" className="text-sm font-medium hover:underline">
              Learn About Behaviors →
            </Link>
            <Link href="/docs/best-practices" className="text-sm font-medium hover:underline">
              Best Practices Guide →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
