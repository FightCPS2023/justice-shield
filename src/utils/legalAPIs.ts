// ═══════════════════════════════════════════════════════════════════
// LEGAL RESEARCH APIs - FREE & RELIABLE SOURCES
// Access to millions of cases, statutes, regulations, and legislation
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// API CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export const LEGAL_API_CONFIG = {
  // CourtListener - Massive case law database (Free Law Project)
  courtListener: {
    name: 'CourtListener REST API',
    provider: 'Free Law Project',
    baseURL: 'https://www.courtlistener.com/api/rest/v3',
    docs: 'https://www.courtlistener.com/api/rest-info/',
    signupURL: 'https://www.courtlistener.com/sign-up/',
    requiresAuth: true,
    authType: 'Token',
    coverage: 'Millions of federal and state opinions, oral arguments, dockets',
    cost: 'Free tier available, advanced features paid',
    rateLimit: 'Free: 5,000 calls/hour'
  },

  // Caselaw Access Project - ALL published US case law
  caselawAccessProject: {
    name: 'Caselaw Access Project',
    provider: 'Harvard Law School Library Innovation Lab',
    baseURL: 'https://api.case.law/v1',
    bulkDataURL: 'https://case.law/bulk/download/',
    docs: 'https://case.law/api/',
    requiresAuth: false,
    authType: 'No authentication required for bulk data',
    coverage: 'All published US case law from 1658 to present (40+ million cases)',
    cost: 'Completely FREE with no restrictions',
    rateLimit: 'No strict limits on bulk downloads'
  },

  // Regulations.gov - Federal regulations and dockets
  regulationsDotGov: {
    name: 'Regulations.gov API',
    provider: 'eRulemaking Program Management Office',
    baseURL: 'https://api.regulations.gov/v4',
    docs: 'https://open.gsa.gov/api/regulationsgov/',
    signupURL: 'https://api.data.gov/signup/',
    requiresAuth: true,
    authType: 'API Key',
    coverage: 'Federal regulations, dockets, comments, supporting documents',
    cost: 'FREE with API key',
    rateLimit: '1,000 requests/hour per IP'
  },

  // Congress.gov - Bills and legislation tracking
  congressDotGov: {
    name: 'Congress.gov API',
    provider: 'Library of Congress',
    baseURL: 'https://api.congress.gov/v3',
    docs: 'https://github.com/LibraryOfCongress/api.congress.gov',
    requiresAuth: true,
    authType: 'API Key',
    coverage: 'Bills, amendments, summaries, legislative actions, congressional records',
    cost: 'FREE with API key from api.data.gov',
    rateLimit: '5,000 requests/hour',
    signupURL: 'https://api.data.gov/signup/'
  },

  // GovInfo - US Code and federal publications
  govInfo: {
    name: 'GovInfo API',
    provider: 'Government Publishing Office',
    baseURL: 'https://api.govinfo.gov',
    docs: 'https://api.govinfo.gov/docs/',
    signupURL: 'https://api.data.gov/signup/',
    requiresAuth: true,
    authType: 'API Key',
    coverage: 'US Code, Federal Register, Congressional Record, CFR, Supreme Court decisions',
    cost: 'FREE with API key',
    rateLimit: '1,000 requests/hour'
  },

  // LegiScan - State legislation
  legiScan: {
    name: 'LegiScan API',
    provider: 'LegiScan',
    baseURL: 'https://api.legiscan.com',
    docs: 'https://legiscan.com/legiscan',
    signupURL: 'https://legiscan.com/user/register',
    requiresAuth: true,
    authType: 'API Key',
    coverage: 'State legislation + Congress for all 50 states (bills, status, texts)',
    cost: 'FREE tier available (limited), paid for advanced',
    rateLimit: 'Free: 30,000 requests/month'
  },

  // OpenLaws - Statutes and regulations
  openLaws: {
    name: 'OpenLaws API',
    provider: 'OpenLaws',
    baseURL: 'https://api.openlaws.us/v1',
    docs: 'https://openlaws.us/api',
    signupURL: 'https://openlaws.us/signup',
    requiresAuth: true,
    authType: 'API Key',
    coverage: 'Statutes, regulations, case law across federal and all 50 states',
    cost: 'FREE with registration',
    rateLimit: 'Varies by endpoint'
  }
};

