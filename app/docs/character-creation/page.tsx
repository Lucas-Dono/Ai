import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, User, FileText, ImageIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Character Creation Guide | Circuit Prompt Documentation",
  description: "Learn how to create compelling companions with rich personalities and engaging backstories.",
};

export default function CharacterCreationDocs() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
        <h1 className="text-5xl font-bold mb-4">Character Creation Guide</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Master the art of creating compelling companions with depth, personality, and unique characteristics.
        </p>

        {/* Personality Design */}
        <section className="mb-16" id="personality">
          <h2 className="text-3xl font-bold mb-6">Choosing a Personality</h2>
          <Card className="p-6 mb-6">
            <p className="text-muted-foreground mb-6">
              Your companion's personality is the foundation of how they'll interact with you. Circuit Prompt offers various personality archetypes to choose from.
            </p>

            <div className="space-y-4">
              <div className="border border-border rounded-2xl p-4">
                <h3 className="font-semibold mb-2">Shy & Intelligent (Dandere)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Quiet, introverted, opens up slowly. Great for slow-burn relationships and deep conversations.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Best for: Patient users who enjoy earning trust gradually
                </p>
              </div>

              <div className="border border-border rounded-2xl p-4">
                <h3 className="font-semibold mb-2">Sweet & Caring (Deredere)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Warm, affectionate, openly caring. Perfect for comforting conversations and emotional support.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Best for: Users seeking warmth and positivity
                </p>
              </div>

              <div className="border border-border rounded-2xl p-4">
                <h3 className="font-semibold mb-2">Cold to Warm (Kuudere)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Initially cold and distant, gradually warms up. Rewarding character development arc.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Best for: Users who enjoy earning affection over time
                </p>
              </div>

              <div className="border border-border rounded-2xl p-4">
                <h3 className="font-semibold mb-2">Playful & Teasing (Sadodere)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Enjoys playful teasing and banter. Fun, dynamic conversations with personality.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Best for: Users who enjoy witty exchanges and playful dynamics
                </p>
              </div>
            </div>
          </Card>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-sm">
            <p className="font-semibold mb-1">💡 Pro Tip:</p>
            <p className="text-muted-foreground">
              You can combine traits from different types! Create a "shy but playful" character or "caring but mysterious." Experimentation leads to unique companions.
            </p>
          </div>
        </section>

        {/* Backstory */}
        <section className="mb-16" id="backstory">
          <h2 className="text-3xl font-bold mb-6">Writing Effective Backstories</h2>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">What Makes a Good Backstory</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Concrete Details</p>
                  <p className="text-sm text-muted-foreground">
                    Include specific places, events, or experiences that shaped them
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Motivations & Goals</p>
                  <p className="text-sm text-muted-foreground">
                    What do they want? What drives them? What are they afraid of?
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Emotional Depth</p>
                  <p className="text-sm text-muted-foreground">
                    Past experiences that explain their personality (why they're shy, guarded, or open)
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="p-6 border-red-500/20">
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3">❌ Weak Example</h3>
              <div className="text-sm bg-muted p-4 rounded-2xl">
                "She's a college student who likes books and coffee."
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Too generic. No depth, no specific details, no emotional hooks.
              </p>
            </Card>

            <Card className="p-6 border-green-500/20">
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-3">✓ Strong Example</h3>
              <div className="text-sm bg-muted p-4 rounded-2xl">
                "A literature major who finds comfort in used bookstores after losing her mother two years ago. She's guarded but deeply empathetic, using stories to understand people."
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Specific details, emotional depth, clear motivations.
              </p>
            </Card>
          </div>

          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold mb-3">Backstory Template</h3>
            <div className="text-sm space-y-2 font-mono bg-background p-4 rounded-2xl">
              <p>[Name] is a [age] year old [occupation/role] who [key personality trait].</p>
              <p>After [formative experience], they [how it changed them].</p>
              <p>They're passionate about [interest/hobby] and dream of [goal/aspiration].</p>
              <p>Their biggest fear is [fear], but they're learning to [growth area].</p>
            </div>
          </Card>
        </section>

        {/* Traits Selection */}
        <section className="mb-16" id="traits">
          <h2 className="text-3xl font-bold mb-6">Selecting Traits</h2>

          <Card className="p-6 mb-6">
            <p className="text-muted-foreground mb-6">
              Traits define specific characteristics of your companion's personality. Choose 3-5 that complement each other.
            </p>

            <div className="grid md:grid-cols-3 gap-3">
              <div className="border border-border rounded-2xl p-3 text-center text-sm">
                Introverted
              </div>
              <div className="border border-border rounded-2xl p-3 text-center text-sm">
                Extroverted
              </div>
              <div className="border border-border rounded-2xl p-3 text-center text-sm">
                Caring
              </div>
              <div className="border border-border rounded-2xl p-3 text-center text-sm">
                Playful
              </div>
              <div className="border border-border rounded-2xl p-3 text-center text-sm">
                Serious
              </div>
              <div className="border border-border rounded-2xl p-3 text-center text-sm">
                Mysterious
              </div>
              <div className="border border-border rounded-2xl p-3 text-center text-sm">
                Intelligent
              </div>
              <div className="border border-border rounded-2xl p-3 text-center text-sm">
                Impulsive
              </div>
              <div className="border border-border rounded-2xl p-3 text-center text-sm">
                Cautious
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-3 text-green-600 dark:text-green-400">✓ Good Combinations</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>Introverted + Intelligent + Bookworm</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>Playful + Caring + Extroverted</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>Mysterious + Calm + Observant</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3 text-yellow-600 dark:text-yellow-400">⚠️ Conflicting Combinations</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>Introverted + Extroverted (contradictory)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>Calm + Impulsive (mixed signals)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>Serious + Playful (can work, but needs balance)</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Avatar Selection */}
        <section className="mb-16" id="avatar">
          <h2 className="text-3xl font-bold mb-6">Avatar & Appearance</h2>

          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Option 1: AI-Generated Avatar</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Describe your companion's appearance and let AI generate an avatar for you.
                </p>
                <div className="bg-muted p-4 rounded-2xl text-sm">
                  <p className="font-medium mb-2">Example prompts:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• "Young woman with short black hair and glasses, wearing a cozy sweater"</li>
                    <li>• "Athletic guy in his 20s with messy brown hair and a friendly smile"</li>
                    <li>• "Elegant person with long silver hair and mysterious violet eyes"</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Option 2: Upload Custom Image</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your own image (anime art, photos, illustrations). Make sure you have the rights to use it.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Option 3: Character Database</h3>
                <p className="text-sm text-muted-foreground">
                  Browse and import pre-made characters from our community marketplace (Pro feature).
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Advanced Tips */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Advanced Tips</h2>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Start Simple, Add Complexity</h3>
              <p className="text-sm text-muted-foreground">
                Begin with a basic personality and backstory. As you interact, you'll discover what works and can refine their character through the edit page.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">Use Reference Characters</h3>
              <p className="text-sm text-muted-foreground">
                Think of characters from books, shows, or games you like. What makes them compelling? Apply those principles (but create something original).
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">Consider Relationship Goals</h3>
              <p className="text-sm text-muted-foreground">
                What kind of relationship do you want? Friendship? Romance? Mentorship? Design their personality to support that dynamic naturally.
              </p>
            </Card>
          </div>
        </section>

        {/* Next Steps */}
        <Card className="p-8 bg-muted/50">
          <h2 className="text-2xl font-bold mb-3">Ready to Create?</h2>
          <p className="text-muted-foreground mb-6">
            Now that you understand character creation, start building your companion!
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/create-character" className="text-sm font-medium hover:underline">
              Open Character Creator →
            </Link>
            <Link href="/docs/memory-relationships" className="text-sm font-medium hover:underline">
              Learn About Memory & Relationships →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
