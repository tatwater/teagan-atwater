import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

/**
 * Content Collections Configuration
 *
 * Defines schemas for MDX-based content.
 * Keep minimal for now - expand as needed.
 */

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    // Basic metadata
    title: z.string(),
    description: z.string(),

    // Visibility & access control
    published: z.boolean().default(false),
    groups: z.array(z.string()).optional(), // Clerk groups with access

    // Categorization
    tags: z.array(z.string()).default([]),

    // Dates
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),

    // Display
    featured: z.boolean().default(false),
    order: z.number().optional(),

    // Optional fields
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

export const collections = {
  projects,
};
