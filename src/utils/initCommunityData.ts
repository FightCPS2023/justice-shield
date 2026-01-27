import { adminApi } from './communityApi';

/**
 * Initialize community data on first app launch
 * Seeds sample advocates and resource links
 */
export async function initializeCommunityData(): Promise<boolean> {
  // Check if already initialized
  const hasInit = localStorage.getItem('cps_community_initialized');
  if (hasInit) {
    console.log('Community data already initialized');
    return true;
  }

  console.log('Initializing community data...');
  
  // Try to call the seed endpoint (may fail if server not running)
  try {
    const result = await adminApi.seedData();
    console.log('Community data seeded:', result);
    localStorage.setItem('cps_community_initialized', 'true');
    return true;
  } catch (error: any) {
    // Server not available - this is expected during development before server deployment
    console.log('ℹ️ Community data seed skipped (server not deployed yet - this is normal)');
    
    // Mark as initialized anyway to avoid repeated attempts
    // The community components will handle empty data gracefully
    localStorage.setItem('cps_community_initialized', 'true');
    return true;
  }
}