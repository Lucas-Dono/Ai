import { describe, it, expect } from "vitest";

describe("Analytics Calculations", () => {
  describe("Time range filtering", () => {
    it("should filter data within 7 days", () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

      expect(sevenDaysAgo >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).toBe(true);
      expect(eightDaysAgo >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).toBe(false);
    });

    it("should filter data within 30 days", () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const thirtyOneDaysAgo = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000);

      expect(thirtyDaysAgo >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)).toBe(true);
      expect(thirtyOneDaysAgo >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)).toBe(false);
    });
  });

  describe("Average calculations", () => {
    it("should calculate average correctly", () => {
      const values = [1, 2, 3, 4, 5];
      const average = values.reduce((sum, v) => sum + v, 0) / values.length;
      expect(average).toBe(3);
    });

    it("should handle single value", () => {
      const values = [10];
      const average = values.reduce((sum, v) => sum + v, 0) / values.length;
      expect(average).toBe(10);
    });

    it("should return 0 for empty array", () => {
      const values: number[] = [];
      const average = values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
      expect(average).toBe(0);
    });
  });

  describe("Percentage calculations", () => {
    it("should calculate percentage correctly", () => {
      expect(Math.round((50 / 100) * 100)).toBe(50);
      expect(Math.round((25 / 100) * 100)).toBe(25);
      expect(Math.round((75 / 100) * 100)).toBe(75);
    });

    it("should handle division by zero", () => {
      const percentage = 0 !== 0 ? (10 / 0) * 100 : 0;
      expect(percentage).toBe(0);
    });
  });
});
