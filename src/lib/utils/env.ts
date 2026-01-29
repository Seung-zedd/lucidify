import { browser, dev } from "$app/environment";

/**
 * Helper to check if a hostname belongs to a Vercel preview deployment.
 */
export const isDevHostname = (hostname: string) =>
  hostname.includes("lucidify-git-dev");

/**
 * Flag to check if we are on the development/staging website.
 */
export const IS_DEV_SITE = browser && isDevHostname(window.location.hostname);

/**
 * Combined flag for any development environment (Local OR Staging).
 */
export const IS_DEV_MODE = dev || IS_DEV_SITE;
