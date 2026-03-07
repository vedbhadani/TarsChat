"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";

interface NewGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGroupCreated: (conversationId: Id<"conversations">) => void;
}

export function NewGroupModal({ isOpen, onClose, onGroupCreated }: NewGroupModalProps) {
    const { user: clerkUser } = useUser();
    const currentUser = useQuery(
        api.users.getUser,
        clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
    );
    const allUsers = useQuery(api.users.getAllUsers) ?? [];
    const createGroup = useMutation(api.conversations.createGroup);

    const [groupName, setGroupName] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<Set<Id<"users">>>(new Set());
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    if (!isOpen || !currentUser) return null;

    // Filter users: exclude current user, apply search
    const filteredUsers = allUsers.filter((u) => {
        if (u._id === currentUser._id) return false;
        if (searchQuery) {
            return u.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    const toggleUser = (userId: Id<"users">) => {
        const next = new Set(selectedUserIds);
        if (next.has(userId)) {
            next.delete(userId);
        } else {
            next.add(userId);
        }
        setSelectedUserIds(next);
    };

    const handleCreate = async () => {
        if (!groupName.trim() || selectedUserIds.size === 0 || isCreating) return;

        setIsCreating(true);
        try {
            const members = [currentUser._id, ...Array.from(selectedUserIds)];

            const conversationId = await createGroup({
                members,
                groupName: groupName.trim(),
            });

            setGroupName("");
            setSelectedUserIds(new Set());
            setSearchQuery("");
            setIsCreating(false);

            onGroupCreated(conversationId);
            onClose();
        } catch (err) {
            console.error("Failed to create group:", err);
            setIsCreating(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-[rgba(26,18,8,0.4)] backdrop-blur-sm animate-in fade-in duration-150"
                onClick={onClose}
                aria-label="Close modal"
            />

            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[24px] border-[1.5px] border-[#E8E0D4] bg-[#FFFFFF] shadow-[0_2px_4px_rgba(26,18,8,0.04),0_12px_48px_rgba(26,18,8,0.12)] animate-in zoom-in-95 fade-in duration-200 sm:w-full">
                <div className="flex flex-col p-5 sm:p-8">
                    <div className="flex items-center justify-between mb-5 sm:mb-6">
                        <div>
                            <h2 className="text-lg font-bold tracking-tight text-[#1A1208] sm:text-xl">
                                New Group
                            </h2>
                            <p className="text-xs font-medium text-[#7A6A56] mt-0.5 sm:text-sm sm:mt-1">
                                Create a space for your team
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E8E0D4] text-[#7A6A56] transition-all duration-300 hover:bg-[#F5EDE3] hover:text-[#1A1208] hover:border-[#B5784A] active:scale-95 sm:h-9 sm:w-9"
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4">
                                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4 sm:space-y-5">
                        {/* Group Name Input */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-[10px] font-bold text-[#7A6A56] uppercase tracking-wider ml-1 sm:text-[11px]">
                                Group Name
                            </label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="e.g. Design Team"
                                className="w-full rounded-xl border-[1.5px] border-[#E8E0D4] bg-[#FAF7F2] px-4 py-3 text-[14px] font-semibold text-[#1A1208] placeholder:text-[#B0A090] focus:outline-none focus:border-[#B5784A] focus:shadow-[0_0_0_3px_rgba(181,120,74,0.12)] transition-all duration-300 sm:px-5 sm:py-3.5 sm:text-[15px]"
                                maxLength={50}
                            />
                        </div>

                        {/* Members Selection */}
                        <div className="space-y-1.5 sm:space-y-2 pt-1">
                            <div className="flex justify-between items-center ml-1 mb-1">
                                <label className="text-[10px] font-bold text-[#7A6A56] uppercase tracking-wider sm:text-[11px]">
                                    Members
                                </label>
                                {selectedUserIds.size > 0 && (
                                    <span className="text-[10px] font-bold text-[#B5784A] tabular-nums bg-[#F5EDE3] px-2 py-0.5 rounded-full border border-[#B5784A] sm:text-[11px] sm:px-2.5">
                                        {selectedUserIds.size} selected
                                    </span>
                                )}
                            </div>

                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0A090] sm:w-4 sm:h-4">
                                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                                </svg>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search people..."
                                    className="w-full rounded-xl border-[1.5px] border-[#E8E0D4] bg-[#FAF7F2] pl-10 pr-4 py-2.5 text-[13px] font-semibold text-[#1A1208] placeholder:text-[#B0A090] focus:outline-none focus:border-[#B5784A] focus:shadow-[0_0_0_3px_rgba(181,120,74,0.12)] transition-all duration-300 sm:pl-11 sm:pr-5 sm:py-3 sm:text-[14px]"
                                />
                            </div>

                            <div className="h-[180px] overflow-y-auto rounded-xl bg-[#FAF7F2] p-1.5 space-y-1 scrollbar-thin mt-2 border border-[#E8E0D4] sm:h-[210px] sm:mt-3">
                                {filteredUsers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <p className="text-[13px] font-medium text-[#B0A090]">No users found</p>
                                    </div>
                                ) : (
                                    filteredUsers.map((u) => {
                                        const isSelected = selectedUserIds.has(u._id);
                                        return (
                                            <div
                                                key={u._id}
                                                onClick={() => toggleUser(u._id)}
                                                className={`group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 ${isSelected ? "bg-[#F5EDE3] border border-[#B5784A]/30" : "hover:bg-[#FFFFFF]"
                                                    }`}
                                            >
                                                <div className="relative flex items-center justify-center">
                                                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isSelected ? "border-[#B5784A] bg-[#B5784A] shadow-sm shadow-[#B5784A]/20" : "border-[#E8E0D4] bg-[#FFFFFF] group-hover:border-[#B5784A]/50"}`}>
                                                        {isSelected && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-[#FFFFFF]">
                                                                <path d="M20 6 9 17l-5-5" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="relative shrink-0">
                                                    {u.image ? (
                                                        <img
                                                            src={u.image}
                                                            alt={u.name}
                                                            className="h-9 w-9 rounded-full object-cover ring-1 ring-[#E8E0D4] shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5EDE3] text-xs font-bold text-[#B5784A] ring-1 ring-[#E8E0D4] shadow-sm">
                                                            {u.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="truncate text-[14px] font-bold text-[#1A1208]">
                                                        {u.name}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex justify-end gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="rounded-[10px] px-5 py-2.5 text-[14px] font-bold text-[#7A6A56] border border-[#E8E0D4] bg-transparent transition-all duration-300 hover:bg-[#F5EDE3] hover:border-[#B5784A] hover:text-[#1A1208] active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={!groupName.trim() || selectedUserIds.size === 0 || isCreating}
                            className="flex items-center justify-center rounded-[10px] bg-[#B5784A] px-6 py-2.5 text-[14px] font-bold text-[#FFFFFF] shadow-md shadow-[#B5784A]/20 transition-all duration-300 hover:bg-[#8F5A32] hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 active:scale-95 min-w-[130px]"
                        >
                            {isCreating ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-[2.5px] border-[#FFFFFF]/30 border-t-[#FFFFFF]" />
                            ) : (
                                "Create Group"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
