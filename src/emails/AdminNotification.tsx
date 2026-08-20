/**
 * Admin Notification Email Template
 * 
 * Sent to admin when a new contact message is submitted.
 * Uses React Email components for consistent email rendering.
 */

import {
  Body,
  Button,
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

interface AdminNotificationEmailProps {
  userName?: string;
  userEmail: string;
  subject: string;
  message: string;
  messageUrl: string;
  submittedAt: string;
}

export const AdminNotificationEmail = ({
  userName = 'Someone',
  userEmail,
  subject,
  message,
  messageUrl,
  submittedAt,
}: AdminNotificationEmailProps) => {
  const previewText = `New message from ${userName}: ${subject}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Contact Message</Heading>
          
          <Text style={text}>
            You have received a new contact message from your website.
          </Text>

          <Section style={infoSection}>
            <Text style={infoLabel}>From:</Text>
            <Text style={infoValue}>
              {userName} ({userEmail})
            </Text>

            <Text style={infoLabel}>Subject:</Text>
            <Text style={infoValue}>{subject}</Text>

            <Text style={infoLabel}>Submitted:</Text>
            <Text style={infoValue}>{submittedAt}</Text>
          </Section>

          <Hr style={hr} />

          <Section style={messageSection}>
            <Text style={messageLabel}>Message:</Text>
            <Text style={messageText}>{message}</Text>
          </Section>

          <Hr style={hr} />

          <Section style={buttonSection}>
            <Button style={button} href={messageUrl}>
              View & Reply in Dashboard
            </Button>
          </Section>

          <Text style={footer}>
            This message was submitted through the contact form on your personal website.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminNotificationEmail;

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

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '1.5',
  padding: '0 48px',
  margin: '16px 0',
};

const infoSection = {
  padding: '0 48px',
  margin: '24px 0',
};

const infoLabel = {
  color: '#737373',
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '16px 0 4px',
};

const infoValue = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0 0 12px',
};

const messageSection = {
  padding: '0 48px',
  margin: '24px 0',
};

const messageLabel = {
  color: '#737373',
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0 0 12px',
};

const messageText = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
  borderLeft: '3px solid #3b82f6',
  whiteSpace: 'pre-wrap',
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '32px 48px',
};

const buttonSection = {
  padding: '0 48px',
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const footer = {
  color: '#737373',
  fontSize: '14px',
  lineHeight: '1.5',
  padding: '0 48px',
  margin: '32px 0 0',
};