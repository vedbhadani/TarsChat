"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface MessageBubbleProps {
    messageId: Id<"messages">;
    message: string;
    isOwn: boolean;
    timestamp?: number;
    deleted?: boolean;
    onDelete?: (messageId: Id<"messages">) => void;
}

function formatMessageTime(ts: number): string {
    const date = new Date(ts);
    return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export function MessageBubble({
    messageId,
    message,
    isOwn,
    timestamp,
    deleted,
    onDelete,
}: MessageBubbleProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    // Deleted message tombstone
    if (deleted) {
        return (
            <div
                className={cn(
                    "flex w-full",
                    isOwn ? "justify-end" : "justify-start"
                )}
            >
                <div
                    className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                        isOwn
                            ? "rounded-br-md bg-primary/30"
                            : "rounded-bl-md bg-muted/50"
                    )}
                >
                    <p className="italic text-muted-foreground">
                        🚫 This message was deleted
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "group flex w-full items-center gap-1.5",
                isOwn ? "flex-row-reverse" : "flex-row"
            )}
        >
            {/* Message bubble */}
            <div
                className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                    isOwn
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-muted text-foreground"
                )}
            >
                <p className="whitespace-pre-wrap break-words">{message}</p>
                {timestamp && (
                    <span
                        className={cn(
                            "mt-1 block text-right text-[10px]",
                            isOwn ? "text-primary-foreground/50" : "text-muted-foreground"
                        )}
                    >
                        {formatMessageTime(timestamp)}
                    </span>
                )}
            </div>

            {/* Delete button — only for own messages */}
            {isOwn && onDelete && (
                <div className="relative">
                    {showConfirm ? (
                        <div className="flex items-center gap-1 animate-in fade-in zoom-in-95">
                            <button
                                onClick={() => {
                                    onDelete(messageId);
                                    setShowConfirm(false);
                                }}
                                className="rounded-md bg-destructive/90 px-2 py-1 text-[10px] font-semibold text-destructive-foreground transition-colors hover:bg-destructive"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="rounded-md bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-muted/80"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="rounded-lg p-1 text-muted-foreground/40 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                            aria-label="Delete message"
                            title="Delete message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
