import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Convex Conversations API
 *
 * Handles conversation-related operations (create, list, get by ID).
 */

// ── Queries ──────────────────────────────────────────────

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("conversations").collect();
    },
});

export const get = query({
    args: { id: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

/**
 * Find an existing 1-on-1 conversation between two users.
 * Returns the conversation if it exists, or null.
 */
export const getDirectConversation = query({
    args: {
        userA: v.id("users"),
        userB: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Get all conversations and find one that has exactly these two members
        const allConversations = await ctx.db.query("conversations").collect();
        return (
            allConversations.find(
                (c) =>
                    c.members.length === 2 &&
                    c.members.includes(args.userA) &&
                    c.members.includes(args.userB)
            ) ?? null
        );
    },
});

// ── Mutations ────────────────────────────────────────────

export const create = mutation({
    args: {
        members: v.array(v.id("users")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("conversations", {
            members: args.members,
        });
    },
});

/**
 * Create a 1-on-1 conversation if one doesn't already exist.
 * Returns the existing conversation ID if found, or creates a new one.
 */
export const getOrCreateDirectConversation = mutation({
    args: {
        userA: v.id("users"),
        userB: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Search for an existing conversation between these two users
        const allConversations = await ctx.db.query("conversations").collect();
        const existing = allConversations.find(
            (c) =>
                c.members.length === 2 &&
                c.members.includes(args.userA) &&
                c.members.includes(args.userB)
        );

        if (existing) {
            return existing._id;
        }

        // Create a new conversation
        return await ctx.db.insert("conversations", {
            members: [args.userA, args.userB],
        });
    },
});
