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
  }).index("by_submitted_at", ["submittedAt"]),
});
