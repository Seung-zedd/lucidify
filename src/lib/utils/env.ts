import { browser, dev } from "$app/environment";

/**
 * Flag to check if we are on the development/staging website.
 * This is used for debugging and specific staging-only logic.
 */
export const IS_DEV_SITE =
  browser &&
  window.location.hostname ===
    "https://lucidify-git-dev-seungzedds-projects.vercel.app/"; // your domain name

/**
 * Combined flag for any development environment (Local OR Staging).
 */
export const IS_DEV_MODE = dev || IS_DEV_SITE;
