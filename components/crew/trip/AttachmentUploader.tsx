'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  uploadMedia,
  validateImageFile,
  type MediaEntityType,
} from '@/services/media.service';

export function AttachmentUploader({
  value,
  onChange,
  entityType,
  entityId,
  required = false,
  disabled = false,
  maxFiles = 5,
  label = 'Attach photo',
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  entityType: MediaEntityType;
  entityId: string;
  required?: boolean;
  disabled?: boolean;
  maxFiles?: number;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const atLimit = value.length >= maxFiles;
  const busy = disabled || uploading;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const slots = maxFiles - value.length;
    const picked = Array.from(files).slice(0, Math.max(slots, 0));
    if (picked.length === 0) {
      setError(`You can attach up to ${maxFiles} photos.`);
      return;
    }

    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of picked) {
        const invalid = validateImageFile(file);
        if (invalid) {
          setError(invalid);
          continue;
        }
        const url = await uploadMedia(file, entityType, entityId);
        uploaded.push(url);
      }
      if (uploaded.length > 0) onChange([...value, ...uploaded]);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (url: string) => {
    onChange(value.filter((u) => u !== url));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {label}
          {required ? <span className="ml-1 text-destructive">*</span> : ' (optional)'}
        </span>
        {required ? (
          <span className="text-xs text-muted-foreground">Photo required</span>
        ) : null}
      </div>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((url) => (
            <div
              key={url}
              className="group relative size-20 overflow-hidden rounded-lg border border-border bg-muted/20"
            >
              <Image
                src={url}
                alt="Attachment"
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
              {!busy ? (
                <button
                  type="button"
                  aria-label="Remove attachment"
                  onClick={() => removeAt(url)}
                  className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-opacity hover:bg-background"
                >
                  <X className="size-3" aria-hidden />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={busy}
        onChange={(e) => void handleFiles(e.target.files)}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn('gap-2', required && value.length === 0 && 'border-destructive/60')}
        disabled={busy || atLimit}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Camera className="size-4" aria-hidden />
        )}
        {uploading ? 'Uploading…' : atLimit ? 'Limit reached' : label}
      </Button>

      {error ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
