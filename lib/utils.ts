import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isImageLoaded, markImageAsLoaded } from './image-cache';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function preloadImage(src: string): void {
  if (typeof window === 'undefined') return;
  if (!src) return;

  const img = new Image();
  img.src = src;
}

export function preloadImageWithCache(src: string): void {
  if (typeof window === 'undefined') return;
  if (!src) return;

  if (isImageLoaded(src)) return;

  const img = new Image();
  img.onload = () => {
    markImageAsLoaded(src);
  };
  img.src = src;
}
