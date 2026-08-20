import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getAvailability = query({
  args: {
    group: v.optional(v.string()),
    subject: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("availability")
      .withIndex("by_group_subject", (q) =>
        q.eq("group", args.group).eq("subject", args.subject)
      )
      .first();
    return record ?? null;
  },
});

export const getAllAvailability = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("availability").collect();
  },
});

export const setAvailability = mutation({
  args: {
    group: v.optional(v.string()),
    subject: v.string(),
    isAvailable: v.boolean(),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.isAdmin) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("availability")
      .withIndex("by_group_subject", (q) =>
        q.eq("group", args.group).eq("subject", args.subject)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { isAvailable: args.isAvailable });
    } else {
      await ctx.db.insert("availability", {
        group: args.group,
        subject: args.subject,
        isAvailable: args.isAvailable,
      });
    }

    return { success: true };
  },
});
