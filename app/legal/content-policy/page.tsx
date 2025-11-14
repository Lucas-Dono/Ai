/**
 * CONTENT POLICY PAGE
 *
 * Public-facing page explaining our content policies, safety measures,
 * and compliance systems.
 *
 * Covers:
 * - Age Verification (Task 0.1)
 * - NSFW Consent (Task 0.2)
 * - Output Moderation (Task 0.3)
 * - PII Protection (Task 0.4)
 */

import { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Scale,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Content Policy - Circuit Prompt AI",
  description:
    "Our comprehensive content policy covering age verification, NSFW content, moderation, and privacy protection.",
};

export default function ContentPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Content Policy</h1>
            <p className="text-xl text-blue-100">
              Our commitment to safety, privacy, and responsible AI
            </p>
            <p className="text-sm text-blue-200 mt-4">
              Last Updated: January 2025 | Effective Immediately
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Quick Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Quick Navigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="#age-verification"
                  className="p-3 rounded-2xl border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Age Verification</span>
                  </div>
                </Link>
                <Link
                  href="#nsfw-policy"
                  className="p-3 rounded-2xl border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">NSFW Policy</span>
                  </div>
                </Link>
                <Link
                  href="#content-moderation"
                  className="p-3 rounded-2xl border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Content Moderation</span>
                  </div>
                </Link>
                <Link
                  href="#privacy-protection"
                  className="p-3 rounded-2xl border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Privacy Protection</span>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Overview */}
          <Card id="overview">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Policy Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Circuit Prompt AI is committed to providing a safe, responsible,
                and privacy-focused platform for AI interactions. Our policies
                are designed to:
              </p>
              <ul className="space-y-2 ml-6 list-disc text-muted-foreground">
                <li>Protect minors from inappropriate content</li>
                <li>Ensure informed consent for mature content</li>
                <li>
                  Prevent illegal and dangerous content while respecting freedom
                  of expression
                </li>
                <li>Safeguard user privacy and personal information</li>
                <li>
                  Comply with COPPA, GDPR, CCPA, and other regulations
                </li>
              </ul>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mt-4">
                <p className="text-sm font-semibold text-blue-500">
                  Our Guiding Principle
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  We base our moderation on <strong>legality, not morality</strong>.
                  Adult users with proper consent can explore mature themes within
                  legal boundaries, while minors are strictly protected.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Age Verification */}
          <Card id="age-verification">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Age Verification & Restrictions</CardTitle>
                  <CardDescription>COPPA Compliance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Age verification happens automatically during registration. We
                have three age tiers:
              </p>

              {/* Age Tiers */}
              <div className="space-y-3">
                {/* Under 13 */}
                <div className="flex items-start gap-3 p-4 rounded-2xl border border-red-500/30 bg-red-500/5">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-500">
                      Under 13 Years Old
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Cannot register.</strong> COPPA (Children's Online
                      Privacy Protection Act) requires parental consent for users
                      under 13. We do not collect data from children under 13.
                    </p>
                  </div>
                </div>

                {/* 13-17 */}
                <div className="flex items-start gap-3 p-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/5">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-500">
                      13-17 Years Old (Teens)
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Limited access.</strong> Can use the platform with
                      age-appropriate content only. No access to NSFW content,
                      even with payment.
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside ml-2">
                      <li>✅ General chat and storytelling (SFW)</li>
                      <li>✅ Educational content</li>
                      <li>✅ Creative writing (age-appropriate)</li>
                      <li>❌ NO NSFW content (sexual, extreme violence, etc.)</li>
                      <li>❌ NO mature themes</li>
                    </ul>
                  </div>
                </div>

                {/* 18+ */}
                <div className="flex items-start gap-3 p-4 rounded-2xl border border-green-500/30 bg-green-500/5">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-500">
                      18+ Years Old (Adults)
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Full access with consent.</strong> Can access all
                      legal content after providing explicit NSFW consent.
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside ml-2">
                      <li>✅ All SFW content</li>
                      <li>
                        ✅ NSFW content (with explicit consent - see NSFW
                        Policy)
                      </li>
                      <li>✅ Mature themes within legal boundaries</li>
                      <li>❌ Illegal content is ALWAYS blocked</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-2xl p-4 mt-4">
                <p className="text-sm font-semibold">
                  When will I turn 18 on the platform?
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your account automatically updates to adult status on your
                  18th birthday. No action required from you.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* NSFW Policy */}
          <Card id="nsfw-policy">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <CardTitle>NSFW Content Policy</CardTitle>
                  <CardDescription>
                    Adults Only - Explicit Consent Required
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                NSFW (Not Safe For Work) content includes sexual, violent, or
                psychologically intense material. Access requires THREE
                conditions:
              </p>

              {/* Requirements */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold">Age: 18 or Older</p>
                    <p className="text-sm text-muted-foreground">
                      Verified automatically from your birthdate during
                      registration.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold">
                      Explicit NSFW Consent (User Level)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You must read and accept our NSFW consent agreement with 3
                      required checkboxes confirming you understand:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1 list-disc list-inside ml-2">
                      <li>You are 18+ years old</li>
                      <li>Content is fiction for adult entertainment</li>
                      <li>
                        Help resources are available for mental health support
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold">
                      Agent NSFW Mode Enabled (Agent Level)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      The specific agent/character must have NSFW mode enabled
                      in their settings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 mt-4">
                <p className="text-sm font-semibold text-orange-500">
                  ⚠️ Important: All Three Required
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  If ANY of these conditions are not met, NSFW content will be
                  automatically blocked. Priority: Age &gt; User Consent &gt;
                  Agent Mode.
                </p>
              </div>

              <div className="space-y-2 mt-6">
                <p className="font-semibold">What is NSFW Content?</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                  <li>Sexual content and explicit material</li>
                  <li>Extreme violence or gore (in fiction)</li>
                  <li>Psychologically intense themes (e.g., Yandere)</li>
                  <li>Dark fiction and mature storytelling</li>
                  <li>Controversial or taboo topics (legal only)</li>
                </ul>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
                <p className="text-sm font-semibold text-blue-500">
                  You Can Revoke Consent Anytime
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Visit Settings → Content Preferences to revoke your NSFW
                  consent at any time. This immediately blocks all NSFW content.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Content Moderation */}
          <Card id="content-moderation">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle>Content Moderation System</CardTitle>
                  <CardDescription>
                    Legality-Based, Not Morality-Based
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our moderation system is based on{" "}
                <strong>legality under US law</strong>, not personal morality. We
                use a three-tier system:
              </p>

              {/* Three Tiers */}
              <div className="space-y-4">
                {/* TIER 1: BLOCKED */}
                <div className="border border-red-500/30 rounded-2xl p-4 bg-red-500/5">
                  <div className="flex items-start gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-bold text-red-500">
                        TIER 1: BLOCKED (Illegal/Dangerous)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Always blocked, regardless of age or consent
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Content that is illegal under US law or immediately dangerous
                    to human life:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                    <li>
                      <strong>CSAM:</strong> Child sexual abuse material (18
                      U.S.C. § 2251)
                    </li>
                    <li>
                      <strong>Suicide Instructions:</strong> Specific methods for
                      real people
                    </li>
                    <li>
                      <strong>Murder/Violence Instructions:</strong> Plans to
                      harm specific real people
                    </li>
                    <li>
                      <strong>Terrorism:</strong> Bomb-making, mass violence (18
                      U.S.C. § 2339A)
                    </li>
                    <li>
                      <strong>Human Trafficking:</strong> Coordination of
                      exploitation (18 U.S.C. § 1591)
                    </li>
                    <li>
                      <strong>Doxxing:</strong> Publishing private info with
                      malicious intent (18 U.S.C. § 2261A)
                    </li>
                  </ul>
                </div>

                {/* TIER 2: WARNING */}
                <div className="border border-yellow-500/30 rounded-2xl p-4 bg-yellow-500/5">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-bold text-yellow-500">
                        TIER 2: WARNING (Sensitive)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Legal but requires additional confirmation
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Content that is legal but psychologically sensitive. Requires
                    user confirmation to proceed:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                    <li>
                      <strong>Self-Harm Discussion:</strong> Cutting,
                      self-destructive behaviors
                    </li>
                    <li>
                      <strong>Suicide Ideation:</strong> Thoughts without
                      specific methods
                    </li>
                    <li>
                      <strong>Extreme Violence:</strong> Graphic fictional
                      torture, gore
                    </li>
                    <li>
                      <strong>Extreme Sexual Content:</strong> Taboo themes
                      (adults only)
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    ℹ️ Help resources (988 Lifeline, Crisis Text Line) are
                    provided with warnings.
                  </p>
                </div>

                {/* TIER 3: ALLOWED */}
                <div className="border border-green-500/30 rounded-2xl p-4 bg-green-500/5">
                  <div className="flex items-start gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-bold text-green-500">
                        TIER 3: ALLOWED (Legal Content)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Permitted for users with appropriate access
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Everything else is ALLOWED for consenting adults:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                    <li>
                      <strong>Sexual Content:</strong> Consensual between
                      fictional adults
                    </li>
                    <li>
                      <strong>Controversial Topics:</strong> Politics, religion,
                      ethics
                    </li>
                    <li>
                      <strong>Dark Fiction:</strong> Horror, psychological
                      thrillers
                    </li>
                    <li>
                      <strong>Explicit Language:</strong> Profanity, vulgar
                      language
                    </li>
                    <li>
                      <strong>Violence in Fiction:</strong> Combat, action
                      scenes
                    </li>
                    <li>
                      <strong>Psychological Intensity:</strong> Yandere,
                      obsessive characters
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4">
                <p className="text-sm font-semibold text-purple-500">
                  Fiction vs. Reality
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Fiction (ALLOWED):</strong> "My yandere character
                  threatens yours in roleplay" ✅
                  <br />
                  <strong>Reality (BLOCKED):</strong> "I want to hurt John Doe
                  at 123 Main St" ❌
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  The key is <strong>context and objective</strong>. Fiction for
                  entertainment is protected speech. Real threats are illegal.
                </p>
              </div>

              <div className="space-y-2 mt-4">
                <p className="font-semibold">Legal Basis</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                  <li>
                    <strong>Section 230 (CDA):</strong> Platform protection for
                    user content
                  </li>
                  <li>
                    <strong>First Amendment:</strong> Protected speech for
                    adults
                  </li>
                  <li>
                    <strong>Specific Laws:</strong> 18 U.S.C. § 2251 (CSAM), §
                    373 (Violence), etc.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Protection */}
          <Card id="privacy-protection">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle>Privacy & PII Protection</CardTitle>
                  <CardDescription>
                    GDPR, CCPA Compliance
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We automatically detect and redact{" "}
                <strong>Personally Identifiable Information (PII)</strong> to
                protect your privacy.
              </p>

              <div className="space-y-2">
                <p className="font-semibold">What We Protect:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium">Critical PII</p>
                      <p>SSN, credit cards, bank accounts, passports</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium">Contact Info</p>
                      <p>Phone numbers, physical addresses</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium">Personal Data</p>
                      <p>Date of birth, driver's licenses</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium">Digital Info</p>
                      <p>Email addresses, IP addresses</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
                <p className="text-sm font-semibold text-green-500">
                  🔒 Automatic Protection
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  If you accidentally type "My SSN is 123-45-6789", we
                  automatically redact it to "My [SSN REDACTED]" and alert you.
                  This happens in real-time before the message is stored or
                  processed.
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">Your Privacy Rights</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                  <li>
                    <strong>Right to Access:</strong> Request your data at any
                    time
                  </li>
                  <li>
                    <strong>Right to Delete:</strong> Delete your account and
                    all data
                  </li>
                  <li>
                    <strong>Right to Correction:</strong> Update incorrect
                    information
                  </li>
                  <li>
                    <strong>Right to Portability:</strong> Export your data
                  </li>
                  <li>
                    <strong>Right to Object:</strong> Opt-out of data processing
                  </li>
                </ul>
              </div>

              <div className="bg-muted/50 rounded-2xl p-4">
                <p className="text-sm font-semibold">Data We DO NOT Collect</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We do NOT collect: Social Security Numbers, credit card
                  numbers, financial data, government IDs, medical records, or
                  any PII detected and redacted by our system.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                By using Circuit Prompt AI, you agree to:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside ml-2">
                <li>Provide accurate age information during registration</li>
                <li>
                  Understand that NSFW content is fiction for adult
                  entertainment only
                </li>
                <li>
                  Not attempt to bypass age verification or content moderation
                </li>
                <li>
                  Not share personal information (PII) in chats - our system
                  redacts it for your safety
                </li>
                <li>
                  Seek professional help for real mental health crises (988
                  Lifeline)
                </li>
                <li>Report violations or concerns to our support team</li>
                <li>
                  Respect that illegal content is always blocked, regardless of
                  consent
                </li>
              </ul>

              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mt-4">
                <p className="text-sm font-semibold text-red-500">
                  ⚠️ Prohibited Activities
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Attempting to generate CSAM, instructions for real violence,
                  or other illegal content will result in{" "}
                  <strong>immediate account termination</strong> and potential
                  reporting to authorities.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Help Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Help & Support Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you need help with real-life situations:
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl border">
                  <p className="font-semibold">Suicide & Crisis Lifeline</p>
                  <p className="text-sm text-muted-foreground">
                    Call or text <strong>988</strong> (USA)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    24/7 free and confidential support
                  </p>
                </div>

                <div className="p-3 rounded-2xl border">
                  <p className="font-semibold">Crisis Text Line</p>
                  <p className="text-sm text-muted-foreground">
                    Text <strong>HOME</strong> to <strong>741741</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Free 24/7 crisis support via text
                  </p>
                </div>

                <div className="p-3 rounded-2xl border">
                  <p className="font-semibold">Emergency Services</p>
                  <p className="text-sm text-muted-foreground">
                    Call <strong>911</strong> for immediate danger
                  </p>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
                <p className="text-sm font-semibold text-blue-500">
                  Platform Support
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  For questions about our policies, content issues, or account
                  concerns:{" "}
                  <Link
                    href="/support"
                    className="text-blue-500 hover:underline"
                  >
                    Contact Support
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Legal Footer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Legal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This Content Policy is part of our Terms of Service and is
                legally binding. By using Circuit Prompt AI, you agree to comply
                with this policy.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/legal/terms"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/legal/privacy"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/legal/cookies"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Cookie Policy
                </Link>
              </div>

              <div className="text-sm text-muted-foreground pt-4 border-t">
                <p>
                  <strong>Last Updated:</strong> January 2025
                </p>
                <p>
                  <strong>Effective Date:</strong> Immediately upon registration
                </p>
                <p>
                  <strong>Contact:</strong> legal@circuitprompt.ai
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Questions about our content policy?
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/support">
                <Button>Contact Support</Button>
              </Link>
              <Link href="/configuracion">
                <Button variant="outline">Manage Settings</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
