import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  contacts: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    threadId: v.string(),
    submittedAt: v.number(),

    // Whether the notification email reached the site owner. Undefined means the
    // send has not been attempted yet; false marks a row worth recovering by
    // hand, since the sender was told their message did not go through.
    emailDelivered: v.optional(v.boolean()),
  })
    .index("by_submitted_at", ["submittedAt"])
    .index("by_email_delivered", ["emailDelivered"]),
});