// ═══════════════════════════════════════════════════════════════════
// API KEY STORAGE (In localStorage for now, move to Supabase later)
// ═══════════════════════════════════════════════════════════════════

export const API_KEY_STORAGE = {
  getKey: (apiName: keyof typeof LEGAL_API_CONFIG): string | null => {
    return localStorage.getItem(`legalAPI_${apiName}_key`);
  },

  setKey: (apiName: keyof typeof LEGAL_API_CONFIG, key: string): void => {
    localStorage.setItem(`legalAPI_${apiName}_key`, key);
  },

  removeKey: (apiName: keyof typeof LEGAL_API_CONFIG): void => {
    localStorage.removeItem(`legalAPI_${apiName}_key`);
  },

  hasKey: (apiName: keyof typeof LEGAL_API_CONFIG): boolean => {
    return !!localStorage.getItem(`legalAPI_${apiName}_key`);
  }
};

// ═══════════════════════════════════════════════════════════════════
// COURTLISTENER API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export interface CourtListenerSearchParams {
  query: string;
  court?: string; // e.g., 'ca9', 'scotus'
  caseName?: string;
  citation?: string;
  dateStart?: string; // YYYY-MM-DD
  dateEnd?: string; // YYYY-MM-DD
  order?: 'relevance' | 'dateFiled' | 'dateArgued';
  page?: number;
}

export const searchCourtListener = async (params: CourtListenerSearchParams) => {
  const apiKey = API_KEY_STORAGE.getKey('courtListener');
  if (!apiKey) {
    throw new Error('CourtListener API key required. Sign up at courtlistener.com');
  }

  const queryParams = new URLSearchParams({
    q: params.query,
    ...(params.court && { court: params.court }),
    ...(params.caseName && { case_name: params.caseName }),
    ...(params.citation && { citation: params.citation }),
    ...(params.dateStart && { filed_after: params.dateStart }),
    ...(params.dateEnd && { filed_before: params.dateEnd }),
    ...(params.order && { order_by: params.order }),
    page: (params.page || 1).toString()
  });

  const response = await fetch(
    `${LEGAL_API_CONFIG.courtListener.baseURL}/search/?${queryParams}`,
    {
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`CourtListener API error: ${response.statusText}`);
  }

  return await response.json();
};

export const getOpinionByID = async (opinionId: string) => {
  const apiKey = API_KEY_STORAGE.getKey('courtListener');
  if (!apiKey) {
    throw new Error('CourtListener API key required');
  }

  const response = await fetch(
    `${LEGAL_API_CONFIG.courtListener.baseURL}/opinions/${opinionId}/`,
    {
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`CourtListener API error: ${response.statusText}`);
  }

  return await response.json();
};

// ═══════════════════════════════════════════════════════════════════
// CASELAW ACCESS PROJECT API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export interface CaseSearchParams {
  search?: string;
  jurisdiction?: string; // e.g., 'cal', 'ny', 'us'
  cite?: string;
  name?: string;
  dateStart?: string;
  dateEnd?: string;
  court?: string;
  page?: number;
}

export const searchCaseLaw = async (params: CaseSearchParams) => {
  // No API key required!
  const queryParams = new URLSearchParams({
    ...(params.search && { search: params.search }),
    ...(params.jurisdiction && { jurisdiction: params.jurisdiction }),
    ...(params.cite && { cite: params.cite }),
    ...(params.name && { name_abbreviation: params.name }),
    ...(params.dateStart && { decision_date_min: params.dateStart }),
    ...(params.dateEnd && { decision_date_max: params.dateEnd }),
    ...(params.court && { court: params.court }),
    page: (params.page || 1).toString()
  });

  const response = await fetch(
    `${LEGAL_API_CONFIG.caselawAccessProject.baseURL}/cases/?${queryParams}`
  );

  if (!response.ok) {
    throw new Error(`Caselaw Access Project error: ${response.statusText}`);
  }

  return await response.json();
};

