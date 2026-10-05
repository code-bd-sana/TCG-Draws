/**
 * Centralized environment configuration module.
 * Provides typed access to environment variables used across the application.
 * Prevents hardcoding `process.env.NEXT_PUBLIC_*` throughout the codebase.
 */

interface EnvConfig {
  apiUrl: string;
  appUrl: string;
}

const normalizeUrl = (url: string): string => {
  let cleaned = (url || '').trim().replace(/\/+$/, '');
  // Automatically upgrade insecure tcgdraws.com domain to https to prevent 301 CORS Network Error in browsers
  if (cleaned.startsWith('http://tcgdraws.com') || cleaned.startsWith('http://www.tcgdraws.com')) {
    cleaned = cleaned.replace(/^http:\/\//, 'https://');
  }
  return cleaned;
};

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const envConfig: EnvConfig = {
  apiUrl: normalizeUrl(rawApiUrl),
  appUrl: normalizeUrl(rawAppUrl),
};
