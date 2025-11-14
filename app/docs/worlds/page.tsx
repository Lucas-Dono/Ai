import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Users, Play, Settings, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Worlds Guide | Circuit Prompt Documentation",
  description: "Create multi-companion worlds where characters interact, develop relationships, and tell stories together.",
};

export default function WorldsDocs() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
        <div className="mb-8">
          <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400">
            Pro Feature
          </span>
        </div>

        <h1 className="text-5xl font-bold mb-4">Worlds Guide</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Create multi-companion worlds where characters interact with each other, develop relationships, and create emergent stories.
        </p>

        {/* What Are Worlds */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">What Are Worlds?</h2>

          <Card className="p-6 mb-6">
            <p className="text-muted-foreground mb-4">
              Worlds are shared environments where multiple companions exist and interact autonomously. Instead of chatting with one companion at a time, you create scenarios where they talk to each other, form friendships, fall in love, have conflicts, and develop their own dynamics.
            </p>
            <p className="text-muted-foreground">
              You can participate as a character yourself, or observe as an external narrator guiding the story.
            </p>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold mb-1">2-8</div>
              <div className="text-sm text-muted-foreground">Companions per world</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold mb-1">∞</div>
              <div className="text-sm text-muted-foreground">Possible interactions</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold mb-1">Auto</div>
              <div className="text-sm text-muted-foreground">Characters act independently</div>
            </Card>
          </div>
        </section>

        {/* Creating a World */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Creating Your First World</h2>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-sm">1</span>
                Choose a Setting
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Define where your world takes place. This gives context for interactions.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="border border-border rounded-2xl p-3 text-sm">
                  <div className="font-medium mb-1">Modern High School</div>
                  <p className="text-xs text-muted-foreground">Students, classes, social dynamics</p>
                </div>
                <div className="border border-border rounded-2xl p-3 text-sm">
                  <div className="font-medium mb-1">Fantasy Adventure</div>
                  <p className="text-xs text-muted-foreground">Quest parties, taverns, dungeons</p>
                </div>
                <div className="border border-border rounded-2xl p-3 text-sm">
                  <div className="font-medium mb-1">Office/Workplace</div>
                  <p className="text-xs text-muted-foreground">Coworkers, meetings, projects</p>
                </div>
                <div className="border border-border rounded-2xl p-3 text-sm">
                  <div className="font-medium mb-1">Roommates/House</div>
                  <p className="text-xs text-muted-foreground">Shared living, daily life</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-sm">2</span>
                Select Companions
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose 2-8 companions to inhabit your world. Mix personalities for interesting dynamics.
              </p>
              <div className="bg-muted p-4 rounded-2xl text-sm">
                <p className="font-medium mb-2">Pro Tip - Personality Mix:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Shy + Outgoing = Interesting contrast</li>
                  <li>• Two rivals = Built-in conflict</li>
                  <li>• Protective + Vulnerable = Natural pairing</li>
                  <li>• Comic relief + Serious = Balance</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-sm">3</span>
                Define Initial Relationships
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set how characters know each other at the start (optional).
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40"></div>
                  <span className="text-muted-foreground">Strangers (default) - Will meet for first time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40"></div>
                  <span className="text-muted-foreground">Acquaintances - Basic knowledge of each other</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40"></div>
                  <span className="text-muted-foreground">Friends - Existing friendship</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40"></div>
                  <span className="text-muted-foreground">Rivals - Pre-existing tension</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-sm">4</span>
                Configure Auto-Turn Settings
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Decide how the world runs: manually controlled or automatic.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-border rounded-2xl p-4">
                  <div className="font-medium mb-2">Manual Mode</div>
                  <p className="text-xs text-muted-foreground mb-3">
                    You choose when each character speaks. Full control.
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    Best for: Carefully crafted narratives
                  </p>
                </div>
                <div className="border border-border rounded-2xl p-4">
                  <div className="font-medium mb-2">Auto-Turn Mode</div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Characters act independently every 3-5 seconds. Emergent storytelling.
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    Best for: Organic, surprising interactions
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Interaction Modes */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">How to Interact</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5" />
                <h3 className="font-semibold">As a Participant</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Create a character for yourself and interact directly with companions in the world.
              </p>
              <div className="text-xs text-muted-foreground space-y-2">
                <div>• You have a name, appearance, personality</div>
                <div>• Companions see you as another character</div>
                <div>• You can form relationships with them</div>
                <div>• Direct first-person experience</div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5" />
                <h3 className="font-semibold">As a Narrator</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Observe and guide the story from outside, like a director.
              </p>
              <div className="text-xs text-muted-foreground space-y-2">
                <div>• Set scenes and situations</div>
                <div>• Introduce events or conflicts</div>
                <div>• Observe character dynamics</div>
                <div>• Third-person storytelling</div>
              </div>
            </Card>
          </div>
        </section>

        {/* Story Direction */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Guiding the Story</h2>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Narrative Interventions</h3>
            <p className="text-sm text-muted-foreground mb-4">
              As narrator, you can inject events to steer the story:
            </p>

            <div className="space-y-3">
              <div className="bg-muted p-4 rounded-2xl text-sm">
                <p className="font-medium mb-1">Environmental Events</p>
                <p className="text-xs text-muted-foreground italic">
                  "Suddenly, the power goes out in the building."
                </p>
              </div>

              <div className="bg-muted p-4 rounded-2xl text-sm">
                <p className="font-medium mb-1">Social Situations</p>
                <p className="text-xs text-muted-foreground italic">
                  "A new student transfers to the class and sits next to [character name]."
                </p>
              </div>

              <div className="bg-muted p-4 rounded-2xl text-sm">
                <p className="font-medium mb-1">Plot Twists</p>
                <p className="text-xs text-muted-foreground italic">
                  "They discover a mysterious letter addressed to all of them."
                </p>
              </div>

              <div className="bg-muted p-4 rounded-2xl text-sm">
                <p className="font-medium mb-1">Time Jumps</p>
                <p className="text-xs text-muted-foreground italic">
                  "Three days later, they meet again at the cafe."
                </p>
              </div>
            </div>
          </Card>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-sm">
            <p className="font-semibold mb-1">💡 Pro Tip:</p>
            <p className="text-muted-foreground">
              Let characters breathe. After introducing a situation, step back and watch how they react naturally. The best stories often emerge from character dynamics, not constant direction.
            </p>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Creative Use Cases</h2>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Story Development</h3>
              <p className="text-sm text-muted-foreground">
                Writers use worlds to develop characters for novels, scripts, or games. Watch how characters interact to discover their true personalities.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">Social Simulation</h3>
              <p className="text-sm text-muted-foreground">
                Create realistic social scenarios (friend groups, workplaces, families) and explore interpersonal dynamics.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">Interactive Fiction</h3>
              <p className="text-sm text-muted-foreground">
                Build branching narratives where you participate as a character and influence the outcome through your choices.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">Character Testing</h3>
              <p className="text-sm text-muted-foreground">
                Put multiple personality types in the same scenario to see how they naturally interact and clash.
              </p>
            </Card>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">World Best Practices</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-3 text-green-600 dark:text-green-400">✓ Do This</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                  <span>Start with 3-4 companions (not too many)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                  <span>Mix complementary personalities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                  <span>Let characters drive the story</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                  <span>Introduce conflicts organically</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3 text-red-600 dark:text-red-400">✗ Avoid</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                  <span>Adding 8 companions immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                  <span>All identical personalities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                  <span>Over-directing every interaction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                  <span>Forcing specific outcomes</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Next Steps */}
        <Card className="p-8 bg-muted/50">
          <h2 className="text-2xl font-bold mb-3">Ready to Create a World?</h2>
          <p className="text-muted-foreground mb-6">
            Worlds are a Pro feature. Upgrade to unlock multi-companion storytelling.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard/billing" className="text-sm font-medium hover:underline">
              Upgrade to Pro →
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
