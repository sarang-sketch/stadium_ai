/**
 * Formats a number as a USD currency string.
 * @param amount - The amount to format.
 * @returns The formatted currency string.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Formats an ISO date string into a localized date string.
 * @param isoString - The ISO date string.
 * @returns The formatted date string.
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Formats a duration in minutes into a human-readable string.
 * @param minutes - The duration in minutes.
 * @returns The formatted duration string (e.g., "2h 15m").
 */
export function formatDuration(minutes: number): string {
  if (minutes < 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);
  
  if (hours === 0) return `${remainingMinutes}m`;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Clamps a value between a minimum and maximum bound.
 * @param value - The value to clamp.
 * @param min - The minimum allowed value.
 * @param max - The maximum allowed value.
 * @returns The clamped value.
 */
export function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generates a unique identifier.
 * @returns A pseudo-random UUID-like string.
 */
export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
}

/**
 * Truncates a string to a maximum length, appending an ellipsis if truncated.
 * @param text - The text to truncate.
 * @param maxLength - The maximum allowed length.
 * @returns The truncated string.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
