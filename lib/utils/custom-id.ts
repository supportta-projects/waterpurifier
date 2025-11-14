/**
 * Generates a custom ID for a given collection type
 * Format: PREFIX-XXXXXX (last 6 digits of timestamp for uniqueness)
 */
export function generateCustomId(prefix: string): string {
  const timestamp = Date.now();
  // Use last 6 digits of timestamp for a shorter, readable ID
  const shortId = timestamp.toString().slice(-6);
  return `${prefix}-${shortId}`;
}

