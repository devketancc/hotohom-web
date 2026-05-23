import { z } from 'zod';
import type { AdminAddon, AdminAddonWritePayload } from '@/types/adminAddon';

const categorySchema = z.enum(['comfort', 'adventure', 'safety', 'utility', 'other']);
const pricingTypeSchema = z.enum(['flat', 'per_day']);

export const addonFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required.').max(255, 'Max 255 characters.'),
    description: z.string(),
    category: categorySchema,
    pricing_type: pricingTypeSchema,
    price: z.string().min(1, 'Price is required.'),
    image_url: z.string(),
    all_classes: z.boolean(),
    applicable_classes: z.array(z.string()),
    max_quantity: z.string(),
    is_active: z.boolean(),
  })
  .superRefine((val, ctx) => {
    const price = Number(val.price);
    if (!Number.isFinite(price) || price <= 0) {
      ctx.addIssue({ code: 'custom', message: 'Enter a positive amount.', path: ['price'] });
    }

    const mq = val.max_quantity.trim() === '' ? 1 : Number(val.max_quantity);
    if (!Number.isFinite(mq) || mq < 1 || !Number.isInteger(mq)) {
      ctx.addIssue({ code: 'custom', message: 'Must be an integer ≥ 1.', path: ['max_quantity'] });
    }

    const url = val.image_url.trim();
    if (url) {
      try {
        new URL(url);
      } catch {
        ctx.addIssue({ code: 'custom', message: 'Enter a valid URL or leave empty.', path: ['image_url'] });
      }
    }

    if (!val.all_classes && val.applicable_classes.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Select at least one class or enable “All caravan classes”.',
        path: ['applicable_classes'],
      });
    }
  });

export type AddonFormValues = z.infer<typeof addonFormSchema>;

export function defaultAddonFormValues(): AddonFormValues {
  return {
    name: '',
    description: '',
    category: 'comfort',
    pricing_type: 'per_day',
    price: '',
    image_url: '',
    all_classes: true,
    applicable_classes: [],
    max_quantity: '1',
    is_active: true,
  };
}

export function adminAddonToFormValues(addon: AdminAddon): AddonFormValues {
  const allClasses = addon.applicable_classes.length === 0;
  return {
    name: addon.name,
    description: addon.description ?? '',
    category: addon.category,
    pricing_type: addon.pricing_type,
    price: addon.price,
    image_url: addon.image_url ?? '',
    all_classes: allClasses,
    applicable_classes: allClasses ? [] : [...addon.applicable_classes],
    max_quantity: String(addon.max_quantity),
    is_active: addon.is_active,
  };
}

export function addonFormValuesToPayload(values: AddonFormValues): AdminAddonWritePayload {
  return {
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    category: values.category,
    pricing_type: values.pricing_type,
    price: Number(values.price),
    image_url: values.image_url.trim() || undefined,
    applicable_classes: values.all_classes ? [] : values.applicable_classes,
    max_quantity: values.max_quantity.trim() === '' ? 1 : Number(values.max_quantity),
    is_active: values.is_active,
  };
}
