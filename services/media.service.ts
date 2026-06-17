import apiClient from '@/services/apiClient';
import type { ApiResponse } from '@/types/api';

export type MediaEntityType = 'trip_event' | 'trip_expense';

/** Mirrors backend limits in apps/core/file_upload/upload.py. */
const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic'];

export function validateImageFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const isImage = file.type.startsWith('image/') || ALLOWED_EXTENSIONS.includes(ext);
  if (!isImage) return 'Only image files are allowed.';
  if (file.size > MAX_FILE_BYTES) return 'Image is too large (max 50 MB).';
  return null;
}

/**
 * Uploads a single file to the backend media endpoint and returns its public URL.
 * `entityId` is the trip id — used only for S3 folder grouping on the backend.
 */
export async function uploadMedia(
  file: File,
  entityType: MediaEntityType,
  entityId: string
): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('entity_type', entityType);
  form.append('entity_id', entityId);

  const { data } = await apiClient.post<ApiResponse<{ url: string }>>('/media/upload/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const url = data?.data?.url;
  if (!url) throw new Error('Upload failed');
  return url;
}
