import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Q3JlYXRlZCBieSBJbGlhc3MgS0FPVUFDSFAgKEstMTcxKQ==
