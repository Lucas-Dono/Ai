/**
 * Better Auth client for Expo/React Native
 * Uses expo-secure-store for secure cookie storage
 */

import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/api.config";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: "blaniel",
      storagePrefix: "blaniel",
      storage: SecureStore,
    })
  ]
});

// Export types
export type Session = typeof authClient.$Infer.Session;
