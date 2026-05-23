import apiClient from '@/services/apiClient';
import { isAxiosError } from 'axios';

export type MeProfile = {
  id: string;
  phone: string;
  email: string;
  email_verified: boolean;
  first_name: string;
  last_name: string;
  name: string;
  role: string;
  is_verified: boolean;
  profile_photo_url: string;
  date_joined: string;
};

type MeApiResponse = {
  success: boolean;
  data?: MeProfile;
  error?: { code?: string; message?: string };
};

export async function fetchMe(): Promise<MeProfile> {
  try {
    const { data } = await apiClient.get<MeApiResponse>('/auth/me/');

    if (data.success && data.data) {
      return data.data;
    }

    const message = data.error?.message ?? 'Could not load profile.';
    throw new Error(message);
  } catch (e) {
    if (isAxiosError(e)) {
      const body = e.response?.data as { error?: { message?: string } } | undefined;
      const msg = body?.error?.message ?? e.message;
      throw new Error(msg || 'Could not load profile.');
    }
    throw e instanceof Error ? e : new Error('Could not load profile.');
  }
}
