// Utility helpers similar to shadcn/ui starter
// Single implementation of cn utility.
// Ensure dependencies installed: clsx, tailwind-merge.
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
