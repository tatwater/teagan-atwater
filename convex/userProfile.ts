import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getUserProfile = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const upsertUserProfile = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    displayName: v.optional(v.string()),
    phone: v.optional(v.string()),
    organization: v.optional(v.string()),
    profileComplete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      const patch: Record<string, unknown> = { updatedAt: now, email: args.email };
      if (args.firstName !== undefined) patch.firstName = args.firstName;
      if (args.lastName !== undefined) patch.lastName = args.lastName;
      if (args.displayName !== undefined) patch.displayName = args.displayName;
      if (args.phone !== undefined) patch.phone = args.phone;
      if (args.organization !== undefined) patch.organization = args.organization;
      if (args.profileComplete !== undefined) patch.profileComplete = args.profileComplete;
      await ctx.db.patch(existing._id, patch);
      return { userId: existing._id };
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      displayName: args.displayName,
      phone: args.phone,
      organization: args.organization,
      profileComplete: args.profileComplete ?? false,
      canContact: true,
      contactCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    return { userId };
  },
});

// Called from profile/setup page after the user fills out the form
export const completeProfile = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.optional(v.string()),
    displayName: v.optional(v.string()),
    phone: v.optional(v.string()),
    organization: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        firstName: args.firstName,
        lastName: args.lastName,
        displayName: args.displayName,
        phone: args.phone,
        organization: args.organization,
        profileComplete: true,
        email: args.email,
        updatedAt: now,
      });
      return { userId: existing._id };
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      displayName: args.displayName,
      phone: args.phone,
      organization: args.organization,
      profileComplete: true,
      canContact: true,
      contactCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    return { userId };
  },
});
