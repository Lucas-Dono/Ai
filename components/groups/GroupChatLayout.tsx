"use client";

import { useState, useEffect } from "react";
import { Users, Settings, Hash, UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GroupMessageThread } from "./GroupMessageThread";
import { GroupMemberList } from "./GroupMemberList";
import { AddMembersDialog } from "./AddMembersDialog";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useGroupSocket } from "@/hooks/useGroupSocket";

interface GroupChatLayoutProps {
  group: any;
  members: any[];
  currentMember: any;
  currentUserId: string;
  currentUserName: string | null;
  initialMessages: any[];
  socketToken: string | null;
}

export function GroupChatLayout({
  group,
  members: initialMembers,
  currentMember,
  currentUserId,
  currentUserName,
  initialMessages,
  socketToken,
}: GroupChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [members, setMembers] = useState(initialMembers);
  const router = useRouter();

  // Socket for real-time member updates
  const { isConnected, onMemberJoined, onMemberLeft } = useGroupSocket(
    group.id,
    currentUserId,
    { token: socketToken || undefined, userName: currentUserName || "Usuario" }
  );

  // Subscribe to member events
  useEffect(() => {
    if (!isConnected) return;

    const unsubJoined = onMemberJoined((newMember) => {
      setMembers((prev) => {
        // Check if member already exists
        if (prev.some((m) => m.id === newMember.memberId)) {
          return prev;
        }
        // Add new member
        return [...prev, {
          id: newMember.memberId,
          memberType: newMember.memberType,
          role: newMember.role,
          isActive: true,
          isMuted: false,
          totalMessages: 0,
          user: newMember.user,
          agent: newMember.agent,
        }];
      });
    });

    const unsubLeft = onMemberLeft((data) => {
      setMembers((prev) => prev.filter((m) => m.id !== data.memberId));
    });

    return () => {
      unsubJoined();
      unsubLeft();
    };
  }, [isConnected, onMemberJoined, onMemberLeft]);

  const userCount = members.filter((m) => m.memberType === "user").length;
  const aiCount = members.filter((m) => m.memberType === "agent").length;

  const handleMemberAdded = () => {
    // For agents added via dialog, refresh the page
    router.refresh();
  };

  return (
    <div className="h-screen flex flex-col -m-4 md:-m-6 lg:-m-8 -mb-20 lg:-mb-8" style={{ backgroundColor: '#171717' }}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/5 bg-neutral-900/95 backdrop-blur-sm h-16">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-3">
            <Hash size={24} className="text-neutral-500" />
            <div>
              <h1 className="font-bold text-white leading-tight">{group.name}</h1>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {aiCount} IAs online, {userCount} {userCount === 1 ? 'Humano' : 'Humanos'}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAddMembersOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border bg-indigo-600/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-600/20 cursor-pointer"
            >
              <UserPlus size={16} />
              <span>Invitar</span>
            </button>

            {currentMember.canEditSettings && (
              <Link
                href={`/dashboard/grupos/${group.id}/configuracion`}
                className="p-2 rounded-lg transition-colors text-neutral-400 hover:bg-neutral-800 hover:text-white"
                title="Configuración del Grupo"
              >
                <Settings size={20} />
              </Link>
            )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn(
                "p-2 rounded-lg transition-colors cursor-pointer",
                sidebarOpen
                  ? "bg-white/10 text-white"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
              )}
              title={sidebarOpen ? "Ocultar Miembros" : "Mostrar Miembros"}
            >
              <Users size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#171717' }}>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <GroupMessageThread
              groupId={group.id}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              initialMessages={initialMessages}
              groupName={group.name}
              socketToken={socketToken}
            />
          </Suspense>
        </div>

        {/* Sidebar - Conditionally rendered */}
        <div
          className={cn(
            "border-l border-white/5 overflow-hidden transition-all duration-300 ease-in-out flex-shrink-0",
            sidebarOpen ? "w-72" : "w-0 border-l-0"
          )}
          style={{ backgroundColor: '#171717' }}
        >
          <div className="w-72 h-full overflow-y-auto">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              }
            >
              <GroupMemberList
                groupId={group.id}
                members={members}
                currentUserRole={currentMember.role}
                onAddClick={() => setAddMembersOpen(true)}
              />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Add Members Dialog */}
      <AddMembersDialog
        open={addMembersOpen}
        onOpenChange={setAddMembersOpen}
        groupId={group.id}
        onMemberAdded={handleMemberAdded}
      />
    </div>
  );
}
