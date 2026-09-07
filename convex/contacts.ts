import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

/**
 * Record whether the notification email actually went out.
 *
 * Convex and Resend cannot share a transaction — an email is irreversible once
 * accepted — so the row is written first and stamped afterwards. A row left at
 * `emailDelivered: false` is the compensating record for the one case that is
 * not atomic: the insert committed, then the send failed.
 */
export const markContactDelivery = mutation({
  args: {
    contactId: v.id("contacts"),
    emailDelivered: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.contactId, { emailDelivered: args.emailDelivered });
  },
});

/**
 * Messages whose notification email never landed. Read from the Convex
 * dashboard to recover anything the sender was told had failed.
 */
export const undeliveredContacts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("contacts")
      .withIndex("by_email_delivered", (q) => q.eq("emailDelivered", false))
      .collect();
  },
});
