"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Crown, UserPlus, UserMinus, RefreshCw, Search, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Owner {
  id: string;
  name: string;
  image?: string;
  isPrincipal: boolean;
}

interface OwnersManagementPanelProps {
  communityId: string;
  principalOwnerId: string;
  coOwnerIds: string[];
  isCurrentUserPrincipalOwner: boolean;
}

export function OwnersManagementPanel({
  communityId,
  principalOwnerId,
  coOwnerIds,
  isCurrentUserPrincipalOwner,
}: OwnersManagementPanelProps) {
  const t = useTranslations("community.communities.owners");
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingCoOwner, setAddingCoOwner] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Cargar información de los owners
  useEffect(() => {
    loadOwners();
  }, [principalOwnerId, coOwnerIds]);

  const loadOwners = async () => {
    try {
      setLoading(true);

      const allOwnerIds = [principalOwnerId, ...coOwnerIds];
      const ownerPromises = allOwnerIds.map(async (id) => {
        const response = await fetch(`/api/users/${id}`);
        if (response.ok) {
          const data = await response.json();
          return {
            id: data.id,
            name: data.name,
            image: data.image,
            isPrincipal: id === principalOwnerId,
          };
        }
        return null;
      });

      const loadedOwners = (await Promise.all(ownerPromises)).filter(Boolean) as Owner[];
      setOwners(loadedOwners);
    } catch (error) {
      console.error("Error loading owners:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchMembers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await fetch(
        `/api/community/communities/${communityId}/members?search=${encodeURIComponent(query)}`
      );

      if (response.ok) {
        const data = await response.json();
        // Filtrar los que ya son owners
        const filtered = data.members.filter(
          (m: any) => !owners.some((o) => o.id === m.userId)
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error("Error searching members:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddCoOwner = async (userId: string) => {
    try {
      const response = await fetch(`/api/community/communities/${communityId}/owners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        await loadOwners();
        setSearchQuery("");
        setSearchResults([]);
        setAddingCoOwner(false);
      } else {
        const error = await response.json();
        alert(error.error || "Error al agregar co-propietario");
      }
    } catch (error) {
      console.error("Error adding co-owner:", error);
      alert("Error al agregar co-propietario");
    }
  };

  const handleRemoveCoOwner = async (userId: string) => {
    if (!confirm(t("removeConfirm"))) return;

    try {
      const response = await fetch(`/api/community/communities/${communityId}/owners`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        await loadOwners();
      } else {
        const error = await response.json();
        alert(error.error || "Error al remover co-propietario");
      }
    } catch (error) {
      console.error("Error removing co-owner:", error);
      alert("Error al remover co-propietario");
    }
  };

  const handleTransferOwnership = async (newOwnerId: string) => {
    if (!confirm(t("transferConfirm"))) return;

    try {
      const response = await fetch(`/api/community/communities/${communityId}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newOwnerId }),
      });

      if (response.ok) {
        alert(t("transferSuccess"));
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || "Error al transferir propiedad");
      }
    } catch (error) {
      console.error("Error transferring ownership:", error);
      alert("Error al transferir propiedad");
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <Crown className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">{t("title")}</h3>
        </div>

        {/* Lista de owners */}
        <div className="space-y-3">
          {owners.map((owner) => (
            <div
              key={owner.id}
              className="flex items-center justify-between p-3 rounded-2xl border border-border"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={owner.image} />
                  <AvatarFallback>{owner.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{owner.name}</p>
                  {owner.isPrincipal ? (
                    <div className="flex items-center gap-1 text-xs text-yellow-600">
                      <Crown className="h-3 w-3" />
                      {t("principalOwner")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <Shield className="h-3 w-3" />
                      {t("coOwner")}
                    </div>
                  )}
                </div>
              </div>

              {isCurrentUserPrincipalOwner && !owner.isPrincipal && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTransferOwnership(owner.id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {t("transfer")}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveCoOwner(owner.id)}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Agregar co-owner */}
        {isCurrentUserPrincipalOwner && (
          <div className="border-t border-border pt-4">
            {!addingCoOwner ? (
              <Button onClick={() => setAddingCoOwner(true)} variant="outline" className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                {t("addCoOwner")}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchMembers(e.target.value);
                    }}
                    className="pl-10"
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="border border-border rounded-2xl overflow-hidden">
                    {searchResults.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer"
                        onClick={() => handleAddCoOwner(member.userId)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.user?.image} />
                            <AvatarFallback>
                              {member.user?.name?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{member.user?.name}</span>
                        </div>
                        <Button size="sm" variant="ghost">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={() => {
                    setAddingCoOwner(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="w-full"
                >
                  {t("cancel")}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="bg-muted/50 p-4 rounded-2xl text-sm text-muted-foreground">
          {t("info")}
        </div>
      </div>
    </Card>
  );
}
