import { describe, it, expect } from "vitest";
import {
  hasPermission,
  getRoleLevel,
  canManageRole,
  TeamRole,
} from "@/lib/permissions/roles";

describe("Permission System", () => {
  describe("hasPermission", () => {
    it("should grant all permissions to owner", () => {
      expect(hasPermission("owner", "team", "delete")).toBe(true);
      expect(hasPermission("owner", "members", "remove")).toBe(true);
      expect(hasPermission("owner", "agents", "delete")).toBe(true);
      expect(hasPermission("owner", "billing", "update")).toBe(true);
    });

    it("should limit admin permissions", () => {
      expect(hasPermission("admin", "team", "delete")).toBe(false);
      expect(hasPermission("admin", "team", "update")).toBe(true);
      expect(hasPermission("admin", "members", "remove")).toBe(true);
      expect(hasPermission("admin", "billing", "update")).toBe(false);
      expect(hasPermission("admin", "billing", "read")).toBe(true);
    });

    it("should limit member permissions", () => {
      expect(hasPermission("member", "agents", "create")).toBe(true);
      expect(hasPermission("member", "agents", "update")).toBe(true);
      expect(hasPermission("member", "agents", "delete")).toBe(false);
      expect(hasPermission("member", "members", "invite")).toBe(false);
    });

    it("should only allow viewer to read", () => {
      expect(hasPermission("viewer", "team", "read")).toBe(true);
      expect(hasPermission("viewer", "agents", "read")).toBe(true);
      expect(hasPermission("viewer", "agents", "create")).toBe(false);
      expect(hasPermission("viewer", "members", "read")).toBe(true);
      expect(hasPermission("viewer", "members", "invite")).toBe(false);
    });
  });

  describe("getRoleLevel", () => {
    it("should return correct role hierarchy", () => {
      expect(getRoleLevel("owner")).toBe(4);
      expect(getRoleLevel("admin")).toBe(3);
      expect(getRoleLevel("member")).toBe(2);
      expect(getRoleLevel("viewer")).toBe(1);
    });

    it("should maintain hierarchy order", () => {
      expect(getRoleLevel("owner")).toBeGreaterThan(getRoleLevel("admin"));
      expect(getRoleLevel("admin")).toBeGreaterThan(getRoleLevel("member"));
      expect(getRoleLevel("member")).toBeGreaterThan(getRoleLevel("viewer"));
    });
  });

  describe("canManageRole", () => {
    it("should allow owner to manage all roles", () => {
      expect(canManageRole("owner", "admin")).toBe(true);
      expect(canManageRole("owner", "member")).toBe(true);
      expect(canManageRole("owner", "viewer")).toBe(true);
    });

    it("should allow admin to manage members and viewers", () => {
      expect(canManageRole("admin", "owner")).toBe(false);
      expect(canManageRole("admin", "admin")).toBe(false);
      expect(canManageRole("admin", "member")).toBe(true);
      expect(canManageRole("admin", "viewer")).toBe(true);
    });

    it("should not allow members to manage anyone", () => {
      expect(canManageRole("member", "viewer")).toBe(false);
      expect(canManageRole("member", "member")).toBe(false);
    });

    it("should not allow viewers to manage anyone", () => {
      expect(canManageRole("viewer", "viewer")).toBe(false);
      expect(canManageRole("viewer", "member")).toBe(false);
    });
  });
});
