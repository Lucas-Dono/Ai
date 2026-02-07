"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Brain, Calendar, Users, ArrowLeft } from "lucide-react";
import { ImportantEventsPanel } from "@/components/memory/ImportantEventsPanel";
import { ImportantPeoplePanel } from "@/components/memory/ImportantPeoplePanel";
import { useTranslations } from "next-intl";

interface Agent {
  id: string;
  name: string;
  avatar?: string;
  kind: string;
}

type TabType = "events" | "people";

export default function AgentMemoryPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("agents.memory");
  const tCommon = useTranslations("common");
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("events");

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const res = await fetch(`/api/agents/${params.id}`);
        if (!res.ok) throw new Error("Agent not found");
        const data = await res.json();
        setAgent(data);
      } catch (error) {
        console.error(error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!agent) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/agentes/${agent.id}`)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToChat")}
          </button>

          <div className="flex items-center gap-4">
            {agent.avatar ? (
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {agent.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("title", { name: agent.name })}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("events")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === "events"
                  ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Calendar className="w-5 h-5" />
              {t("tabs.events")}
            </button>

            <button
              onClick={() => setActiveTab("people")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === "people"
                  ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Users className="w-5 h-5" />
              {t("tabs.people")}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          {activeTab === "events" && (
            <ImportantEventsPanel agentId={agent.id} />
          )}
          {activeTab === "people" && (
            <ImportantPeoplePanel agentId={agent.id} />
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                {t("infoCard.title")}
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {t("infoCard.description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