export const getCaseByID = async (caseId: string) => {
  const response = await fetch(
    `${LEGAL_API_CONFIG.caselawAccessProject.baseURL}/cases/${caseId}/`
  );

  if (!response.ok) {
    throw new Error(`Caselaw Access Project error: ${response.statusText}`);
  }

  return await response.json();
};

export const getCaseFullText = async (caseId: string) => {
  const response = await fetch(
    `${LEGAL_API_CONFIG.caselawAccessProject.baseURL}/cases/${caseId}/?full_case=true`
  );

  if (!response.ok) {
    throw new Error(`Caselaw Access Project error: ${response.statusText}`);
  }

  return await response.json();
};

// ═══════════════════════════════════════════════════════════════════
// REGULATIONS.GOV API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export interface RegulationSearchParams {
  keyword?: string;
  agencyId?: string; // e.g., 'HHS', 'EPA'
  documentType?: 'Rule' | 'Proposed Rule' | 'Notice' | 'Supporting Document';
  postedDateStart?: string; // YYYY-MM-DD
  postedDateEnd?: string; // YYYY-MM-DD
  page?: number;
}

export const searchRegulations = async (params: RegulationSearchParams) => {
  const apiKey = API_KEY_STORAGE.getKey('regulationsDotGov');
  if (!apiKey) {
    throw new Error('Regulations.gov API key required. Get free key at api.data.gov');
  }

  const queryParams = new URLSearchParams({
    ...(params.keyword && { filter: params.keyword }),
    ...(params.agencyId && { 'filter[agencyId]': params.agencyId }),
    ...(params.documentType && { 'filter[documentType]': params.documentType }),
    ...(params.postedDateStart && { 'filter[postedDate][ge]': params.postedDateStart }),
    ...(params.postedDateEnd && { 'filter[postedDate][le]': params.postedDateEnd }),
    'page[number]': (params.page || 1).toString(),
    'api_key': apiKey
  });

  const response = await fetch(
    `${LEGAL_API_CONFIG.regulationsDotGov.baseURL}/documents?${queryParams}`
  );

  if (!response.ok) {
    throw new Error(`Regulations.gov API error: ${response.statusText}`);
  }

  return await response.json();
};

// ═══════════════════════════════════════════════════════════════════
// CONGRESS.GOV API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export interface BillSearchParams {
  query?: string;
  congress?: number; // e.g., 118 for 118th Congress
  billType?: 'hr' | 's' | 'hjres' | 'sjres';
  limit?: number;
  offset?: number;
}

export const searchBills = async (params: BillSearchParams) => {
  const apiKey = API_KEY_STORAGE.getKey('congressDotGov');
  if (!apiKey) {
    throw new Error('Congress.gov API key required. Get free key at api.data.gov');
  }

  const congress = params.congress || 118; // Current congress
  const queryParams = new URLSearchParams({
    ...(params.query && { q: params.query }),
    limit: (params.limit || 20).toString(),
    offset: (params.offset || 0).toString(),
    api_key: apiKey
  });

  const billType = params.billType || 'bill';
  const response = await fetch(
    `${LEGAL_API_CONFIG.congressDotGov.baseURL}/${billType}/${congress}?${queryParams}`
  );

  if (!response.ok) {
    throw new Error(`Congress.gov API error: ${response.statusText}`);
  }

  return await response.json();
};

