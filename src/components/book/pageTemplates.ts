import type { PageTemplate } from '@/types';

export interface TemplateDefinition {
  id: PageTemplate;
  label: string;
  description: string;
  /** Whether this template requires at least one image */
  requiresImage: boolean;
}

export const PAGE_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'full-image-caption',
    label: 'Full Image + Caption',
    description: 'Large image fills most of the page with a text caption at the bottom',
    requiresImage: true,
  },
  {
    id: 'image-top-text-bottom',
    label: 'Image Top, Text Bottom',
    description: 'Image in the upper portion, your story below',
    requiresImage: true,
  },
  {
    id: 'text-top-image-bottom',
    label: 'Text Top, Image Bottom',
    description: 'Your story at the top, image displayed below',
    requiresImage: true,
  },
  {
    id: 'side-by-side-left',
    label: 'Image Left, Text Right',
    description: 'Image on the left with your story alongside',
    requiresImage: true,
  },
  {
    id: 'side-by-side-right',
    label: 'Text Left, Image Right',
    description: 'Your story on the left with image alongside',
    requiresImage: true,
  },
  {
    id: 'text-only',
    label: 'Text Only',
    description: 'Elegant text-focused layout for your written memory',
    requiresImage: false,
  },
  {
    id: 'custom',
    label: 'Custom Layout',
    description: 'Adjust the split between image and text areas',
    requiresImage: true,
  },
];

/**
 * Returns the default template based on whether the submission has images.
 */
export function defaultTemplate(hasImages: boolean): PageTemplate {
  return hasImages ? 'image-top-text-bottom' : 'text-only';
}
