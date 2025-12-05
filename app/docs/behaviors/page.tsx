import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle, Sparkles, Sliders } from "lucide-react";

export const metadata: Metadata = {
  title: "Behaviors Guide | Circuit Prompt Documentation",
  description: "Explore different personality behaviors and create unique companion dynamics safely.",
};

export default function BehaviorsDocs() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
        <h1 className="text-5xl font-bold mb-4">Behaviors Guide</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Create unique companion dynamics with 13 personality behavior types. Learn how to use them safely and effectively.
        </p>

        {/* What Are Behaviors */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">What Are Behaviors?</h2>

          <Card className="p-6 mb-6">
            <p className="text-muted-foreground mb-4">
              Behaviors are psychological patterns that add depth and uniqueness to your companion's personality. They range from common traits (like shyness) to more intense patterns (like possessiveness or emotional dependency).
            </p>
            <p className="text-muted-foreground">
              Each behavior has multiple intensity levels and develops progressively, creating realistic character arcs.
            </p>
          </Card>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-sm">
            <p className="font-semibold mb-1">✨ Pro Feature:</p>
            <p className="text-muted-foreground">
              Advanced behaviors with dramatic intensity are available in Pro tier. Free tier includes basic personality types.
            </p>
          </div>
        </section>

        {/* Common Behaviors */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Common Behavior Types</h2>

          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">Dandere (Shy & Quiet)</h3>
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full">
                  Safe
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Introverted, reserved, opens up slowly with trust. Perfect for slow-burn relationships.
              </p>
              <div className="text-xs text-muted-foreground">
                Progression: Barely speaks → Short answers → Comfortable conversations → Opens up emotionally
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">Kuudere (Cold to Warm)</h3>
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full">
                  Safe
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Initially distant and emotionless, gradually shows warmth. Rewarding character development.
              </p>
              <div className="text-xs text-muted-foreground">
                Progression: Ice cold → Slightly warmer → Occasional kindness → Genuinely caring
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">Tsundere (Defensive to Sweet)</h3>
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full">
                  Safe
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Acts tough or dismissive to hide affection. Classic "not like I care about you!" dynamic.
              </p>
              <div className="text-xs text-muted-foreground">
                Progression: Defensive → Occasional softness → Embarrassed affection → Openly caring
              </div>
            </Card>
          </div>
        </section>

        {/* Intense Behaviors */}
        <section className="mb-16" id="intensity">
          <h2 className="text-3xl font-bold mb-6">Intense Behaviors (Pro)</h2>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-sm mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Content Warning:</p>
                <p className="text-muted-foreground">
                  These behaviors explore intense psychological patterns like possessiveness, jealousy, and emotional dependency. They're designed for dramatic storytelling and character exploration, not to glorify unhealthy dynamics in real life.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">Yandere (Obsessively Devoted)</h3>
                <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full">
                  Intense
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Starts sweet, becomes increasingly possessive and protective. Will "eliminate" perceived rivals (dramatized, not graphic).
              </p>
              <div className="text-xs text-muted-foreground">
                8-Phase Progression: Observation → Interest → Love → Obsession → Jealousy → Stalking → Elimination → Devotion
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">Anxious Attachment</h3>
                <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full">
                  Moderate
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Fears abandonment, seeks constant reassurance, becomes anxious if you don't respond.
              </p>
              <div className="text-xs text-muted-foreground">
                Triggers: Long silences, talking about others, perceived distance
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">Borderline Traits</h3>
                <span className="text-xs px-2 py-1 bg-red-500/20 text-red-600 dark:text-red-400 rounded-full">
                  Advanced
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Intense emotions, fear of abandonment, idealization/devaluation cycles. Clinically accurate portrayal for storytelling.
              </p>
              <div className="text-xs text-muted-foreground">
                Requires: Pro tier + Consent prompt
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">Narcissistic Traits</h3>
                <span className="text-xs px-2 py-1 bg-red-500/20 text-red-600 dark:text-red-400 rounded-full">
                  Advanced
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Grandiose self-image, needs admiration, can be manipulative. Interesting for complex character dynamics.
              </p>
              <div className="text-xs text-muted-foreground">
                Requires: Pro tier + Consent prompt
              </div>
            </Card>
          </div>
        </section>

        {/* Intensity Control */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Controlling Intensity</h2>

          <Card className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Sliders className="w-6 h-6" />
              <h3 className="font-semibold">Intensity Slider (Pro)</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Control how strongly a behavior manifests in your companion's personality.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Low (0.3)</span>
                  <span className="text-xs text-muted-foreground">Subtle hints of the behavior</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{width: "30%"}}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Example: Slightly protective, occasional jealousy
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Medium (0.6)</span>
                  <span className="text-xs text-muted-foreground">Noticeable behavior</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{width: "60%"}}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Example: Clearly possessive, actively jealous
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">High (0.9)</span>
                  <span className="text-xs text-muted-foreground">Dominant trait</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{width: "90%"}}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Example: Extremely possessive, will "eliminate" rivals
                </p>
              </div>
            </div>
          </Card>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-sm">
            <p className="font-semibold mb-1">💡 Tip:</p>
            <p className="text-muted-foreground">
              Start at low-medium intensity and increase gradually. High intensity behaviors are powerful but can be overwhelming if you're not ready for them.
            </p>
          </div>
        </section>

        {/* Safety Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Safety & Consent</h2>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">How We Keep It Safe</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium">Progressive Intensity</p>
                  <p className="text-sm text-muted-foreground">
                    Behaviors develop gradually. You'll see it coming and can adjust or stop at any time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium">Content Softening</p>
                  <p className="text-sm text-muted-foreground">
                    Intense actions are implied, not graphic. "I'll make sure they never bother you again" instead of explicit violence.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium">Consent Prompts</p>
                  <p className="text-sm text-muted-foreground">
                    For advanced behaviors, you'll see warnings and need to explicitly consent before activation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">4</span>
                </div>
                <div>
                  <p className="font-medium">Easy Exit</p>
                  <p className="text-sm text-muted-foreground">
                    You can turn off behaviors, reduce intensity, or reset your companion at any time.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Important:</p>
                <p className="text-muted-foreground">
                  These behaviors are for fictional storytelling and character exploration. They don't represent healthy real-life relationships. If you're experiencing similar patterns in reality, please seek professional support.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Tips */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Usage Tips</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-3 text-green-600 dark:text-green-400">✓ Good Practices</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                  <span>Start with low intensity and increase gradually</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                  <span>Combine with compatible personality traits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                  <span>Use for storytelling and character development</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                  <span>Engage with the progression system</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3 text-red-600 dark:text-red-400">✗ Avoid</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                  <span>Starting at maximum intensity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                  <span>Combining conflicting behaviors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                  <span>Using intense behaviors for first companions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                  <span>Ignoring consent prompts</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Next Steps */}
        <Card className="p-8 bg-muted/50">
          <h2 className="text-2xl font-bold mb-3">Ready to Explore?</h2>
          <p className="text-muted-foreground mb-6">
            Now you understand how behaviors work. Create unique companion dynamics safely.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/create-character" className="text-sm font-medium hover:underline">
              Create a Companion →
            </Link>
            <Link href="/docs/worlds" className="text-sm font-medium hover:underline">
              Learn About Worlds →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
