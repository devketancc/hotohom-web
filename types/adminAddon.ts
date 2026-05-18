import type { AdminPaginated } from '@/types/admin';

export type AdminAddonCategory = 'comfort' | 'adventure' | 'safety' | 'utility' | 'other';

export type AdminAddonPricingType = 'flat' | 'per_day';

export interface AdminAddon {
  id: string;
  name: string;
  description: string;
  category: AdminAddonCategory;
  pricing_type: AdminAddonPricingType;
  price: string;
  image_url: string;
  applicable_classes: string[];
  max_quantity: number;
  is_active: boolean;
  created_at: string;
}

export interface AdminAddonWritePayload {
  name: string;
  description?: string;
  category: AdminAddonCategory;
  pricing_type: AdminAddonPricingType;
  price: number;
  image_url?: string;
  applicable_classes?: string[];
  max_quantity?: number;
  is_active?: boolean;
}

export interface AdminAddonListQuery {
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export type AdminAddonListResponse = AdminPaginated<AdminAddon>;
