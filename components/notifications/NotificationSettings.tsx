/**
 * Notification Settings Component
 * UI for managing push notification preferences
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import {
  isPushSupported,
  isPushSubscribed,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getNotificationPermission,
} from "@/lib/notifications/client";

export function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  // Check initial state
  useEffect(() => {
    const checkSupport = async () => {
      const supported = isPushSupported();
      setIsSupported(supported);

      if (supported) {
        const perm = getNotificationPermission();
        setPermission(perm);

        const subscribed = await isPushSubscribed();
        setIsSubscribed(subscribed);
      }
    };

    checkSupport();
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);

    try {
      await subscribeToPushNotifications();
      setIsSubscribed(true);
      setPermission("granted");
    } catch (error: any) {
      console.error("Failed to subscribe:", error);
      alert(`Failed to enable notifications: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);

    try {
      await unsubscribeFromPushNotifications();
      setIsSubscribed(false);
    } catch (error: any) {
      console.error("Failed to unsubscribe:", error);
      alert(`Failed to disable notifications: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          Push notifications are not supported in your browser.
        </p>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p className="text-sm text-destructive">
          Notifications are blocked. Please enable them in your browser settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <h3 className="text-sm font-medium">Push Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {isSubscribed
                ? "You'll receive notifications when agents respond"
                : "Get notified when agents respond to your messages"}
            </p>
          </div>
        </div>

        <Button
          variant={isSubscribed ? "outline" : "default"}
          size="sm"
          onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
          disabled={isLoading}
        >
          {isLoading
            ? "Loading..."
            : isSubscribed
            ? "Disable"
            : "Enable"}
        </Button>
      </div>
    </div>
  );
}
