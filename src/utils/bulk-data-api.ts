/**
 * CourtListener Bulk Data API Integration
 * Provides access to bulk CSV downloads, embeddings, and local caching
 */

import { projectId, publicAnonKey } from './supabase/info.tsx';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a24eaa40`;

// CourtListener S3 Bucket for bulk data
const BULK_DATA_BUCKET = 'com-courtlistener-storage';
const BULK_DATA_BASE_URL = `https://${BULK_DATA_BUCKET}.s3.amazonaws.com`;

export interface BulkDataFile {
  name: string;
  type: 'courts' | 'dockets' | 'opinions' | 'clusters' | 'citations' | 'judges' | 'audio' | 'schema';
  size: number;
  lastModified: string;
  url: string;
  description: string;
}

export interface ImportStatus {
  total: number;
  processed: number;
  errors: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  errorMessages?: string[];
}

export interface CitationEdge {
  source: number; // citing opinion ID
  target: number; // cited opinion ID
  depth: number;
}

export interface CitationNode {
  id: number;
  caseName: string;
  court: string;
  dateDecided: string;
  citation: string;
  inCitations: number;
  outCitations: number;
  importance: number; // calculated from citation count
}

export interface CitationNetwork {
  nodes: CitationNode[];
  edges: CitationEdge[];
  rootCase?: number;
  depth: number;
}

export interface SemanticSearchResult {
  opinion_id: number;
  case_name: string;
  court: string;
  date_filed: string;
  similarity_score: number;
  text_snippet: string;
  citation: string;
  absolute_url: string;
}

export interface AnalyticsQuery {
  type: 'violation_patterns' | 'court_trends' | 'judge_statistics' | 'timeline_analysis' | 'citation_impact';
  filters?: {
    courtId?: string;
    dateStart?: string;
    dateEnd?: string;
    violationType?: string;
    jurisdiction?: string;
  };
  groupBy?: string;
  orderBy?: string;
  limit?: number;
}

export interface AnalyticsResult {
  query: string;
  data: any[];
  summary: {
    totalRecords: number;
    dateRange: { start: string; end: string };
    insights: string[];
  };
  visualization: {
    type: 'bar' | 'line' | 'pie' | 'network' | 'timeline';
    config: any;
  };
}

/**
 * List available bulk data files from CourtListener
 */
export async function listBulkDataFiles(accessToken: string): Promise<BulkDataFile[]> {
  try {
    const response = await fetch(`${SERVER_URL}/bulk-data/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list bulk data files: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error listing bulk data files:', error);
    throw error;
  }
}

/**
 * Download and import a bulk data file
 */
export async function importBulkData(
  accessToken: string,
  fileType: string,
  onProgress?: (status: ImportStatus) => void
): Promise<ImportStatus> {
  try {
    const response = await fetch(`${SERVER_URL}/bulk-data/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileType }),
    });

    if (!response.ok) {
      throw new Error(`Failed to import bulk data: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Poll for status updates if onProgress provided
    if (onProgress && result.jobId) {
      pollImportStatus(accessToken, result.jobId, onProgress);
    }

    return result;
  } catch (error) {
    console.error('Error importing bulk data:', error);
    throw error;
  }
}

/**
 * Poll import status
 */
async function pollImportStatus(
  accessToken: string,
  jobId: string,
  onProgress: (status: ImportStatus) => void
): Promise<void> {
  const poll = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/bulk-data/status/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const status: ImportStatus = await response.json();
        onProgress(status);

        if (status.status === 'processing') {
          setTimeout(poll, 2000); // Poll every 2 seconds
        }
      }
    } catch (error) {
      console.error('Error polling import status:', error);
    }
  };

  poll();
}

/**
 * Get citation network for a specific case
 */
export async function getCitationNetwork(
  accessToken: string,
  opinionId: number,
  depth: number = 2
): Promise<CitationNetwork> {
  try {
    const response = await fetch(
      `${SERVER_URL}/bulk-data/citations/network?opinionId=${opinionId}&depth=${depth}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get citation network: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting citation network:', error);
    throw error;
  }
}

