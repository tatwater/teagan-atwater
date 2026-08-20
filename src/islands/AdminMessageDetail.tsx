import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';

interface AdminMessageDetailProps {
  messageId: string;
  adminId: string;
}

interface ContactReply {
  _id: string;
  replyMessage: string;
  repliedAt: number;
  adminId: string;
  emailSent: boolean;
  emailSentAt?: number;
}

interface ContactMessage {
  _id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  subject: string;
  message: string;
  subjectSlug?: string;
  group?: string;
  formData?: Record<string, string>;
  threadId: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  submittedAt: number;
  replies: ContactReply[];
}

const STATUS_COLORS: Record<string, string> = {
  new: 'text-primary',
  read: 'text-muted-foreground',
  replied: 'text-emerald-500',
  archived: 'text-muted-foreground',
};

export default function AdminMessageDetail({ messageId }: AdminMessageDetailProps) {
  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    loadMessage();
  }, [messageId]);

  async function loadMessage() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/contacts/${messageId}`);
      if (res.status === 404) { setNotFound(true); setIsLoading(false); return; }
      if (!res.ok) throw new Error('Failed to load message');
      const data = await res.json();
      setMessage(data.message);
      if (data.message.status === 'new') await markAsRead();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load message');
    } finally {
      setIsLoading(false);
    }
  }

  async function markAsRead() {
    try {
      await fetch('/api/admin/contacts/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });
      setMessage(prev => prev ? { ...prev, status: 'read' } : null);
    } catch {}
  }

  async function handleReplySubmit(e: FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitError('');
    try {
      const res = await fetch('/api/admin/contacts/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, replyMessage: replyText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reply');
      setSubmitStatus('success');
      setReplyText('');
      await loadMessage();
      if (data.emailError) setSubmitError(`Reply saved, but email failed: ${data.emailError}`);
    } catch (err) {
      setSubmitStatus('error');
      setSubmitError(err instanceof Error ? err.message : 'Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <p className="text-xs text-muted-foreground py-10 text-center">Loading…</p>
    );
  }

  if (notFound) {
    return (
      <div className="border border-border px-6 py-12 text-center">
        <p className="text-sm text-foreground mb-1">Message not found</p>
        <p className="text-xs text-muted-foreground mb-6">It may have been deleted.</p>
        <a href="/admin" className="text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors">
          ← Back to admin
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-destructive/40 bg-destructive/5 px-6 py-8 text-center">
        <p className="text-xs text-destructive mb-3">{error}</p>
        <button onClick={loadMessage} className="text-xs underline underline-offset-2 text-muted-foreground">
          Try again
        </button>
      </div>
    );
  }

  if (!message) return null;

  const formEntries = message.formData ? Object.entries(message.formData) : [];

  return (
    <div className="space-y-px border border-border">

      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-glyph text-2xl tracking-tight">{message.subject}</h1>
          <span className={`font-mono text-[10px] uppercase tracking-widest shrink-0 mt-1 ${STATUS_COLORS[message.status] ?? 'text-muted-foreground'}`}>
            {message.status}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(message.submittedAt).toLocaleDateString('en-US', { dateStyle: 'full' })}
        </p>
      </div>

      {/* Sender */}
      <div className="px-5 py-4 border-b border-border">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">From</p>
        <p className="text-sm text-foreground">{message.userName || '—'}</p>
        <p className="text-xs text-muted-foreground">{message.userEmail}</p>
        {message.threadId && (
          <p className="text-[10px] font-mono text-muted-foreground/60 mt-2">{message.threadId}</p>
        )}
      </div>

      {/* Structured form fields */}
      {formEntries.length > 0 && (
        <div className="px-5 py-4 border-b border-border">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Details</p>
          <dl className="space-y-2">
            {formEntries.map(([key, value]) => (
              <div key={key} className="flex gap-4 text-xs">
                <dt className="text-muted-foreground w-32 shrink-0 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </dt>
                <dd className="text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Original message */}
      <div className="px-5 py-4 border-b border-border">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Message</p>
        <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{message.message}</p>
      </div>

      {/* Replies */}
      {message.replies && message.replies.length > 0 && (
        <div className="px-5 py-4 border-b border-border">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
            Replies ({message.replies.length})
          </p>
          <div className="space-y-3">
            {message.replies.map((reply) => (
              <div key={reply._id} className="border-l-2 border-primary pl-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary">You replied</span>
                  <div className="flex items-center gap-2">
                    {reply.emailSent && (
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500">Sent</span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(reply.repliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{reply.replyMessage}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reply form */}
      <div className="px-5 py-4">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Send Reply</p>
        <form onSubmit={handleReplySubmit} className="space-y-3">
          <textarea
            rows={5}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={isSubmitting}
            required
            placeholder="Type your reply… This will be emailed to the sender."
            className="w-full border border-input bg-transparent px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 transition-colors disabled:opacity-50 resize-y"
          />

          {submitStatus === 'success' && !submitError && (
            <p className="text-xs text-emerald-500">Reply sent.</p>
          )}
          {(submitStatus === 'error' || (submitStatus === 'success' && submitError)) && (
            <p className="text-xs text-destructive">{submitError || 'Failed to send reply.'}</p>
          )}

          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              To: <span className="text-foreground">{message.userEmail}</span>
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !replyText.trim()}
              className="h-7 px-3 text-xs border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending…' : 'Send Reply'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
