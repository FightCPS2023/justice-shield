import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const bulkDataApp = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// CourtListener S3 bucket
const BULK_DATA_BUCKET = 'com-courtlistener-storage';
const BULK_DATA_BASE_URL = `https://${BULK_DATA_BUCKET}.s3.amazonaws.com`;

// Middleware to verify authentication
const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  const accessToken = authHeader?.split(' ')[1];

  if (!accessToken) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    console.error('Auth verification error:', error);
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }

  c.set('userId', user.id);
  await next();
};

/**
 * List available bulk data files
 */
bulkDataApp.get('/list', requireAuth, async (c) => {
  try {
    // Return metadata about available bulk data files
    // In production, this would query S3 or maintain a manifest
    const files = [
      {
        name: 'courts.csv',
        type: 'courts',
        size: 500000, // ~500KB
        lastModified: '2024-11-01T00:00:00Z',
        url: `${BULK_DATA_BASE_URL}/courts-2024-11-01.csv.bz2`,
        description: 'Court metadata for all US federal and state courts',
      },
      {
        name: 'dockets.csv',
        type: 'dockets',
        size: 50000000000, // ~50GB
        lastModified: '2024-11-01T00:00:00Z',
        url: `${BULK_DATA_BASE_URL}/dockets-2024-11-01.csv.bz2`,
        description: 'Case docket information and metadata',
      },
      {
        name: 'opinions.csv',
        type: 'opinions',
        size: 100000000000, // ~100GB
        lastModified: '2024-11-01T00:00:00Z',
        url: `${BULK_DATA_BASE_URL}/opinions-2024-11-01.csv.bz2`,
        description: 'Full text of court opinions and decisions',
      },
      {
        name: 'clusters.csv',
        type: 'clusters',
        size: 10000000000, // ~10GB
        lastModified: '2024-11-01T00:00:00Z',
        url: `${BULK_DATA_BASE_URL}/clusters-2024-11-01.csv.bz2`,
        description: 'Opinion cluster groupings (majority, dissent, concurrence)',
      },
      {
        name: 'citations.csv',
        type: 'citations',
        size: 5000000000, // ~5GB
        lastModified: '2024-11-01T00:00:00Z',
        url: `${BULK_DATA_BASE_URL}/citations-2024-11-01.csv.bz2`,
        description: 'Citation mapping between opinions',
      },
      {
        name: 'judges.csv',
        type: 'judges',
        size: 10000000, // ~10MB
        lastModified: '2024-11-01T00:00:00Z',
        url: `${BULK_DATA_BASE_URL}/people-2024-11-01.csv.bz2`,
        description: 'Judge biographical and career data',
      },
      {
        name: 'audio.csv',
        type: 'audio',
        size: 1000000, // ~1MB
        lastModified: '2024-11-01T00:00:00Z',
        url: `${BULK_DATA_BASE_URL}/audio-2024-11-01.csv.bz2`,
        description: 'Oral argument audio recording metadata',
      },
      {
        name: 'schema.sql',
        type: 'schema',
        size: 100000, // ~100KB
        lastModified: '2024-11-01T00:00:00Z',
        url: `${BULK_DATA_BASE_URL}/schema-2024-11-01.sql`,
        description: 'PostgreSQL database schema for all tables',
      },
    ];

    return c.json(files);
  } catch (error: any) {
    console.error('Error listing bulk data files:', error);
    return c.json({ error: error.message || 'Failed to list files' }, 500);
  }
});

/**
 * Import bulk data file
 */
bulkDataApp.post('/import', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { fileType } = await c.req.json();

    // Create import job
    const jobId = crypto.randomUUID();
    
    await kv.set(`bulk_import:${jobId}`, {
      userId,
      fileType,
      status: 'pending',
      total: 0,
      processed: 0,
      errors: 0,
      startTime: new Date().toISOString(),
    });

    // In production, this would trigger a background job
    // For now, we'll simulate async processing
    processImport(jobId, fileType, userId);

    return c.json({
      jobId,
      status: 'pending',
      message: 'Import job started',
    });
  } catch (error: any) {
    console.error('Error starting import:', error);
    return c.json({ error: error.message || 'Failed to start import' }, 500);
  }
});

/**
 * Get import status
 */
bulkDataApp.get('/status/:jobId', requireAuth, async (c) => {
  try {
    const jobId = c.params.jobId;
    const status = await kv.get(`bulk_import:${jobId}`);

    if (!status) {
      return c.json({ error: 'Import job not found' }, 404);
    }

    return c.json(status);
  } catch (error: any) {
    console.error('Error getting import status:', error);
    return c.json({ error: error.message || 'Failed to get status' }, 500);
  }
});

