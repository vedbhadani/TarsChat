"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface UserListProps {
    searchQuery: string;
    onConversationReady: (conversationId: Id<"conversations">) => void;
}

export function UserList({ searchQuery, onConversationReady }: UserListProps) {
    const { user: clerkUser } = useUser();
    const allUsers = useQuery(api.users.getAllUsers) ?? [];
    const currentUser = useQuery(
        api.users.getUser,
        clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
    );
    const getOrCreate = useMutation(api.conversations.getOrCreateDirectConversation);

    // Filter out the current user and apply search
    const filteredUsers = allUsers.filter((u) => {
        // Exclude self
        if (currentUser && u._id === currentUser._id) return false;
        // Apply search filter
        if (searchQuery) {
            return u.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    const handleUserClick = async (targetUserId: Id<"users">) => {
        if (!currentUser) return;
        try {
            const conversationId = await getOrCreate({
                userA: currentUser._id,
                userB: targetUserId,
            });
            onConversationReady(conversationId);
        } catch (err) {
            console.error("Failed to create conversation:", err);
        }
    };

    if (allUsers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                </div>
                <p className="text-sm text-muted-foreground">Loading users…</p>
            </div>
        );
    }

    if (filteredUsers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">
                    {searchQuery ? "No users found" : "No other users yet"}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0.5">
            <h4 className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                People ({filteredUsers.length})
            </h4>
            {filteredUsers.map((u) => (
                <button
                    key={u._id}
                    onClick={() => handleUserClick(u._id)}
                    className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-sidebar-accent active:scale-[0.98]"
                >
                    {/* Avatar with online indicator */}
                    <div className="relative shrink-0">
                        {u.image ? (
                            <img
                                src={u.image}
                                alt={u.name}
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/20 transition-all"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                {u.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        {/* Online/offline dot */}
                        <span
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-sidebar transition-colors ${u.online
                                    ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                                    : "bg-zinc-500"
                                }`}
                        />
                    </div>

                    {/* Name and status */}
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-sidebar-foreground">
                            {u.name}
                        </p>
                        <p className={`text-xs transition-colors ${u.online ? "text-emerald-400" : "text-muted-foreground"
                            }`}>
                            {u.online ? "Online" : "Offline"}
                        </p>
                    </div>

                    {/* Chat arrow on hover */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            ))}
        </div>
    );
}
