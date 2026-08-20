import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * Get user by Clerk ID
 * Returns user info from Convex database
 */
export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    
    return user;
  },
});

/**
 * Get a user's own contact history
 * Returns messages submitted by the authenticated user
 */
export const getUserContactHistory = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Get replies for each contact
    const contactsWithReplies = await Promise.all(
      contacts.map(async (contact) => {
        const replies = await ctx.db
          .query("contactReplies")
          .withIndex("by_contact", (q) => q.eq("contactId", contact._id))
          .order("desc")
          .collect();
        
        return {
          ...contact,
          replies,
        };
      })
    );

    return contactsWithReplies;
  },
});

/**
 * Get a single contact message by ID
 * Admin only - includes full message details and replies
 */
export const getContactMessage = query({
  args: {
    messageId: v.id("contacts"),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const contact = await ctx.db.get(args.messageId);
    if (!contact) {
      return null;
    }

    const replies = await ctx.db
      .query("contactReplies")
      .withIndex("by_contact", (q) => q.eq("contactId", args.messageId))
      .order("desc")
      .collect();

    return {
      ...contact,
      replies,
    };
  },
});

/**
 * Get all contact messages
 * Admin only - for admin dashboard
 */
export const getAllContactMessages = query({
  args: {
    isAdmin: v.boolean(),
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("read"),
        v.literal("replied"),
        v.literal("archived")
      )
    ),
  },
  handler: async (ctx, args) => {
    if (!args.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const contacts = args.status
      ? await ctx.db
          .query("contacts")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .collect()
      : await ctx.db
          .query("contacts")
          .order("desc")
          .collect();

    // Get reply counts for each contact
    const contactsWithCounts = await Promise.all(
      contacts.map(async (contact) => {
        const replies = await ctx.db
          .query("contactReplies")
          .withIndex("by_contact", (q) => q.eq("contactId", contact._id))
          .collect();
        
        return {
          ...contact,
          replyCount: replies.length,
        };
      })
    );

    return contactsWithCounts;
  },
});

/**
 * Submit a new contact message
 * Requires authentication and canContact permission
 */
export const submitContactMessage = mutation({
  args: {
    userId: v.string(),
    userEmail: v.string(),
    userName: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
    subjectSlug: v.optional(v.string()),
    group: v.optional(v.string()),
    formData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user) throw new Error("User profile not found. Please complete your profile first.");
    if (!user.canContact) throw new Error("You are not authorized to submit contact messages.");
    if (!user.profileComplete) throw new Error("Please complete your profile before reaching out.");

    const now = Date.now();

    await ctx.db.patch(user._id, {
      lastContactAt: now,
      contactCount: user.contactCount + 1,
      updatedAt: now,
    });

    const threadId = `thread_${args.userId}_${now}`;

    const contactId = await ctx.db.insert("contacts", {
      userId: args.userId,
      userEmail: args.userEmail,
      userName: args.userName,
      subject: args.subject,
      message: args.message,
      threadId,
      status: "new",
      submittedAt: now,
      subjectSlug: args.subjectSlug,
      group: args.group,
      formData: args.formData,
    });

    return { contactId, threadId };
  },
});

/**
 * Reply to a contact message
 * Admin only - sends email to user and stores reply
 */
export const replyToContactMessage = mutation({
  args: {
    contactId: v.id("contacts"),
    adminId: v.string(),
    replyMessage: v.string(),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const contact = await ctx.db.get(args.contactId);
    if (!contact) {
      throw new Error("Contact message not found");
    }

    const now = Date.now();

    // Insert reply
    const replyId = await ctx.db.insert("contactReplies", {
      contactId: args.contactId,
      threadId: contact.threadId,
      adminId: args.adminId,
      replyMessage: args.replyMessage,
      emailSent: false,
      repliedAt: now,
    });

    // Update contact status
    await ctx.db.patch(args.contactId, {
      status: "replied",
    });

    return { replyId };
  },
});

/**
 * Update user's contact permission
 * Admin only - allows blocking/unblocking users
 */
export const setUserCanContact = mutation({
  args: {
    userId: v.string(),
    canContact: v.boolean(),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      canContact: args.canContact,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Mark a contact message as read
 * Admin only
 */
export const markContactAsRead = mutation({
  args: {
    contactId: v.id("contacts"),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.patch(args.contactId, {
      status: "read",
    });

    return { success: true };
  },
});