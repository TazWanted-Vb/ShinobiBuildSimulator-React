/**
 * Centralized image URL generation utilities.
 *
 * All images are proxied through Next.js API routes to avoid mixed content issues.
 * The proxy routes fetch from the HTTP server and serve via HTTPS with caching.
 */

/**
 * Get the URL for a ninja avatar or body image.
 * @param assetId - The asset ID from the API
 * @param type - Either 'head' for avatar or 'body' for full body image
 * @returns HTTPS URL to the proxied image
 */
export function getNinjaImageUrl(assetId: string, type: 'head' | 'body'): string {
  return `/api/images/ninjas/${type}_${assetId}.png`;
}

/**
 * Get the URL for a skill icon image.
 * @param iconId - The skill icon ID
 * @returns HTTPS URL to the proxied image
 */
export function getSkillImageUrl(iconId: string): string {
  return `/api/images/skills/${iconId}.png`;
}

/**
 * Get the URL for a skill type badge image.
 * @param locale - The locale (e.g., 'pt', 'en', 'zh')
 * @param typeId - The skill type ID number
 * @returns HTTPS URL to the proxied image
 */
export function getSkillTypeImageUrl(locale: string, typeId: number): string {
  return `/api/images/skillType/${locale}_${typeId}.png`;
}