/**
 * Get citations for a specific opinion
 */
export async function getOpinionCitations(
  accessToken: string,
  opinionId: number,
  type: 'citing' | 'cited'
): Promise<any[]> {
  try {
    const response = await fetch(
      `${SERVER_URL}/bulk-data/citations/${opinionId}?type=${type}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get citations: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting citations:', error);
    throw error;
  }
}

/**
 * Perform semantic search using case law embeddings
 */
export async function semanticSearch(
  accessToken: string,
  query: string,
  filters?: {
    court?: string;
    dateStart?: string;
    dateEnd?: string;
    limit?: number;
  }
): Promise<SemanticSearchResult[]> {
  try {
    const response = await fetch(`${SERVER_URL}/bulk-data/semantic-search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, filters }),
    });

    if (!response.ok) {
      throw new Error(`Semantic search failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error performing semantic search:', error);
    throw error;
  }
}

/**
 * Get embedding for text (for similarity calculations)
 */
export async function getTextEmbedding(
  accessToken: string,
  text: string
): Promise<number[]> {
  try {
    const response = await fetch(`${SERVER_URL}/bulk-data/embed`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get embedding: ${response.statusText}`);
    }

    const result = await response.json();
    return result.embedding;
  } catch (error) {
    console.error('Error getting text embedding:', error);
    throw error;
  }
}

/**
 * Execute advanced analytics query
 */
export async function executeAnalytics(
  accessToken: string,
  query: AnalyticsQuery
): Promise<AnalyticsResult> {
  try {
    const response = await fetch(`${SERVER_URL}/bulk-data/analytics`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error(`Analytics query failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error executing analytics:', error);
    throw error;
  }
}

/**
 * Get offline cache status
 */
export async function getOfflineCacheStatus(accessToken: string): Promise<{
  enabled: boolean;
  lastSync: string;
  cachedOpinions: number;
  cachedDockets: number;
  totalSize: number;
  availableSpace: number;
}> {
  try {
    const response = await fetch(`${SERVER_URL}/bulk-data/offline/status`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get cache status: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting cache status:', error);
    throw error;
  }
}

/**
 * Sync data for offline use
 */
export async function syncOfflineData(
  accessToken: string,
  options: {
    syncOpinions?: boolean;
    syncDockets?: boolean;
    syncCourts?: boolean;
    maxRecords?: number;
  }
): Promise<{
  success: boolean;
  synced: number;
  errors: number;
}> {
  try {
    const response = await fetch(`${SERVER_URL}/bulk-data/offline/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync offline data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error syncing offline data:', error);
    throw error;
  }
}

/**
 * Clear offline cache
 */
export async function clearOfflineCache(accessToken: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${SERVER_URL}/bulk-data/offline/clear`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to clear cache: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw error;
  }
}

/**
 * Search offline cached data
 */
export async function searchOffline(
  accessToken: string,
  query: string,
  filters?: any
): Promise<any[]> {
  try {
    const response = await fetch(`${SERVER_URL}/bulk-data/offline/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, filters }),
    });

    if (!response.ok) {
      throw new Error(`Offline search failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching offline:', error);
    throw error;
  }
}

/**
 * Get CPS-specific analytics
 */
export async function getCPSAnalytics(
  accessToken: string,
  state?: string
): Promise<{
  violationPatterns: any[];
  courtTrends: any[];
  successRates: any[];
  commonIssues: any[];
  timelineStats: any;
}> {
  try {
    const params = state ? `?state=${state}` : '';
    const response = await fetch(`${SERVER_URL}/bulk-data/analytics/cps${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get CPS analytics: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting CPS analytics:', error);
    throw error;
  }
}

/**
 * Batch download multiple files
 */
export async function batchDownloadBulkData(
  accessToken: string,
  fileTypes: string[]
): Promise<{ jobId: string; status: string }> {
  try {
    const response = await fetch(`${SERVER_URL}/bulk-data/batch-import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileTypes }),
    });

    if (!response.ok) {
      throw new Error(`Batch download failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error batch downloading:', error);
    throw error;
  }
}
