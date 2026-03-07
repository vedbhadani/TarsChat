import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Convex Reactions API
 *
 * Handles emoji reactions on messages (toggle add/remove, list by message).
 */

// ── Query ────────────────────────────────────────────────

/**
 * Get all reactions for a list of messages in a conversation.
 * Returns a map: { messageId -> { emoji -> { count, userIds } } }
 */
export const getForConversation = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        // Get all message IDs in this conversation
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        const messageIds = messages.map((m) => m._id);

        // Fetch all reactions for these messages
        const reactionsMap: Record<
            string,
            Array<{ emoji: string; count: number; userIds: string[] }>
        > = {};

        for (const messageId of messageIds) {
            const reactions = await ctx.db
                .query("reactions")
                .withIndex("by_messageId", (q) => q.eq("messageId", messageId))
                .collect();

            if (reactions.length === 0) continue;

            // Group by emoji into a temp map, then convert to array
            const grouped: Record<string, { count: number; userIds: string[] }> = {};
            for (const r of reactions) {
                if (!grouped[r.emoji]) {
                    grouped[r.emoji] = { count: 0, userIds: [] };
                }
                grouped[r.emoji].count++;
                grouped[r.emoji].userIds.push(r.userId);
            }

            // Convert to array format so Convex doesn't use emojis as field names
            reactionsMap[messageId] = Object.entries(grouped).map(
                ([emoji, data]) => ({ emoji, count: data.count, userIds: data.userIds })
            );
        }

        return reactionsMap;
    },
});

// ── Mutations ────────────────────────────────────────────

/**
 * Toggle a reaction on a message.
 * If the user already reacted with this emoji, remove it.
 * If not, add it.
 */
export const toggle = mutation({
    args: {
        messageId: v.id("messages"),
        userId: v.id("users"),
        emoji: v.string(),
    },
    handler: async (ctx, args) => {
        // Find if this user has any reaction on this message
        const userReactions = await ctx.db
            .query("reactions")
            .withIndex("by_message_user", (q) =>
                q.eq("messageId", args.messageId).eq("userId", args.userId)
            )
            .collect();

        const alreadyHasThisEmoji = userReactions.find(r => r.emoji === args.emoji);

        if (alreadyHasThisEmoji) {
            // Remove the reaction if it's the same emoji
            await ctx.db.delete(alreadyHasThisEmoji._id);
            return { action: "removed" };
        } else {
            // If the user already has a different reaction, remove all their existing ones first
            // (Enforces "single user can react with only one emoji")
            for (const r of userReactions) {
                await ctx.db.delete(r._id);
            }

            // Add the new reaction
            await ctx.db.insert("reactions", {
                messageId: args.messageId,
                userId: args.userId,
                emoji: args.emoji,
            });
            return { action: "added", replaced: userReactions.length > 0 };
        }
    },
});
