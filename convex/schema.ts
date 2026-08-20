import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  contacts: defineTable({
    userId: v.string(),
    userEmail: v.string(),
    userName: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
    threadId: v.string(),
    status: v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("replied"),
      v.literal("archived")
    ),
    submittedAt: v.number(),
    // New: structured form data
    subjectSlug: v.optional(v.string()),
    group: v.optional(v.string()),
    formData: v.optional(v.any()),
  })
    .index("by_user", ["userId"])
    .index("by_thread", ["threadId"])
    .index("by_status", ["status"]),

  contactReplies: defineTable({
    contactId: v.id("contacts"),
    threadId: v.string(),
    adminId: v.string(),
    replyMessage: v.string(),
    emailSent: v.boolean(),
    emailSentAt: v.optional(v.number()),
    repliedAt: v.number(),
  })
    .index("by_contact", ["contactId"])
    .index("by_thread", ["threadId"]),

  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    canContact: v.boolean(),
    lastContactAt: v.optional(v.number()),
    contactCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Profile fields
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    displayName: v.optional(v.string()),
    phone: v.optional(v.string()),
    organization: v.optional(v.string()),
    profileComplete: v.optional(v.boolean()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  availability: defineTable({
    group: v.optional(v.string()),
    subject: v.string(),
    isAvailable: v.boolean(),
  }).index("by_group_subject", ["group", "subject"]),

  notificationSubscriptions: defineTable({
    userId: v.string(),
    group: v.optional(v.string()),
    subject: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_subject", ["userId", "subject"]),
});
