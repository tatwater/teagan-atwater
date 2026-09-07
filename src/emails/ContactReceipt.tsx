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

interface ContactReceiptEmailProps {
  name: string;
  subject: string;
  message: string;
  submittedAt: string;
}

/**
 * Sent back to whoever submitted the contact form, so they have proof the
 * message went through and a copy of what they wrote. `replyTo` on this email
 * points at the site owner, so a reply to the receipt still reaches a person.
 */
const ContactReceiptEmail = ({
  name,
  subject,
  message,
  submittedAt,
}: ContactReceiptEmailProps) => (
  <Html>
    <Head />
    <Preview>{`Thanks for getting in touch — I received your message`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{`Thanks for reaching out, ${name}.`}</Heading>

        <Text style={lede}>
          {`I received your message and will get back to you at this address. There's nothing else you need to do — a copy of what you sent is below for your records.`}
        </Text>

        <Hr style={hr} />

        <Section style={fieldSection}>
          <Text style={fieldLabel}>Sent</Text>
          <Text style={fieldValue}>{submittedAt}</Text>
        </Section>

        <Section style={fieldSection}>
          <Text style={fieldLabel}>Subject</Text>
          <Text style={fieldValue}>{subject}</Text>
        </Section>

        <Section style={fieldSection}>
          <Text style={fieldLabel}>Message</Text>
          <Text style={fieldValue}>{message}</Text>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          {`You're receiving this because this address was used to send a message through teaganatwater.com. If that wasn't you, you can ignore this email.`}
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ContactReceiptEmail;

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
  margin: '0 0 12px',
};

const lede = {
  color: '#404040',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 24px',
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

const footer = {
  color: '#737373',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0',
};
