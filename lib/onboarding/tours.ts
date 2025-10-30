import { OnboardingTour } from "./types";

export const onboardingTours: OnboardingTour[] = [
  {
    id: "welcome",
    name: "Welcome Tour",
    description: "Learn the basics of Creador de Inteligencias",
    requiredForCompletion: true,
    steps: [
      {
        id: "welcome-intro",
        title: "Welcome to Creador de Inteligencias!",
        description:
          "We're excited to have you here. This quick tour will show you how to create and manage your AI agents. Let's get started!",
        position: "bottom",
      },
      {
        id: "welcome-types",
        title: "Two Types of AI",
        description:
          "You can create two types of AI: Companions (emotional AI with personality) and Assistants (task-focused administrative AI). Choose based on your needs.",
        position: "bottom",
      },
      {
        id: "welcome-navigation",
        title: "Navigation",
        description:
          "Use the sidebar to navigate between your Dashboard, Agents, Worlds, and Marketplace. Everything you need is just a click away.",
        target: "nav",
        position: "right",
      },
      {
        id: "welcome-create",
        title: "Create Your First AI",
        description:
          "Ready to create your first AI agent? Click the 'Nueva IA' button to open the AI builder.",
        target: 'a[href="/constructor"]',
        position: "top",
        action: {
          label: "Create AI",
          href: "/constructor",
        },
      },
    ],
  },
  {
    id: "first-agent",
    name: "Creating Your First Agent",
    description: "Step-by-step guide to building your first AI",
    requiredForCompletion: true,
    steps: [
      {
        id: "agent-type",
        title: "Choose Agent Type",
        description:
          "First, decide if you want a Companion (emotional) or Assistant (administrative). This affects the AI's personality and capabilities.",
        position: "bottom",
      },
      {
        id: "agent-profile",
        title: "Define Personality",
        description:
          "Give your AI a name, personality traits, tone, and purpose. The more detailed you are, the better your AI will respond.",
        position: "bottom",
      },
      {
        id: "agent-advanced",
        title: "Advanced Configuration",
        description:
          "Use the advanced tab to fine-tune your AI's behavior with custom prompts and parameters. This is optional for beginners.",
        position: "bottom",
      },
      {
        id: "agent-save",
        title: "Save Your AI",
        description:
          "When you're happy with your configuration, click 'Crear Agente' to bring your AI to life!",
        position: "top",
      },
    ],
  },
  {
    id: "chat-basics",
    name: "Chatting with Your AI",
    description: "Learn how to interact with your agents",
    steps: [
      {
        id: "chat-start",
        title: "Start a Conversation",
        description:
          "Click on any agent in your dashboard to open a chat. Your AI will remember previous conversations and build a relationship over time.",
        position: "bottom",
      },
      {
        id: "chat-memory",
        title: "AI Memory",
        description:
          "Your AI uses advanced memory to remember past conversations. It will learn about you and adapt its responses based on your relationship.",
        position: "bottom",
      },
      {
        id: "chat-emotions",
        title: "Emotional Intelligence",
        description:
          "Companion AIs track emotional states like trust, affinity, and respect. These evolve based on your interactions.",
        position: "bottom",
      },
    ],
  },
  {
    id: "marketplace-tour",
    name: "Exploring the Marketplace",
    description: "Discover and clone AI agents from the community",
    steps: [
      {
        id: "marketplace-browse",
        title: "Browse the Marketplace",
        description:
          "Explore hundreds of AI agents created by the community. Find companions, assistants, and specialized AIs for any task.",
        target: 'a[href="/marketplace"]',
        position: "right",
      },
      {
        id: "marketplace-search",
        title: "Search and Filter",
        description:
          "Use the search bar and filters to find exactly what you need. Sort by popularity, rating, or newest additions.",
        position: "bottom",
      },
      {
        id: "marketplace-clone",
        title: "Clone Agents",
        description:
          "Found an AI you like? Clone it with one click! The AI will be added to your dashboard as a private copy you can customize.",
        position: "bottom",
      },
      {
        id: "marketplace-review",
        title: "Rate and Review",
        description:
          "Help the community by leaving reviews and ratings for agents you've tried. Your feedback helps others discover great AIs.",
        position: "bottom",
      },
    ],
  },
  {
    id: "worlds-intro",
    name: "Creating Worlds",
    description: "Learn about multi-agent environments",
    steps: [
      {
        id: "worlds-concept",
        title: "What are Worlds?",
        description:
          "Worlds are group environments where multiple AI agents can interact with each other and with you simultaneously.",
        target: 'a[href="/mundos"]',
        position: "right",
      },
      {
        id: "worlds-create",
        title: "Create a World",
        description:
          "Create a world and add multiple agents to it. Watch them develop relationships and interact naturally with each other.",
        position: "bottom",
      },
      {
        id: "worlds-dynamics",
        title: "Agent Dynamics",
        description:
          "In worlds, agents remember their interactions with each other, forming complex social dynamics and relationships over time.",
        position: "bottom",
      },
    ],
  },
  {
    id: "advanced-features",
    name: "Advanced Features",
    description: "Unlock the full potential of the platform",
    steps: [
      {
        id: "advanced-api",
        title: "API Access",
        description:
          "Generate API keys to integrate your AI agents into external applications. Build custom experiences with our REST API.",
        position: "bottom",
      },
      {
        id: "advanced-analytics",
        title: "Analytics Dashboard",
        description:
          "Track usage metrics, emotional intelligence trends, and agent performance. Make data-driven decisions about your AI strategy.",
        position: "bottom",
      },
      {
        id: "advanced-billing",
        title: "Plans and Billing",
        description:
          "Upgrade to Plus or Ultra for more agents, higher limits, and premium features. Manage your subscription anytime.",
        target: 'a[href="/dashboard/billing"]',
        position: "right",
      },
    ],
  },
];

export function getTourById(tourId: string): OnboardingTour | undefined {
  return onboardingTours.find((tour) => tour.id === tourId);
}

export function getNextTour(currentTourId: string): OnboardingTour | undefined {
  const currentIndex = onboardingTours.findIndex((tour) => tour.id === currentTourId);
  if (currentIndex === -1 || currentIndex === onboardingTours.length - 1) {
    return undefined;
  }
  return onboardingTours[currentIndex + 1];
}

export function getRequiredTours(): OnboardingTour[] {
  return onboardingTours.filter((tour) => tour.requiredForCompletion);
}
