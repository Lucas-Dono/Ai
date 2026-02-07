"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, ChevronDown, ChevronUp, Search, Book, MessageCircle, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AyudaPage() {
  const t = useTranslations("legal.help");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqCategories = [
    {
      category: t("faq.getting_started.category"),
      questions: [
        {
          question: t("faq.getting_started.q1.question"),
          answer: t("faq.getting_started.q1.answer"),
        },
        {
          question: t("faq.getting_started.q2.question"),
          answer: t("faq.getting_started.q2.answer"),
        },
        {
          question: t("faq.getting_started.q3.question"),
          answer: t("faq.getting_started.q3.answer"),
        },
      ],
    },
    {
      category: t("faq.agents.category"),
      questions: [
        {
          question: t("faq.agents.q1.question"),
          answer: t("faq.agents.q1.answer"),
        },
        {
          question: t("faq.agents.q2.question"),
          answer: t("faq.agents.q2.answer"),
        },
        {
          question: t("faq.agents.q3.question"),
          answer: t("faq.agents.q3.answer"),
        },
      ],
    },
    {
      category: t("faq.billing.category"),
      questions: [
        {
          question: t("faq.billing.q1.question"),
          answer: t("faq.billing.q1.answer"),
        },
        {
          question: t("faq.billing.q2.question"),
          answer: t("faq.billing.q2.answer"),
        },
        {
          question: t("faq.billing.q3.question"),
          answer: t("faq.billing.q3.answer"),
        },
      ],
    },
    {
      category: t("faq.technical.category"),
      questions: [
        {
          question: t("faq.technical.q1.question"),
          answer: t("faq.technical.q1.answer"),
        },
        {
          question: t("faq.technical.q2.question"),
          answer: t("faq.technical.q2.answer"),
        },
        {
          question: t("faq.technical.q3.question"),
          answer: t("faq.technical.q3.answer"),
        },
      ],
    },
  ];

  // Flatten all questions for search
  const allQuestions = faqCategories.flatMap((cat, catIndex) =>
    cat.questions.map((q, qIndex) => ({
      ...q,
      category: cat.category,
      globalIndex: catIndex * 100 + qIndex,
    }))
  );

  const filteredQuestions = searchQuery
    ? allQuestions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allQuestions;

  const toggleQuestion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← {t("backToHome")}
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/legal/ayuda" className="block">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="p-2 rounded-2xl bg-primary/10 w-fit">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{t("quickLinks.guides.title")}</CardTitle>
                <CardDescription>{t("quickLinks.guides.description")}</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/community" className="block">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="p-2 rounded-2xl bg-primary/10 w-fit">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{t("quickLinks.community.title")}</CardTitle>
                <CardDescription>{t("quickLinks.community.description")}</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/legal/contacto" className="block">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="p-2 rounded-2xl bg-primary/10 w-fit">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{t("quickLinks.contact.title")}</CardTitle>
                <CardDescription>{t("quickLinks.contact.description")}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* FAQ */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t("faq.title")}</h2>

          {searchQuery ? (
            // Search results
            <div className="space-y-3">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((item) => (
                  <Card
                    key={item.globalIndex}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => toggleQuestion(item.globalIndex)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground mb-1">{item.category}</div>
                          <CardTitle className="text-base font-medium">{item.question}</CardTitle>
                        </div>
                        {expandedIndex === item.globalIndex ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    {expandedIndex === item.globalIndex && (
                      <CardContent className="pt-0">
                        <p className="text-muted-foreground whitespace-pre-line">{item.answer}</p>
                      </CardContent>
                    )}
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">{t("search.noResults")}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            // Categories
            faqCategories.map((category, catIndex) => (
              <Card key={catIndex}>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {category.questions.map((item, qIndex) => {
                    const globalIndex = catIndex * 100 + qIndex;
                    return (
                      <div
                        key={qIndex}
                        className="border rounded-2xl p-4 cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => toggleQuestion(globalIndex)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-medium flex-1">{item.question}</h4>
                          {expandedIndex === globalIndex ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                        {expandedIndex === globalIndex && (
                          <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">
                            {item.answer}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Still Need Help */}
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>{t("stillNeedHelp.title")}</CardTitle>
            <CardDescription>{t("stillNeedHelp.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/legal/contacto">
              <Button className="w-full sm:w-auto">
                <Mail className="h-4 w-4 mr-2" />
                {t("stillNeedHelp.button")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
