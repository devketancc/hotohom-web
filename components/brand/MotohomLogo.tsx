'use client';

import Image, { type ImageProps } from 'next/image';
import motologo from '@/assets/brand/motologo.png';
import { cn } from '@/lib/utils';

const DEFAULT_ALT =
  'MŌTŌHOM logo featuring a stylized house with a wheel-shaped base.';

export type MotohomLogoProps = Omit<ImageProps, 'src' | 'alt' | 'placeholder'> & {
  alt?: string;
  /** Matte black in artwork: blends into dark backgrounds */
  blendOnDark?: boolean;
};

export function MotohomLogo({
  className,
  blendOnDark = false,
  alt = DEFAULT_ALT,
  sizes = '(max-width: 768px) 200px, 280px',
  ...props
}: MotohomLogoProps) {
  const image = (
    <Image
      src={motologo}
      alt={alt}
      sizes={sizes}
      placeholder="blur"
      className={cn('h-auto w-auto max-w-full object-contain object-left', className)}
      {...props}
    />
  );

  if (blendOnDark) {
    return <span className="inline-flex max-w-full mix-blend-lighten">{image}</span>;
  }

  return image;
}
