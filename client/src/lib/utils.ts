import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(isoDate: string) {
  if (!isoDate) return 'No especificado';
  
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return 'No especificado';

    // Ajustar manualmente a UTC-5 (restamos 5 horas)
    const utcMinus5 = new Date(date.getTime() - (5 * 60 * 60 * 1000));

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };

    const formatted = new Intl.DateTimeFormat('es-PE', options).format(utcMinus5);
    
    // Limpiar el formato para hacerlo más consistente
    return formatted
      .replace(/,/g, '') // Remover comas
      .replace(/\s+/g, ' ') // Remover espacios múltiples
      .trim();
  } catch (e) {
    return 'No especificado';
  }
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short'
  }).format(date)
}

export function truncateString(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...'
}

export function formatApiKey(key: string): string {
  if (key.length <= 8) return key;
  return key.substring(0, 6) + '...' + key.substring(key.length - 6)
}

export function generateRandomId(length: number = 8): string {
  return Math.random().toString(16).substring(2, 2 + length)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
