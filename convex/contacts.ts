import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Record a contact form submission.
 *
 * The site has no authentication and no admin UI — this table is a durable
 * write-only record of what came through the form. Messages are read via
 * email (sent alongside this mutation) or the Convex dashboard.
 */
export const submitContactMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const threadId = `thread_${now}_${Math.random().toString(36).slice(2, 10)}`;

    const contactId = await ctx.db.insert("contacts", {
      name: args.name,
      email: args.email,
      subject: args.subject,
      message: args.message,
      threadId,
      submittedAt: now,
    });

    return { contactId, threadId };
  },
});