// ═══════════════════════════════════════════════════════════════════
// GOVINFO API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export interface GovInfoSearchParams {
  query?: string;
  collection?: 'BILLS' | 'STATUTE' | 'USCODE' | 'CFR' | 'FR' | 'CREC';
  publishedDateStart?: string; // YYYY-MM-DD
  publishedDateEnd?: string; // YYYY-MM-DD
  pageSize?: number;
  offsetMark?: string;
}

export const searchGovInfo = async (params: GovInfoSearchParams) => {
  const apiKey = API_KEY_STORAGE.getKey('govInfo');
  if (!apiKey) {
    throw new Error('GovInfo API key required. Get free key at api.data.gov');
  }

  const queryParams = new URLSearchParams({
    ...(params.query && { query: params.query }),
    ...(params.collection && { collection: params.collection }),
    ...(params.publishedDateStart && { publishedDate: `range(${params.publishedDateStart},${params.publishedDateEnd || 'NOW'})` }),
    pageSize: (params.pageSize || 25).toString(),
    ...(params.offsetMark && { offsetMark: params.offsetMark }),
    api_key: apiKey
  });

  const response = await fetch(
    `${LEGAL_API_CONFIG.govInfo.baseURL}/search?${queryParams}`
  );

  if (!response.ok) {
    throw new Error(`GovInfo API error: ${response.statusText}`);
  }

  return await response.json();
};

