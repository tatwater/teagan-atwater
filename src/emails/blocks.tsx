import { Hr, Section, Text } from 'react-email';
import type * as React from 'react';
import {
  fieldBox,
  fieldLabel,
  fieldSection,
  footer,
  hairline,
  quoted,
} from './theme';

/**
 * The repeating pieces inside a Frame. Both templates lay out the same way — a
 * mono label over a value — so the shape lives here rather than being written
 * out twice and drifting apart the way the old style blocks did.
 */

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

/** Mono uppercase label over free-form content, for values that need their own
 *  markup (a mailto link, say). */
export function Field({ label, children }: FieldProps) {
  return (
    <Section style={fieldSection}>
      <Text className='e-muted' style={fieldLabel}>
        {label}
      </Text>
      {children}
    </Section>
  );
}

/** A field the sender typed, boxed the way the input it came from is boxed, and
 *  kept as pre-wrap so their paragraph breaks survive. */
export function QuotedField({ label, value }: { label: string; value: string }) {
  return (
    <Field label={label}>
      <Section className='e-box' style={fieldBox}>
        <Text className='e-text' style={quoted}>
          {value}
        </Text>
      </Section>
    </Field>
  );
}

/** Closing note under a rule. */
export function Footnote({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Hr className='e-hairline' style={hairline} />
      <Text className='e-muted' style={footer}>
        {children}
      </Text>
    </>
  );
}
