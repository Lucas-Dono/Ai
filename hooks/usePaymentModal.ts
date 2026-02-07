"use client";

import { create } from "zustand";

interface PaymentModalStore {
  isOpen: boolean;
  currentPlan: "free" | "plus" | "ultra";
  open: (currentPlan?: "free" | "plus" | "ultra") => void;
  close: () => void;
}

export const usePaymentModal = create<PaymentModalStore>((set) => ({
  isOpen: false,
  currentPlan: "free",
  open: (currentPlan = "free") => set({ isOpen: true, currentPlan }),
  close: () => set({ isOpen: false }),
}));
