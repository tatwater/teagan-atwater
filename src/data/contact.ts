export type SelectOption = { value: string; label: string };

export type FormField =
  | { type: 'input'; name: string; label: string; placeholder?: string; required?: boolean }
  | { type: 'textarea'; name: string; label: string; placeholder?: string; required?: boolean }
  | { type: 'select'; name: string; label: string; options: SelectOption[]; required?: boolean };

export interface SubjectContent {
  headline: string;
  description: string;
  bullets?: string[];
}

export interface ContactSubject {
  slug: string;
  label: string;
  subtitle: string;
  content: SubjectContent;
  formFields: FormField[];
  alwaysAvailable?: boolean;
  availabilityPronoun?: string;
  availabilityLabel?: { available: string; unavailable: string };
}

export interface ContactGroup {
  slug: string | null;
  label: string;
  avatarSrc: string;
  avatarShape: 'circle' | 'squircle';
  avatarFallback: string;
  subjects: ContactSubject[];
}

export const CONTACT_GROUPS: ContactGroup[] = [
  {
    slug: null,
    label: 'Teagan',
    avatarSrc: 'https://github.com/tatwater.png',
    avatarShape: 'circle',
    avatarFallback: 'TA',
    subjects: [
      {
        slug: 'hire',
        label: 'Hire',
        subtitle: 'Freelance design & eng.',
        content: {
          headline: 'for small freelance projects',
          description:
            'Do you have an exciting project on the horizon? For the right project, I will make time.',
          bullets: [
            'Information architecture design',
            'User interface design',
            'User experience design',
            'React development',
          ],
        },
        formFields: [
          {
            type: 'select',
            name: 'projectType',
            label: 'Project Type',
            options: [
              { value: 'marketing-website', label: 'Marketing Website' },
              { value: 'ecommerce', label: 'E-Commerce' },
              { value: 'web-app', label: 'Web App' },
              { value: 'mobile-app', label: 'Mobile App' },
              { value: 'design-system', label: 'Design System' },
              { value: 'branding', label: 'Branding' },
              { value: 'other', label: 'Other' },
            ],
            required: true,
          },
          {
            type: 'select',
            name: 'budget',
            label: 'Budget',
            options: [
              { value: 'under-1000', label: 'Under $1,000' },
              { value: '1000-2000', label: '$1,000 – $2,000' },
              { value: '2000-5000', label: '$2,000 – $5,000' },
              { value: '5000-10000', label: '$5,000 – $10,000' },
              { value: '10000-plus', label: '$10,000+' },
            ],
            required: true,
          },
          {
            type: 'select',
            name: 'clientType',
            label: 'Client Type',
            options: [
              { value: 'individual', label: 'Individual' },
              { value: 'small-business', label: 'Small Business' },
              { value: 'startup', label: 'Startup' },
              { value: 'enterprise', label: 'Enterprise' },
            ],
            required: true,
          },
          {
            type: 'select',
            name: 'timeline',
            label: 'Timeline',
            options: [
              { value: 'asap', label: 'ASAP' },
              { value: '1-month', label: '1 Month' },
              { value: '2-months', label: '2 Months' },
              { value: '3-months', label: '3 Months' },
              { value: '6-plus-months', label: '6+ Months' },
            ],
            required: true,
          },
          {
            type: 'textarea',
            name: 'message',
            label: 'Message',
            placeholder: 'Tell me more...',
            required: true,
          },
        ],
      },
      {
        slug: 'collaborate',
        label: 'Collaborate',
        subtitle: 'Startup consultation',
        content: {
          headline: 'for startup consulting',
          description:
            'Do you have an exciting project on the horizon? For the right project, I will make time.',
          bullets: [
            'Information architecture',
            'User experience design',
            'User interface design',
            'React development',
          ],
        },
        formFields: [
          {
            type: 'textarea',
            name: 'message',
            label: 'Message',
            placeholder: 'Tell me more...',
            required: true,
          },
        ],
      },
      {
        slug: 'learn',
        label: 'Learn',
        subtitle: 'UX & programming mentorship',
        content: {
          headline: 'for new mentoring opportunities',
          description:
            'Do you have an exciting project on the horizon? For the right project, I will make time.',
          bullets: [
            '1-on-1 sessions',
            'User studies advising',
            'Scalable codebase architecture',
            'Design processes & roadmapping',
            'Design critiques',
            'Code reviews',
          ],
        },
        formFields: [
          {
            type: 'textarea',
            name: 'message',
            label: 'Message',
            placeholder: 'Tell me more...',
            required: true,
          },
        ],
      },
      {
        slug: 'invite',
        label: 'Invite',
        subtitle: 'Have me at your event',
        content: {
          headline: 'for virtual or in-person events',
          description:
            'Do you have an exciting project on the horizon? For the right project, I will make time.',
          bullets: [
            'Information architecture',
            'User interface design',
            'User experience design',
            'React development',
          ],
        },
        formFields: [
          {
            type: 'textarea',
            name: 'message',
            label: 'Message',
            placeholder: 'Tell me more...',
            required: true,
          },
        ],
      },
      {
        slug: 'say-hi',
        label: 'Say hi',
        subtitle: 'All other inquiries',
        alwaysAvailable: true,
        content: {
          headline: 'Got something else',
          description: 'going on? Drop me a line.',
        },
        formFields: [
          {
            type: 'input',
            name: 'subject',
            label: 'Subject',
            placeholder: "What's on your mind?",
            required: true,
          },
          {
            type: 'textarea',
            name: 'message',
            label: 'Message',
            placeholder: 'Tell me more...',
            required: true,
          },
        ],
      },
    ],
  },
  {
    slug: 'nmc',
    label: 'New Money Company',
    avatarSrc: '/src/assets/logos/nmc.png',
    avatarShape: 'squircle',
    avatarFallback: 'NMC',
    subjects: [
      {
        slug: 'apply',
        label: 'Apply',
        subtitle: 'Build the future of trade',
        availabilityPronoun: "We're",
        availabilityLabel: { available: 'currently seeking', unavailable: 'not currently seeking' },
        content: {
          headline: 'new team members',
          description: 'We are building the future of trade and looking for talented people to join us.',
        },
        formFields: [
          {
            type: 'textarea',
            name: 'message',
            label: 'Message',
            placeholder: 'Tell me more...',
            required: true,
          },
        ],
      },
      {
        slug: 'invest',
        label: 'Invest',
        subtitle: 'Take us to the next level',
        availabilityPronoun: "We're",
        availabilityLabel: { available: 'currently seeking', unavailable: 'not currently seeking' },
        content: {
          headline: 'new investors',
          description: 'Interested in taking us to the next level? We would love to talk.',
        },
        formFields: [
          {
            type: 'textarea',
            name: 'message',
            label: 'Message',
            placeholder: 'Tell me more...',
            required: true,
          },
        ],
      },
    ],
  },
  {
    slug: 'sous',
    label: 'Sous',
    avatarSrc: '/src/assets/logos/sous.svg',
    avatarShape: 'squircle',
    avatarFallback: 'SO',
    subjects: [
      {
        slug: 'apply',
        label: 'Apply',
        subtitle: 'Build the best kitchen tool',
        availabilityLabel: { available: 'currently seeking', unavailable: 'not currently seeking' },
        content: {
          headline: 'new collaborators for Sous',
          description: 'We are building the best kitchen tool and looking for talented people.',
        },
        formFields: [
          {
            type: 'textarea',
            name: 'message',
            label: 'Message',
            placeholder: 'Tell me more...',
            required: true,
          },
        ],
      },
      {
        slug: 'invest',
        label: 'Invest',
        subtitle: 'Take us to the next level',
        availabilityLabel: { available: 'currently seeking', unavailable: 'not currently seeking' },
        content: {
          headline: 'new investors for Sous',
          description: 'Interested in taking Sous to the next level? We would love to talk.',
        },
        formFields: [
          {
            type: 'textarea',
            name: 'message',
            label: 'Message',
            placeholder: 'Tell me more...',
            required: true,
          },
        ],
      },
      {
        slug: 'advertise',
        label: 'Advertise',
        subtitle: 'Reach the home chef market',
        availabilityLabel: { available: 'currently seeking', unavailable: 'not currently seeking' },
        content: {
          headline: 'new advertisers for Sous',
          description: 'Reach thousands of passionate home chefs through Sous.',
        },
        formFields: [
          {
            type: 'textarea',
            name: 'message',
            label: 'Message',
            placeholder: 'Tell me more...',
            required: true,
          },
        ],
      },
    ],
  },
];

export function findSubject(
  group: string | null,
  subjectSlug: string
): { group: ContactGroup; subject: ContactSubject } | null {
  const g = CONTACT_GROUPS.find((cg) => cg.slug === group);
  if (!g) return null;
  const s = g.subjects.find((cs) => cs.slug === subjectSlug);
  if (!s) return null;
  return { group: g, subject: s };
}

export function subjectUrl(group: string | null, slug: string): string {
  return group ? `/contact/${group}/${slug}` : `/contact/${slug}`;
}
