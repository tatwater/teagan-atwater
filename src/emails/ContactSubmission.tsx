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

interface ContactSubmissionEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export const ContactSubmissionEmail = ({
  name,
  email,
  subject,
  message,
  submittedAt,
}: ContactSubmissionEmailProps) => (
  <Html>
    <Head />
    <Preview>{`New website contact from ${name}: ${subject}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{subject}</Heading>

        <Text style={meta}>{submittedAt}</Text>

        <Section style={cardSection}>
          <Text style={cardRow}>
            <span style={cardLabel}>Name</span>
            <span style={cardValue}>{name}</span>
          </Text>
          <Text style={cardRow}>
            <span style={cardLabel}>Email</span>
            <span style={cardValue}>{email}</span>
          </Text>
        </Section>

        <Hr style={hr} />

        <Section style={fieldSection}>
          <Text style={fieldLabel}>Message</Text>
          <Text style={fieldValue}>{message}</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ContactSubmissionEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '32px 48px 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '22px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 6px',
};

const meta = {
  color: '#737373',
  fontSize: '13px',
  margin: '0 0 24px',
};

const cardSection = {
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
  padding: '16px',
  margin: '0 0 24px',
};

const cardRow = {
  margin: '4px 0',
  fontSize: '14px',
  color: '#1a1a1a',
};

const cardLabel = {
  color: '#737373',
  fontWeight: '600' as const,
  display: 'inline-block' as const,
  width: '110px',
};

const cardValue = {
  color: '#1a1a1a',
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '0 0 24px',
};

const fieldSection = {
  margin: '0 0 20px',
};

const fieldLabel = {
  color: '#737373',
  fontSize: '11px',
  fontWeight: '600' as const,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px',
};

const fieldValue = {
  color: '#1a1a1a',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
};
