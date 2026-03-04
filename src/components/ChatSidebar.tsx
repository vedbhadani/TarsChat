"use client";

import { SearchBar } from "@/components/SearchBar";
import { UserList } from "@/components/UserList";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function ChatSidebar() {
    const { user, isLoaded } = useUser();
    const createUserIfNotExists = useMutation(api.users.createUserIfNotExists);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    // Sync user to Convex on login
    useEffect(() => {
        if (isLoaded && user) {
            createUserIfNotExists({
                clerkId: user.id,
                name: user.fullName || user.username || "Unknown",
                image: user.imageUrl,
            }).catch((err) => console.error("Failed to sync user to Convex:", err));
        }
    }, [isLoaded, user, createUserIfNotExists]);

    const handleConversationReady = (conversationId: Id<"conversations">) => {
        router.push(`/conversation/${conversationId}`);
    };

    return (
        <aside className="flex h-full w-80 flex-col border-r border-border bg-sidebar">
            {/* User profile header */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-4">
                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: "h-9 w-9",
                        },
                    }}
                />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-sidebar-foreground">
                        {user?.fullName ?? "Loading..."}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {user?.primaryEmailAddress?.emailAddress ?? ""}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="px-3 py-3">
                <SearchBar
                    placeholder="Search users…"
                    value={searchQuery}
                    onChange={setSearchQuery}
                />
            </div>

            {/* User list — real-time from Convex */}
            <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
                <UserList
                    searchQuery={searchQuery}
                    onConversationReady={handleConversationReady}
                />
            </nav>
        </aside>
    );
}
