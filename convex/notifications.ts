import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getUserNotifications = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("notificationSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const isSubscribed = query({
  args: {
    userId: v.string(),
    group: v.optional(v.string()),
    subject: v.string(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("notificationSubscriptions")
      .withIndex("by_user_subject", (q) =>
        q.eq("userId", args.userId).eq("subject", args.subject)
      )
      .filter((q) =>
        args.group !== undefined
          ? q.eq(q.field("group"), args.group)
          : q.eq(q.field("group"), undefined)
      )
      .first();
    return sub?.isActive ?? false;
  },
});

export const toggleNotification = mutation({
  args: {
    userId: v.string(),
    group: v.optional(v.string()),
    subject: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("notificationSubscriptions")
      .withIndex("by_user_subject", (q) =>
        q.eq("userId", args.userId).eq("subject", args.subject)
      )
      .filter((q) =>
        args.group !== undefined
          ? q.eq(q.field("group"), args.group)
          : q.eq(q.field("group"), undefined)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { isActive: !existing.isActive });
      return { isActive: !existing.isActive };
    }

    await ctx.db.insert("notificationSubscriptions", {
      userId: args.userId,
      group: args.group,
      subject: args.subject,
      isActive: true,
      createdAt: Date.now(),
    });
    return { isActive: true };
  },
});
