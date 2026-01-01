"use client";

import { useState } from "react";
import { Users, Settings, Hash, UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GroupMessageThread } from "./GroupMessageThread";
import { GroupMemberList } from "./GroupMemberList";
import { AddMembersDialog } from "./AddMembersDialog";
import { Suspense } from "react";
import { useRouter } from "next/navigation";

interface GroupChatLayoutProps {
  group: any;
  members: any[];
  currentMember: any;
  currentUserId: string;
  initialMessages: any[];
}

export function GroupChatLayout({
  group,
  members,
  currentMember,
  currentUserId,
  initialMessages,
}: GroupChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const router = useRouter();

  const userCount = members.filter((m) => m.memberType === "user").length;
  const aiCount = members.filter((m) => m.memberType === "agent").length;

  const handleMemberAdded = () => {
    // Refresh the page to show new member
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
              initialMessages={initialMessages}
              groupName={group.name}
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
