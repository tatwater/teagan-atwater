/**
 * ContactForm Tests
 * 
 * Tests for the contact form React island component.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactForm from './ContactForm';
import { mockSuccessResponse, mockErrorResponse } from '../test/utils';

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('unauthenticated state', () => {
    it('shows sign-in prompt when not authenticated', () => {
      render(
        <ContactForm
          isAuthenticated={false}
        />
      );

      expect(screen.getByText(/Please/i)).toBeInTheDocument();
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/Subject/i)).not.toBeInTheDocument();
    });

    it('provides sign-in link', () => {
      render(
        <ContactForm
          isAuthenticated={false}
        />
      );

      const signInLink = screen.getByRole('link', { name: /sign in/i });
      expect(signInLink).toHaveAttribute('href', '/sign-in');
    });
  });

  describe('authenticated state', () => {
    it('renders form when authenticated', () => {
      render(
        <ContactForm
          isAuthenticated={true}
          userId="user_test_123"
          userEmail="test@example.com"
          userName="Test User"
        />
      );

      expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Send Message/i })).toBeInTheDocument();
    });

    it('has submit button disabled when fields are empty', () => {
      render(
        <ContactForm
          isAuthenticated={true}
          userId="user_test_123"
          userEmail="test@example.com"
        />
      );

      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when fields are filled', async () => {
      render(
        <ContactForm
          isAuthenticated={true}
          userId="user_test_123"
          userEmail="test@example.com"
        />
      );

      const subjectInput = screen.getByLabelText(/Subject/i);
      const messageInput = screen.getByLabelText(/Message/i);
      const submitButton = screen.getByRole('button', { name: /Send Message/i });

      fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
      fireEvent.change(messageInput, { target: { value: 'Test message content' } });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('form submission', () => {
    it('submits form with correct data', async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        mockSuccessResponse({
          contactId: 'contact_123',
          threadId: 'thread_123',
        })
      );
      global.fetch = mockFetch;

      render(
        <ContactForm
          isAuthenticated={true}
          userId="user_test_123"
          userEmail="test@example.com"
          userName="Test User"
        />
      );

      const subjectInput = screen.getByLabelText(/Subject/i);
      const messageInput = screen.getByLabelText(/Message/i);
      const submitButton = screen.getByRole('button', { name: /Send Message/i });

      fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
      fireEvent.change(messageInput, { target: { value: 'Test message' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/contact/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject: 'Test Subject',
            message: 'Test message',
            userName: 'Test User',
            userEmail: 'test@example.com',
          }),
        });
      });
    });

    it('shows success message on successful submission', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockSuccessResponse({
          contactId: 'contact_123',
          threadId: 'thread_123',
        })
      );

      render(
        <ContactForm
          isAuthenticated={true}
          userId="user_test_123"
          userEmail="test@example.com"
        />
      );

      const subjectInput = screen.getByLabelText(/Subject/i);
      const messageInput = screen.getByLabelText(/Message/i);
      const submitButton = screen.getByRole('button', { name: /Send Message/i });

      fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
      fireEvent.change(messageInput, { target: { value: 'Test message' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Message sent successfully/i)).toBeInTheDocument();
      });
    });

    it('clears form fields after successful submission', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockSuccessResponse({
          contactId: 'contact_123',
          threadId: 'thread_123',
        })
      );

      render(
        <ContactForm
          isAuthenticated={true}
          userId="user_test_123"
          userEmail="test@example.com"
        />
      );

      const subjectInput = screen.getByLabelText(/Subject/i) as HTMLInputElement;
      const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /Send Message/i });

      fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
      fireEvent.change(messageInput, { target: { value: 'Test message' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(subjectInput.value).toBe('');
        expect(messageInput.value).toBe('');
      });
    });

    it('shows error message on failed submission', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockErrorResponse('Failed to submit message', 500)
      );

      render(
        <ContactForm
          isAuthenticated={true}
          userId="user_test_123"
          userEmail="test@example.com"
        />
      );

      const subjectInput = screen.getByLabelText(/Subject/i);
      const messageInput = screen.getByLabelText(/Message/i);
      const submitButton = screen.getByRole('button', { name: /Send Message/i });

      fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
      fireEvent.change(messageInput, { target: { value: 'Test message' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to submit message/i)).toBeInTheDocument();
      });
    });

    it('disables submit button while submitting', async () => {
      global.fetch = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockSuccessResponse({})), 100))
      );

      render(
        <ContactForm
          isAuthenticated={true}
          userId="user_test_123"
          userEmail="test@example.com"
        />
      );

      const subjectInput = screen.getByLabelText(/Subject/i);
      const messageInput = screen.getByLabelText(/Message/i);
      const submitButton = screen.getByRole('button', { name: /Send Message/i });

      fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
      fireEvent.change(messageInput, { target: { value: 'Test message' } });
      fireEvent.click(submitButton);

      expect(screen.getByRole('button', { name: /Sending.../i })).toBeDisabled();
    });

    it('handles network errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      render(
        <ContactForm
          isAuthenticated={true}
          userId="user_test_123"
          userEmail="test@example.com"
        />
      );

      const subjectInput = screen.getByLabelText(/Subject/i);
      const messageInput = screen.getByLabelText(/Message/i);
      const submitButton = screen.getByRole('button', { name: /Send Message/i });

      fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
      fireEvent.change(messageInput, { target: { value: 'Test message' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('has proper labels for form fields', () => {
      render(
        <ContactForm
          isAuthenticated={true}
          userId="user_test_123"
          userEmail="test@example.com"
        />
      );

      expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
    });

    it('marks fields as required', () => {
      render(
        <ContactForm
          isAuthenticated={true}
          userId="user_test_123"
          userEmail="test@example.com"
        />
      );

      const subjectInput = screen.getByLabelText(/Subject/i);
      const messageInput = screen.getByLabelText(/Message/i);

      expect(subjectInput).toBeRequired();
      expect(messageInput).toBeRequired();
    });

    it('has proper button text states', async () => {
      global.fetch = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockSuccessResponse({})), 100))
      );

      render(
        <ContactForm
          isAuthenticated={true}
          userId="user_test_123"
          userEmail="test@example.com"
        />
      );

      const subjectInput = screen.getByLabelText(/Subject/i);
      const messageInput = screen.getByLabelText(/Message/i);

      // Initial state
      expect(screen.getByRole('button', { name: /Send Message/i })).toBeInTheDocument();

      // Submitting state
      fireEvent.change(subjectInput, { target: { value: 'Test' } });
      fireEvent.change(messageInput, { target: { value: 'Test' } });
      fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Sending.../i })).toBeInTheDocument();
      });
    });
  });
});