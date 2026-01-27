// Safe Environment Variable Access
// Handles cases where import.meta.env might not be available

// Store for environment variables (can be set programmatically)
const envStore: Record<string, string> = {};

/**
 * Set an environment variable programmatically
 * @param key - The environment variable key
 * @param value - The value to set
 */
export const setEnv = (key: string, value: string): void => {
  envStore[key] = value;
};

/**
 * Safely get an environment variable
 * @param key - The environment variable key (e.g., 'VITE_API_KEY')
 * @param defaultValue - Default value if not found
 * @returns The environment variable value or default
 */
export const getEnv = (key: string, defaultValue: string = ''): string => {
  // First check our local store
  if (key in envStore) {
    return envStore[key];
  }

  // Try to get from import.meta.env if available
  // Note: This will be optimized away by the bundler if import.meta is not available
  try {
    // Direct access - bundler will replace this at build time
    // @ts-ignore - import.meta may not be available at runtime
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      const value = import.meta.env[key];
      if (value !== undefined && value !== null) {
        return String(value);
      }
    }
  } catch (error) {
    // Silent fail - import.meta not available in this environment
  }

  return defaultValue;
};

/**
 * Check if running in development mode
 */
export const isDev = (): boolean => {
  const mode = getEnv('MODE', 'development');
  const dev = getEnv('DEV', '');
  return dev === 'true' || mode === 'development';
};

/**
 * Check if running in production mode
 */
export const isProd = (): boolean => {
  const mode = getEnv('MODE', 'development');
  const prod = getEnv('PROD', '');
  return prod === 'true' || mode === 'production';
};

/**
 * Get current environment mode
 */
export const getMode = (): 'development' | 'production' => {
  return getEnv('MODE', 'development') as 'development' | 'production';
};
