/**
 * User Reply Email Template
 * 
 * Sent to users when admin replies to their contact message.
 * Uses React Email components for consistent email rendering.
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'react-email';
import * as React from 'react';

interface UserReplyEmailProps {
  userName?: string;
  originalSubject: string;
  originalMessage: string;
  replyMessage: string;
  threadId: string;
}

export const UserReplyEmail = ({
  userName = 'there',
  originalSubject,
  originalMessage,
  replyMessage,
  threadId,
}: UserReplyEmailProps) => {
  const previewText = `Re: ${originalSubject}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reply to Your Message</Heading>
          
          <Text style={greeting}>
            Hi {userName},
          </Text>

          <Text style={text}>
            Thanks for reaching out! I've replied to your message below.
          </Text>

          <Section style={replySection}>
            <Text style={replyLabel}>My reply:</Text>
            <Text style={replyText}>{replyMessage}</Text>
          </Section>

          <Hr style={hr} />

          <Section style={contextSection}>
            <Text style={contextLabel}>Your original message:</Text>
            <Text style={contextSubject}>{originalSubject}</Text>
            <Text style={contextMessage}>{originalMessage}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Feel free to reply directly to this email if you'd like to continue the conversation.
          </Text>

          <Text style={signature}>
            Best regards,<br />
            Teagan
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default UserReplyEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  padding: '0 48px',
  margin: '32px 0 24px',
};

const greeting = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '1.5',
  padding: '0 48px',
  margin: '24px 0 16px',
};

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '1.5',
  padding: '0 48px',
  margin: '16px 0',
};

const replySection = {
  padding: '0 48px',
  margin: '24px 0',
};

const replyLabel = {
  color: '#737373',
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0 0 12px',
};

const replyText = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
  padding: '16px',
  backgroundColor: '#f0f9ff',
  borderRadius: '6px',
  borderLeft: '3px solid #3b82f6',
  whiteSpace: 'pre-wrap' as const,
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '32px 48px',
};

const contextSection = {
  padding: '0 48px',
  margin: '24px 0',
};

const contextLabel = {
  color: '#737373',
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0 0 12px',
};

const contextSubject = {
  color: '#525252',
  fontSize: '15px',
  fontWeight: '600',
  lineHeight: '1.5',
  margin: '0 0 8px',
};

const contextMessage = {
  color: '#737373',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  padding: '12px',
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
  whiteSpace: 'pre-wrap' as const,
};

const footer = {
  color: '#525252',
  fontSize: '14px',
  lineHeight: '1.5',
  padding: '0 48px',
  margin: '32px 0 16px',
};

const signature = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '1.5',
  padding: '0 48px',
  margin: '16px 0',
};