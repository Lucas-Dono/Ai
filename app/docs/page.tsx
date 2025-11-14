import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { BookOpen, Sparkles, Users, Zap, Code, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation | Circuit Prompt",
  description: "Learn how to create better companions, build deeper relationships, and get the most out of Circuit Prompt.",
};

export default function DocsPage() {
  const docsSections = [
    {
      icon: Zap,
      title: "Getting Started",
      description: "Quick start guide to create your first companion and start conversations in minutes.",
      href: "/docs/getting-started",
      topics: ["Create your first companion", "First conversation tips", "Understanding the interface", "Free vs Pro features"],
    },
    {
      icon: Sparkles,
      title: "Character Creation",
      description: "Learn how to craft compelling companions with rich personalities, backstories, and unique traits.",
      href: "/docs/character-creation",
      topics: ["Personality design", "Writing effective backstories", "Choosing traits", "Avatar selection"],
    },
    {
      icon: Users,
      title: "Memory & Relationships",
      description: "Understand how your companion remembers and how relationships develop over time.",
      href: "/docs/memory-relationships",
      topics: ["How memory works", "Building trust", "Relationship stages", "Memory tips"],
    },
    {
      icon: BookOpen,
      title: "Behaviors Guide",
      description: "Explore different personality behaviors and how to use them to create unique companion dynamics.",
      href: "/docs/behaviors",
      topics: ["13 behavior types", "Intensity settings", "Safe exploration", "Progression system"],
    },
    {
      icon: Users,
      title: "Worlds Guide",
      description: "Create multi-companion worlds where characters interact, develop relationships, and tell stories.",
      href: "/docs/worlds",
      topics: ["Creating worlds", "Managing characters", "Story direction", "Auto-turn settings"],
    },
    {
      icon: Lightbulb,
      title: "Best Practices",
      description: "Tips and techniques to get more natural, engaging, and meaningful conversations.",
      href: "/docs/best-practices",
      topics: ["Conversation tips", "Building depth", "Common mistakes", "Advanced techniques"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create better companions, build deeper relationships, and master Circuit Prompt.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Quick Start */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">New to Circuit Prompt?</h2>
            <p className="text-muted-foreground">Start here to create your first companion in minutes.</p>
          </div>
          <Link href="/docs/getting-started">
            <Card className="p-8 hover:border-foreground/20 transition-all cursor-pointer">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-foreground/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-2">Getting Started Guide</h3>
                  <p className="text-muted-foreground mb-4">
                    A complete walkthrough from creating your account to having your first meaningful conversation.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
                      5 min read
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
                      Beginner friendly
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Documentation Sections */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">Explore the Docs</h2>
            <p className="text-muted-foreground">Deep dive into specific features and learn advanced techniques.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docsSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link key={section.href} href={section.href}>
                  <Card className="p-6 h-full hover:border-foreground/20 transition-all cursor-pointer">
                    <div className="mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-foreground/10 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                    </div>
                    <div className="space-y-1">
                      {section.topics.map((topic, idx) => (
                        <div key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                          {topic}
                        </div>
                      ))}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* API Reference (Future) */}
        <div className="mb-16">
          <Card className="p-8 border-dashed">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
                <Code className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-2">API Reference</h3>
                <p className="text-muted-foreground mb-4">
                  Looking to integrate Circuit Prompt into your application? API documentation is coming soon for Enterprise users.
                </p>
                <Link
                  href="/dashboard/billing"
                  className="text-sm text-foreground hover:underline font-medium"
                >
                  Contact us for early access →
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Popular Topics */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Popular Topics</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/docs/character-creation#backstory">
              <Card className="p-4 hover:border-foreground/20 transition-all cursor-pointer">
                <h4 className="font-semibold mb-1">How to write compelling backstories</h4>
                <p className="text-sm text-muted-foreground">Tips for creating rich character histories</p>
              </Card>
            </Link>
            <Link href="/docs/memory-relationships#trust">
              <Card className="p-4 hover:border-foreground/20 transition-all cursor-pointer">
                <h4 className="font-semibold mb-1">Building trust with your companion</h4>
                <p className="text-sm text-muted-foreground">How relationships develop over time</p>
              </Card>
            </Link>
            <Link href="/docs/behaviors#intensity">
              <Card className="p-4 hover:border-foreground/20 transition-all cursor-pointer">
                <h4 className="font-semibold mb-1">Understanding behavior intensity</h4>
                <p className="text-sm text-muted-foreground">How to control personality traits</p>
              </Card>
            </Link>
            <Link href="/docs/best-practices#conversations">
              <Card className="p-4 hover:border-foreground/20 transition-all cursor-pointer">
                <h4 className="font-semibold mb-1">Having better conversations</h4>
                <p className="text-sm text-muted-foreground">Techniques for more engaging dialogue</p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Help & Support */}
        <div>
          <Card className="p-8 bg-muted/50">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-3">Need More Help?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our community is here to help, or reach out to support directly.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/community">
                  <Card className="px-6 py-3 hover:border-foreground/20 transition-all cursor-pointer">
                    <span className="font-medium">Join Community</span>
                  </Card>
                </Link>
                <a href="mailto:support@circuitprompt.ai">
                  <Card className="px-6 py-3 hover:border-foreground/20 transition-all cursor-pointer">
                    <span className="font-medium">Contact Support</span>
                  </Card>
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
