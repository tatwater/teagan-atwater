import { Heading, Hr, Link, Text } from 'react-email';
import { Frame } from './Frame';
import { Field, Footnote, QuotedField } from './blocks';
import { fieldValue, h1, hairline, lede, link, mutedEyebrow } from './theme';

interface ContactSubmissionEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
}

/**
 * The notification to the site owner — the send that actually delivers the
 * message. Shares the receipt's chrome so the pair reads as one system, but
 * leads with the subject rather than a greeting, and puts the only accent on
 * the sender's address, which is the one thing here worth clicking.
 */
const ContactSubmissionEmail = ({
  name,
  email,
  subject,
  message,
  submittedAt,
}: ContactSubmissionEmailProps) => (
  // The preview is the message itself: the Resend subject is already
  // `New website contact from ${name}: ${subject}`, so repeating it here would
  // spend the inbox's second line saying the first line again.
  <Frame preview={message}>
    <Text className='e-muted' style={mutedEyebrow}>
      New message
    </Text>

    <Heading className='e-title' style={h1}>
      {subject}
    </Heading>

    <Text className='e-muted' style={lede}>
      {`From ${name} · ${submittedAt}`}
    </Text>

    <Hr className='e-hairline' style={hairline} />

    <Field label='Reply to'>
      <Text className='e-text' style={fieldValue}>
        <Link className='e-accent' href={`mailto:${email}`} style={link}>
          {email}
        </Link>
      </Text>
    </Field>

    <QuotedField label='Message' value={message} />

    <Footnote>{`Replying to this email goes straight to ${name}.`}</Footnote>
  </Frame>
);

export default ContactSubmissionEmail;
