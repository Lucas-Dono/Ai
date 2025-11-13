/**
 * Mobile Testing Page
 *
 * Page to test mobile responsiveness of all components
 * - Test on different screen sizes
 * - Touch-friendly interactions
 * - Performance on mobile devices
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomSheet } from "@/components/mobile/BottomSheet";
import {
  Heart,
  MessageCircle,
  Share2,
  ThumbsUp,
  Search,
  Filter,
  Plus,
  Bell,
  User,
  Home,
  Network,
} from "lucide-react";

export default function MobileTestPage() {
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pb-20 lg:pb-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Mobile Test Page</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Test all components on different screen sizes
          </p>
        </div>

        {/* Screen Size Indicators */}
        <Card className="p-4">
          <h2 className="font-semibold mb-4">Current Screen Size</h2>
          <div className="flex flex-wrap gap-2">
            <span className="sm:hidden bg-red-500 text-white px-3 py-1 rounded-full text-xs">
              XS: &lt;640px
            </span>
            <span className="hidden sm:block md:hidden bg-orange-500 text-white px-3 py-1 rounded-full text-xs">
              SM: ≥640px
            </span>
            <span className="hidden md:block lg:hidden bg-yellow-500 text-white px-3 py-1 rounded-full text-xs">
              MD: ≥768px
            </span>
            <span className="hidden lg:block xl:hidden bg-green-500 text-white px-3 py-1 rounded-full text-xs">
              LG: ≥1024px
            </span>
            <span className="hidden xl:block bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
              XL: ≥1280px
            </span>
          </div>
        </Card>

        {/* Touch Targets Test */}
        <Card className="p-4 md:p-6">
          <h2 className="font-semibold mb-4">Touch-Friendly Buttons (min 44px)</h2>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Button className="min-h-[44px]">
              <Heart className="w-4 h-4 mr-2" />
              Like
            </Button>
            <Button variant="outline" className="min-h-[44px]">
              <MessageCircle className="w-4 h-4 mr-2" />
              Comment
            </Button>
            <Button variant="ghost" className="min-h-[44px]">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </Card>

        {/* Responsive Grid */}
        <Card className="p-4 md:p-6">
          <h2 className="font-semibold mb-4">Responsive Grid</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-primary/10 rounded-2xl p-4 flex items-center justify-center aspect-square"
              >
                <span className="text-sm font-medium">{i + 1}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Search Bar Test */}
        <Card className="p-4 md:p-6">
          <h2 className="font-semibold mb-4">Responsive Search Bar</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search something..."
              className="pl-10 pr-20 h-11 md:h-10"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1.5 rounded-2xl flex items-center gap-2 min-h-[44px] md:min-h-0">
              <Filter className="w-4 h-4" />
              <span className="hidden md:inline">Filter</span>
            </button>
          </div>
        </Card>

        {/* Tabs Test */}
        <Card className="p-4 md:p-6">
          <h2 className="font-semibold mb-4">Responsive Tabs</h2>
          <Tabs defaultValue="home" className="w-full">
            <TabsList className="w-full md:w-auto overflow-x-auto">
              <TabsTrigger value="home" className="flex-1 md:flex-none min-h-[44px] md:min-h-0">
                <Home className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Home</span>
              </TabsTrigger>
              <TabsTrigger value="community" className="flex-1 md:flex-none min-h-[44px] md:min-h-0">
                <Network className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Community</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex-1 md:flex-none min-h-[44px] md:min-h-0">
                <User className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Profile</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="home" className="mt-4">
              <p className="text-sm md:text-base">Home content goes here</p>
            </TabsContent>
            <TabsContent value="community" className="mt-4">
              <p className="text-sm md:text-base">Community content goes here</p>
            </TabsContent>
            <TabsContent value="profile" className="mt-4">
              <p className="text-sm md:text-base">Profile content goes here</p>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Card List Test */}
        <Card className="p-4 md:p-6">
          <h2 className="font-semibold mb-4">Responsive Card List</h2>
          <div className="space-y-3 md:space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-accent rounded-2xl md:rounded-2xl p-4 md:p-6 border border-border"
              >
                <h3 className="text-base md:text-lg font-bold mb-2">
                  Post Title {i}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                  This is a sample post content that should be responsive and readable on all devices.
                </p>
                <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                  <Button size="sm" variant="ghost" className="h-9 md:h-8 px-2 md:px-3">
                    <ThumbsUp className="w-3.5 md:w-4 h-3.5 md:h-4 mr-1.5" />
                    <span className="text-xs md:text-sm">24</span>
                  </Button>
                  <Button size="sm" variant="ghost" className="h-9 md:h-8 px-2 md:px-3">
                    <MessageCircle className="w-3.5 md:w-4 h-3.5 md:h-4 mr-1.5" />
                    <span className="text-xs md:text-sm">12</span>
                  </Button>
                  <Button size="sm" variant="ghost" className="h-9 md:h-8 px-2 md:px-3">
                    <Share2 className="w-3.5 md:w-4 h-3.5 md:h-4 mr-1.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Bottom Sheet Test */}
        <Card className="p-4 md:p-6">
          <h2 className="font-semibold mb-4">Bottom Sheet (Mobile Modal)</h2>
          <Button onClick={() => setShowBottomSheet(true)} className="min-h-[44px]">
            Open Bottom Sheet
          </Button>
        </Card>

        {/* Typography Test */}
        <Card className="p-4 md:p-6">
          <h2 className="font-semibold mb-4">Responsive Typography</h2>
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                Heading 1
              </h1>
              <p className="text-xs text-muted-foreground">2xl / 3xl / 4xl</p>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">
                Heading 2
              </h2>
              <p className="text-xs text-muted-foreground">xl / 2xl / 3xl</p>
            </div>
            <div>
              <h3 className="text-lg md:text-xl lg:text-2xl font-semibold">
                Heading 3
              </h3>
              <p className="text-xs text-muted-foreground">lg / xl / 2xl</p>
            </div>
            <div>
              <p className="text-sm md:text-base lg:text-lg">
                Body text that adapts to different screen sizes for optimal readability.
              </p>
              <p className="text-xs text-muted-foreground">sm / base / lg</p>
            </div>
          </div>
        </Card>

        {/* Safe Area Test */}
        <Card className="p-4 md:p-6">
          <h2 className="font-semibold mb-4">Safe Area (iPhone Notch Support)</h2>
          <div className="bg-accent rounded-2xl p-4 safe-area-inset-bottom safe-area-inset-top">
            <p className="text-sm md:text-base">
              This content respects safe areas on notched devices (iPhone X+)
            </p>
          </div>
        </Card>

        {/* Performance Info */}
        <Card className="p-4 md:p-6">
          <h2 className="font-semibold mb-4">Mobile Optimizations</h2>
          <ul className="space-y-2 text-sm md:text-base">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Touch-friendly 44px minimum buttons</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Responsive typography (16px+ for readability)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Safe area support for notched devices</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Reduced animations on low-end devices</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Horizontal scroll prevention</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Bottom navigation for mobile</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        title="Bottom Sheet Example"
      >
        <div className="p-6 space-y-4">
          <p>This is a mobile-friendly bottom sheet that slides up from the bottom.</p>
          <p>You can swipe it down to close or use the X button.</p>
          <Button className="w-full min-h-[44px]" onClick={() => setShowBottomSheet(false)}>
            Close
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