/**
 * Get citation network for an opinion
 */
bulkDataApp.get('/citations/network', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const opinionId = parseInt(c.req.query('opinionId') || '0');
    const depth = parseInt(c.req.query('depth') || '2');

    // Check if we have citation data cached
    const cacheKey = `citation_network:${opinionId}:${depth}`;
    let network = await kv.get(cacheKey);

    if (!network) {
      // Generate citation network
      network = await generateCitationNetwork(opinionId, depth);
      
      // Cache for 24 hours
      await kv.set(cacheKey, network);
    }

    return c.json(network);
  } catch (error: any) {
    console.error('Error getting citation network:', error);
    return c.json({ error: error.message || 'Failed to get citation network' }, 500);
  }
});

/**
 * Semantic search using embeddings
 */
bulkDataApp.post('/semantic-search', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { query, filters } = await c.req.json();

    // In production, this would use actual embeddings
    // For now, return mock data
    const results = await performSemanticSearch(query, filters);

    return c.json(results);
  } catch (error: any) {
    console.error('Error performing semantic search:', error);
    return c.json({ error: error.message || 'Semantic search failed' }, 500);
  }
});

/**
 * Execute analytics query
 */
bulkDataApp.post('/analytics', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const query = await c.req.json();

    const results = await executeAnalyticsQuery(query);

    return c.json(results);
  } catch (error: any) {
    console.error('Error executing analytics:', error);
    return c.json({ error: error.message || 'Analytics query failed' }, 500);
  }
});

/**
 * Get CPS-specific analytics
 */
bulkDataApp.get('/analytics/cps', requireAuth, async (c) => {
  try {
    const state = c.req.query('state');
    
    // Check cache first
    const cacheKey = `cps_analytics:${state || 'all'}`;
    let analytics = await kv.get(cacheKey);

    if (!analytics) {
      analytics = await generateCPSAnalytics(state);
      await kv.set(cacheKey, analytics);
    }

    return c.json(analytics);
  } catch (error: any) {
    console.error('Error getting CPS analytics:', error);
    return c.json({ error: error.message || 'Failed to get analytics' }, 500);
  }
});

/**
 * Get offline cache status
 */
bulkDataApp.get('/offline/status', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const cacheKey = `offline_cache:${userId}`;
    
    const cache = await kv.get(cacheKey) || {
      enabled: false,
      lastSync: null,
      cachedOpinions: 0,
      cachedDockets: 0,
      totalSize: 0,
      availableSpace: 10 * 1024 * 1024 * 1024, // 10GB
    };

    return c.json(cache);
  } catch (error: any) {
    console.error('Error getting cache status:', error);
    return c.json({ error: error.message || 'Failed to get cache status' }, 500);
  }
});

/**
 * Sync data for offline use
 */
bulkDataApp.post('/offline/sync', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const options = await c.req.json();

    // Simulate sync process
    const result = {
      success: true,
      synced: 5000,
      errors: 0,
    };

    // Update cache status
    await kv.set(`offline_cache:${userId}`, {
      enabled: true,
      lastSync: new Date().toISOString(),
      cachedOpinions: 5000,
      cachedDockets: 3000,
      totalSize: 500 * 1024 * 1024, // 500MB
      availableSpace: 10 * 1024 * 1024 * 1024, // 10GB
    });

    return c.json(result);
  } catch (error: any) {
    console.error('Error syncing offline data:', error);
    return c.json({ error: error.message || 'Sync failed' }, 500);
  }
});

/**
 * Clear offline cache
 */