export const getUSCode = async (title: string, section: string) => {
  const apiKey = API_KEY_STORAGE.getKey('govInfo');
  if (!apiKey) {
    throw new Error('GovInfo API key required');
  }

  // Example: Get US Code Title 42 (Public Health and Welfare)
  const response = await fetch(
    `${LEGAL_API_CONFIG.govInfo.baseURL}/published/uscode/${title}/${section}?api_key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`GovInfo API error: ${response.statusText}`);
  }

  return await response.json();
};

// ═══════════════════════════════════════════════════════════════════
// LEGISCAN API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export interface LegiScanSearchParams {
  state?: string; // Two-letter state code
  query?: string;
  year?: number;
  billNumber?: string;
}

export const searchStateLegislation = async (params: LegiScanSearchParams) => {
  const apiKey = API_KEY_STORAGE.getKey('legiScan');
  if (!apiKey) {
    throw new Error('LegiScan API key required. Register at legiscan.com');
  }

  // LegiScan uses a different API format
  const requestData = {
    key: apiKey,
    op: 'search',
    ...(params.state && { state: params.state }),
    ...(params.query && { query: params.query }),
    ...(params.year && { year: params.year })
  };

  const response = await fetch(LEGAL_API_CONFIG.legiScan.baseURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    throw new Error(`LegiScan API error: ${response.statusText}`);
  }

  return await response.json();
};

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export const getAPIStatus = () => {
  return {
    courtListener: API_KEY_STORAGE.hasKey('courtListener'),
    caselawAccessProject: true, // No key required
    regulationsDotGov: API_KEY_STORAGE.hasKey('regulationsDotGov'),
    congressDotGov: API_KEY_STORAGE.hasKey('congressDotGov'),
    govInfo: API_KEY_STORAGE.hasKey('govInfo'),
    legiScan: API_KEY_STORAGE.hasKey('legiScan'),
    openLaws: API_KEY_STORAGE.hasKey('openLaws')
  };
};

export const getSetupInstructions = () => {
  return {
    'courtListener': {
      steps: [
        '1. Go to https://www.courtlistener.com/sign-up/',
        '2. Create a free account',
        '3. Go to your profile settings',
        '4. Generate an API token',
        '5. Copy and paste the token into The CPS Punisher'
      ],
      cost: 'Free tier: 5,000 calls/hour',
      coverage: 'Millions of federal and state court opinions'
    },
    'caselawAccessProject': {
      steps: [
        '1. No API key required!',
        '2. Access 40+ million cases directly',
        '3. Bulk downloads available at case.law/bulk',
        '4. Completely free with no restrictions'
      ],
      cost: 'FREE - No limits',
      coverage: 'ALL published US case law from 1658 to present'
    },
    'regulationsDotGov': {
      steps: [
        '1. Go to https://api.data.gov/signup/',
        '2. Enter your email and click "Signup"',
        '3. Check your email for the API key',
        '4. Copy and paste the key into The CPS Punisher',
        '5. Same key works for Congress.gov and GovInfo!'
      ],
      cost: 'FREE - 1,000 requests/hour',
      coverage: 'Federal regulations, dockets, comments'
    },
    'congressDotGov': {
      steps: [
        '1. Go to https://api.data.gov/signup/',
        '2. Enter your email and click "Signup"',
        '3. Check your email for the API key',
        '4. Copy and paste the key into The CPS Punisher',
        '5. Same key works for Regulations.gov and GovInfo!'
      ],
      cost: 'FREE - 5,000 requests/hour',
      coverage: 'Bills, amendments, legislative actions, congressional records'
    },
    'govInfo': {
      steps: [
        '1. Go to https://api.data.gov/signup/',
        '2. Enter your email and click "Signup"',
        '3. Check your email for the API key',
        '4. Copy and paste the key into The CPS Punisher',
        '5. Same key works for Regulations.gov and Congress.gov!'
      ],
      cost: 'FREE - 1,000 requests/hour',
      coverage: 'US Code, Federal Register, Congressional Record, CFR'
    },
    'legiScan': {
      steps: [
        '1. Go to https://legiscan.com/user/register',
        '2. Create a free account',
        '3. Log in and go to Account Settings',
        '4. Find your API key in the API section',
        '5. Copy and paste the key into The CPS Punisher'
      ],
      cost: 'FREE tier: 30,000 requests/month',
      coverage: 'State legislation for all 50 states + Congress'
    },
    'openLaws': {
      steps: [
        '1. Go to https://openlaws.us/signup',
        '2. Create a free account',
        '3. Verify your email',
        '4. Access API key in your dashboard',
        '5. Copy and paste the key into The CPS Punisher'
      ],
      cost: 'FREE with registration',
      coverage: 'Statutes, regulations, case law (federal + all 50 states)'
    }
  };
};

// ═══════════════════════════════════════════════════════════════════
// CPS-SPECIFIC SEARCH HELPERS
// ═══════════════════════════════════════════════════════════════════

export const searchCPSCaseLaw = async (topic: string, state?: string) => {
  // Search specifically for CPS/family law cases
  const queries = [
    `"child protective services" ${topic}`,
    `"parental rights" ${topic}`,
    `"family law" ${topic}`,
    `"juvenile dependency" ${topic}`
  ];

  const results = await Promise.all(
    queries.map(query => 
      searchCaseLaw({
        search: query,
        jurisdiction: state?.toLowerCase(),
        page: 1
      }).catch(() => null)
    )
  );

  return results.filter(r => r !== null);
};

export const searchFourthAmendmentCases = async () => {
  return await searchCourtListener({
    query: '"Fourth Amendment" "child protective services" OR "social worker" OR "CPS"',
    order: 'relevance'
  });
};

export const searchDueProcessCases = async () => {
  return await searchCourtListener({
    query: '"due process" "parental rights" OR "family integrity"',
    order: 'relevance'
  });
};

export const searchASFACaseLaw = async () => {
  return await searchCaseLaw({
    search: '"Adoption and Safe Families Act" OR "reasonable efforts" OR "42 USC 671"',
    page: 1
  });
};

// Export all
export default {
  LEGAL_API_CONFIG,
  API_KEY_STORAGE,
  searchCourtListener,
  getOpinionByID,
  searchCaseLaw,
  getCaseByID,
  getCaseFullText,
  searchRegulations,
  searchBills,
  searchGovInfo,
  getUSCode,
  searchStateLegislation,
  getAPIStatus,
  getSetupInstructions,
  searchCPSCaseLaw,
  searchFourthAmendmentCases,
  searchDueProcessCases,
  searchASFACaseLaw
};
