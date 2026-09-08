import { Heading, Hr, Link, Text } from 'react-email';
import { Frame } from './Frame';
import { Field, Footnote, QuotedField } from './blocks';
import { SITE_URL, eyebrow, fieldValue, h1, hairline, lede, link } from './theme';

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
 *
 * The quoted fields sit in bordered boxes under mono labels because that is
 * exactly how they looked in the form a moment earlier — the receipt is the
 * submitted form handed back, not a restatement of it.
 */
const ContactReceiptEmail = ({
  name,
  subject,
  message,
  submittedAt,
}: ContactReceiptEmailProps) => (
  // The Resend subject is already `Thanks for getting in touch — I received
  // your message`, so the preview line answers the next question instead of
  // repeating it.
  <Frame preview={`A copy of what you sent is below. Nothing else to do.`}>
    <Text className='e-accent' style={eyebrow}>
      {`✓ Received`}
    </Text>

    <Heading className='e-title' style={h1}>
      {`Thanks for reaching out, ${name}.`}
    </Heading>

    <Text className='e-muted' style={lede}>
      {`I received your message and will get back to you at this address. There's nothing else you need to do — a copy of what you sent is below for your records.`}
    </Text>

    <Hr className='e-hairline' style={hairline} />

    <Field label='Sent'>
      <Text className='e-text' style={fieldValue}>
        {submittedAt}
      </Text>
    </Field>

    <QuotedField label='Subject' value={subject} />

    <QuotedField label='Message' value={message} />

    <Footnote>
      {`You're receiving this because this address was used to send a message through `}
      <Link className='e-accent' href={SITE_URL} style={link}>
        teaganatwater.com
      </Link>
      {`. If that wasn't you, you can ignore this email.`}
    </Footnote>
  </Frame>
);

export default ContactReceiptEmail;