bulkDataApp.delete('/offline/clear', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    
    await kv.del(`offline_cache:${userId}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error clearing cache:', error);
    return c.json({ error: error.message || 'Failed to clear cache' }, 500);
  }
});

/**
 * Search offline cached data
 */
bulkDataApp.post('/offline/search', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { query, filters } = await c.req.json();

    // In production, search local IndexedDB or similar
    const results = await searchOfflineCache(userId, query, filters);

    return c.json(results);
  } catch (error: any) {
    console.error('Error searching offline:', error);
    return c.json({ error: error.message || 'Offline search failed' }, 500);
  }
});

/**
 * Batch import multiple files
 */
bulkDataApp.post('/batch-import', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { fileTypes } = await c.req.json();

    const jobId = crypto.randomUUID();
    
    await kv.set(`bulk_batch_import:${jobId}`, {
      userId,
      fileTypes,
      status: 'pending',
      startTime: new Date().toISOString(),
    });

    return c.json({
      jobId,
      status: 'pending',
    });
  } catch (error: any) {
    console.error('Error starting batch import:', error);
    return c.json({ error: error.message || 'Failed to start batch import' }, 500);
  }
});

// ===== Helper Functions =====

async function processImport(jobId: string, fileType: string, userId: string) {
  try {
    // Simulate import process
    const totalRecords = 10000;
    
    for (let i = 0; i <= totalRecords; i += 100) {
      await kv.set(`bulk_import:${jobId}`, {
        userId,
        fileType,
        status: 'processing',
        total: totalRecords,
        processed: i,
        errors: 0,
        startTime: new Date().toISOString(),
      });
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await kv.set(`bulk_import:${jobId}`, {
      userId,
      fileType,
      status: 'completed',
      total: totalRecords,
      processed: totalRecords,
      errors: 0,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Import processing error:', error);
    await kv.set(`bulk_import:${jobId}`, {
      userId,
      fileType,
      status: 'failed',
      errors: 1,
      errorMessages: [(error as Error).message],
    });
  }
}

async function generateCitationNetwork(opinionId: number, depth: number) {
  // Mock citation network generation
  // In production, query citation database
  return {
    nodes: [
      {
        id: opinionId,
        caseName: 'Root Case v. Example',
        court: 'Supreme Court',
        dateDecided: '2020-01-01',
        citation: '123 U.S. 456',
        inCitations: 5,
        outCitations: 10,
        importance: 0.9,
      },
      // Add more nodes...
    ],
    edges: [
      { source: opinionId, target: opinionId + 1, depth: 1 },
      // Add more edges...
    ],
    rootCase: opinionId,
    depth,
  };
}

async function performSemanticSearch(query: string, filters: any) {
  // Mock semantic search
  // In production, use actual embeddings and vector search
  return [
    {
      opinion_id: 12345,
      case_name: 'Example CPS Case v. State',
      court: '9th Circuit',
      date_filed: '2022-05-15',
      similarity_score: 0.92,
      text_snippet: 'This case involves Fourth Amendment violations in CPS investigations...',
      citation: '987 F.3d 654',
      absolute_url: '/opinion/12345/example-cps-case/',
    },
  ];
}

async function executeAnalyticsQuery(query: any) {
  // Mock analytics query execution
  return {
    query: query.type,
    data: [],
    summary: {
      totalRecords: 0,
      dateRange: { start: '2020-01-01', end: '2024-11-24' },
      insights: ['No data available in demo mode'],
    },
    visualization: {
      type: 'bar',
      config: {},
    },
  };
}

async function generateCPSAnalytics(state?: string) {
  // Mock CPS analytics
  return {
    violationPatterns: [
      { type: 'Fourth Amendment', count: 450, successRate: 65 },
      { type: 'Due Process', count: 380, successRate: 58 },
      { type: 'No Reasonable Efforts', count: 320, successRate: 72 },
      { type: 'False Reports', count: 210, successRate: 55 },
      { type: 'ICWA Violations', count: 180, successRate: 78 },
    ],
    courtTrends: [
      { 
        name: '9th Circuit', 
        totalCases: 1200, 
        successRate: 62, 
        avgDuration: 365,
        trend: 'up',
        date: '2024-01',
        favorableOutcomes: 744,
        unfavorableOutcomes: 456,
      },
    ],
    successRates: [{ rate: 62 }],
    commonIssues: [
      { name: 'Warrantless Home Entry', count: 450, percentage: 35 },
      { name: 'Inadequate Services', count: 380, percentage: 29 },
      { name: 'Timeline Violations', count: 320, percentage: 25 },
      { name: 'Evidence Fabrication', count: 140, percentage: 11 },
    ],
    timelineStats: {
      avgDuration: 365,
      durationBuckets: [
        { range: '0-6 months', favorable: 45, unfavorable: 55 },
        { range: '6-12 months', favorable: 60, unfavorable: 40 },
        { range: '12-18 months', favorable: 70, unfavorable: 30 },
        { range: '18+ months', favorable: 75, unfavorable: 25 },
      ],
    },
  };
}

async function searchOfflineCache(userId: string, query: string, filters: any) {
  // Mock offline search
  return [
    {
      case_name: 'Cached CPS Case v. State',
      court: 'District Court',
      date_filed: '2023-03-20',
      citation: '456 F.Supp.3d 123',
      snippet: 'This cached opinion discusses CPS procedures...',
      absolute_url: '/opinion/67890/cached-case/',
    },
  ];
}

export default bulkDataApp;
