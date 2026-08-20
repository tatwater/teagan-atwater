/**
 * Contact Form Island
 * 
 * Interactive React component for submitting contact messages.
 * Handles form validation, submission, and displays user's contact history.
 */

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';

interface ContactFormProps {
  userId?: string;
  userEmail?: string;
  userName?: string;
  isAuthenticated: boolean;
}

interface ContactMessage {
  _id: string;
  subject: string;
  message: string;
  submittedAt: number;
  status: 'new' | 'read' | 'replied' | 'archived';
  replies?: Array<{
    _id: string;
    replyMessage: string;
    repliedAt: number;
  }>;
}

export default function ContactForm({
  userId,
  userEmail,
  userName,
  isAuthenticated,
}: ContactFormProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [contactHistory, setContactHistory] = useState<ContactMessage[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load contact history if authenticated
  useEffect(() => {
    if (isAuthenticated && userId) {
      // TODO: Fetch contact history from Convex
      // This will be implemented when we set up the Convex React integration
    }
  }, [isAuthenticated, userId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setErrorMessage('You must be signed in to submit a message');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          message,
          userName,
          userEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit message');
      }

      setSubmitStatus('success');
      setSubject('');
      setMessage('');
      
      // Log email status for debugging
      if (data.emailSent) {
        console.log('Admin notification email sent successfully');
      } else if (data.emailError) {
        console.warn('Email notification failed:', data.emailError);
        setErrorMessage(`Message saved, but email notification failed: ${data.emailError}`);
      }
      
      // Refresh contact history
      // TODO: Refetch from Convex
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to submit message'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Please{' '}
            <a href="/sign-in" className="underline font-medium">
              sign in
            </a>{' '}
            to submit a contact message.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject */}
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium mb-2"
          >
            Subject
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="What's this about?"
          />
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium mb-2"
          >
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            disabled={isSubmitting}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-y"
            placeholder="Tell me what's on your mind..."
          />
        </div>

        {/* Submit Status Messages */}
        {submitStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">
              ✓ Message sent successfully! I'll get back to you soon.
            </p>
            {errorMessage && (
              <p className="text-yellow-700 text-sm mt-2">
                ⚠ Note: {errorMessage}
              </p>
            )}
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">
              ✗ {errorMessage || 'Failed to send message. Please try again.'}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !subject || !message}
          className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {/* Contact History Toggle */}
      {contactHistory.length > 0 && (
        <div className="mt-12">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full text-left text-lg font-semibold py-3 border-b border-gray-200 hover:border-gray-300 transition-colors"
          >
            <span>Your Message History</span>
            <span className="text-gray-400">
              {showHistory ? '−' : '+'}
            </span>
          </button>

          {showHistory && (
            <div className="mt-6 space-y-4">
              {contactHistory.map((contact) => (
                <div
                  key={contact._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{contact.subject}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        contact.status === 'replied'
                          ? 'bg-green-100 text-green-800'
                          : contact.status === 'read'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {contact.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(contact.submittedAt).toLocaleDateString('en-US', {
                      dateStyle: 'long',
                    })}
                  </p>
                  
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {contact.message}
                  </p>

                  {/* Replies */}
                  {contact.replies && contact.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-blue-200 space-y-3">
                      {contact.replies.map((reply) => (
                        <div key={reply._id} className="bg-blue-50 rounded p-3">
                          <p className="text-xs text-blue-600 font-medium mb-1">
                            Reply from Teagan
                          </p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {reply.replyMessage}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(reply.repliedAt).toLocaleDateString('en-US', {
                              dateStyle: 'long',
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}