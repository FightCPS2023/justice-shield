/**
 * CourtListener API Integration
 * Official API: https://www.courtlistener.com/api/rest/v4/
 * Documentation: https://www.courtlistener.com/help/api/rest/
 */

const COURTLISTENER_API_BASE = 'https://www.courtlistener.com/api/rest/v4';

// Note: CourtListener requires authentication for most endpoints
// Free tier: 5,000 requests/day with API key
// For demo purposes, we'll use public endpoints where possible

export interface CourtListenerSearchParams {
  q?: string; // Search query
  court?: string; // Court ID filter
  case_name?: string; // Case name search
  citation?: string; // Citation lookup
  filed_after?: string; // Date filter (YYYY-MM-DD)
  filed_before?: string; // Date filter (YYYY-MM-DD)
  ordering?: string; // Sort order: -date_filed, relevance
  page?: number;
  page_size?: number; // Results per page (max 100)
  type?: string; // Opinion type filter
}

export interface OpinionResult {
  id: number;
  cluster: string;
  case_name: string;
  case_name_full: string;
  citation: string[];
  court: string;
  court_name: string;
  date_filed: string;
  status: string;
  type: string;
  download_url: string;
  local_path: string;
  plain_text: string;
  html: string;
  html_with_citations: string;
  author_str: string;
  joined_by_str: string;
  per_curiam: boolean;
  absolute_url: string;
}

export interface SearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OpinionResult[];
}

/**
 * Search CourtListener for opinions
 */
export async function searchOpinions(params: CourtListenerSearchParams): Promise<SearchResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    // Use the public search endpoint
    const url = `${COURTLISTENER_API_BASE}/search/?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CourtListener API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching from CourtListener:', error);
    throw error;
  }
}

/**
 * Look up a case by citation
 */
export async function lookupCitation(citation: string): Promise<any> {
  try {
    const response = await fetch(
      `${COURTLISTENER_API_BASE}/citation-lookup/?citation=${encodeURIComponent(citation)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Citation lookup error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error looking up citation:', error);
    throw error;
  }
}

/**
 * Get list of courts
 */
export async function getCourts(): Promise<any[]> {
  try {
    const response = await fetch(`${COURTLISTENER_API_BASE}/courts/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Courts API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching courts:', error);
    return [];
  }
}

/**
 * CPS-specific search queries
 */
export const CPS_SEARCH_QUERIES = {
  fourthAmendment: [
    'child protective services fourth amendment warrantless',
    'CPS home entry without warrant',
    'social worker warrantless search',
    'Calabretta Floyd',
  ],
  fourteenthAmendment: [
    'parental rights due process',
    'child removal due process',
    'Troxel Granville',
    'Santosky Kramer',
  ],
  noReasonableEfforts: [
    'reasonable efforts child welfare',
    'ASFA reasonable efforts',
    'failure to provide services',
  ],
  deniedLegalCounsel: [
    'right to counsel dependency',
    'appointed attorney child welfare',
  ],
  icwa: [
    'Indian Child Welfare Act',
    'ICWA notice',
    'tribal intervention',
  ],
  timelineViolations: [
    'ASFA timeline',
    '15 of 22 months',
    'permanency hearing deadline',
  ],
  falsifiedReports: [
    'CPS fabricated evidence',
    'false report child abuse',
    'social worker liability',
  ],
};

/**
 * Search for CPS-related case law by violation type
 */
export async function searchCPSCaseLaw(violationType: keyof typeof CPS_SEARCH_QUERIES, page: number = 1) {
  const queries = CPS_SEARCH_QUERIES[violationType];
  if (!queries || queries.length === 0) {
    return { count: 0, results: [] };
  }

  // Use the first query for simplicity
  const searchQuery = queries[0];

  return searchOpinions({
    q: searchQuery,
    ordering: '-date_filed',
    page,
    page_size: 20,
  });
}

/**
 * Advanced CPS case search with filters
 */
export async function advancedCPSSearch(params: {
  keywords: string;
  court?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
}) {
  return searchOpinions({
    q: params.keywords,
    court: params.court,
    filed_after: params.startDate,
    filed_before: params.endDate,
    ordering: '-date_filed',
    page: params.page || 1,
    page_size: 20,
  });
}

/**
 * Get opinion details by ID
 */
export async function getOpinionById(id: number): Promise<OpinionResult | null> {
  try {
    const response = await fetch(`${COURTLISTENER_API_BASE}/opinions/${id}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Opinion fetch error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching opinion:', error);
    return null;
  }
}

/**
 * Docket API interfaces
 */
export interface DocketResult {
  id: number;
  case_name: string;
  docket_number: string;
  court_id: string;
  date_filed: string;
  date_last_filing: string;
  cause: string;
  nature_of_suit: string;
  assigned_to_str: string;
  absolute_url: string;
  pacer_case_id: string;
  jurisdiction_type: string;
  date_terminated: string | null;
  blocked: boolean;
}

export interface DocketSearchParams {
  q?: string; // Search query
  case_name?: string; // Case name search
  docket_number?: string; // Docket number
  court?: string; // Court ID
  filed_after?: string; // Date filter
  filed_before?: string; // Date filter
  page?: number;
  page_size?: number;
}

/**
 * Search for dockets
 */
export async function searchDockets(params: DocketSearchParams): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const url = `${COURTLISTENER_API_BASE}/dockets/?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Docket API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching dockets:', error);
    throw error;
  }
}

/**
 * Get docket by ID
 */
export async function getDocketById(id: number): Promise<DocketResult | null> {
  try {
    const response = await fetch(`${COURTLISTENER_API_BASE}/dockets/${id}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Docket fetch error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching docket:', error);
    return null;
  }
}

/**
 * Search CPS-related dockets
 */
export async function searchCPSDockets(keywords: string, court?: string, page: number = 1) {
  return searchDockets({
    q: `child protective services ${keywords}`,
    court,
    page,
    page_size: 20,
  });
}

/**
 * Oral Arguments API interfaces
 */
export interface AudioResult {
  id: number;
  case_name: string;
  case_name_full: string;
  case_name_short: string;
  docket_id: number;
  court_id: string;
  date_argued: string;
  date_created: string;
  date_modified: string;
  sha1: string;
  download_url: string;
  local_path_mp3: string;
  local_path_original_file: string;
  duration: number; // in seconds
  processing_complete: boolean;
  judges: string;
  absolute_url: string;
}

export interface AudioSearchParams {
  q?: string;
  case_name?: string;
  court?: string;
  argued_after?: string;
  argued_before?: string;
  page?: number;
  page_size?: number;
}

/**
 * Search for oral argument recordings
 */
export async function searchAudio(params: AudioSearchParams): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const url = `${COURTLISTENER_API_BASE}/audio/?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Audio API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching audio:', error);
    throw error;
  }
}

/**
 * Get audio recording by ID
 */
export async function getAudioById(id: number): Promise<AudioResult | null> {
  try {
    const response = await fetch(`${COURTLISTENER_API_BASE}/audio/${id}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Audio fetch error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching audio:', error);
    return null;
  }
}

/**
 * Search CPS-related oral arguments
 */
export async function searchCPSOralArguments(keywords: string, court?: string, page: number = 1) {
  return searchAudio({
    q: `child protective services ${keywords}`,
    court,
    page,
    page_size: 20,
  });
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Judges API interfaces
 */
export interface JudgeResult {
  id: number;
  resource_uri: string;
  name_first: string;
  name_middle: string;
  name_last: string;
  name_suffix: string;
  name_full: string;
  date_dob: string | null;
  date_granularity_dob: string;
  date_dod: string | null;
  date_granularity_dod: string;
  dob_city: string;
  dob_state: string;
  dob_state_id: string;
  gender: string;
  race: string[];
  fjc_id: number | null;
  slug: string;
  has_photo: boolean;
  absolute_url: string;
  positions: string[]; // URLs to position objects
  educations: string[]; // URLs to education objects
  political_affiliations: string[];
  aba_ratings: string[];
}

export interface PositionResult {
  id: number;
  position_type: string;
  job_title: string;
  sector: string;
  organization_name: string;
  location_city: string;
  location_state: string;
  court: string;
  court_full_name: string;
  date_nominated: string | null;
  date_elected: string | null;
  date_recess_appointment: string | null;
  date_referred_to_judicial_committee: string | null;
  date_judicial_committee_action: string | null;
  date_hearing: string | null;
  date_confirmation: string | null;
  date_start: string;
  date_granularity_start: string;
  date_termination: string | null;
  date_granularity_termination: string;
  termination_reason: string;
  appointment_title: string;
  appointer: number | null;
  supervisor: number | null;
  predecessor: number | null;
  retention_events: string[];
  how_selected: string;
  nomination_process: string;
  voice_vote: boolean | null;
  votes_yes: number | null;
  votes_no: number | null;
  votes_yes_percent: number | null;
  votes_no_percent: number | null;
}

export interface EducationResult {
  id: number;
  degree_level: string;
  degree_detail: string;
  degree_year: number | null;
  school: {
    id: number;
    name: string;
    is_alias_of: number | null;
  };
}

export interface PoliticalAffiliationResult {
  id: number;
  political_party: string;
  source: string;
  date_start: string | null;
  date_granularity_start: string;
  date_end: string | null;
  date_granularity_end: string;
}

export interface JudgeSearchParams {
  q?: string;
  name_first?: string;
  name_last?: string;
  name_full?: string;
  court?: string;
  appointer?: string;
  selection_method?: string;
  political_affiliation?: string;
  school?: string;
  page?: number;
  page_size?: number;
}

/**
 * Search for judges by name or other criteria
 */
export async function searchJudges(params: JudgeSearchParams): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const url = `${COURTLISTENER_API_BASE}/people/?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Judges API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching judges:', error);
    throw error;
  }
}

/**
 * Get judge by ID
 */
export async function getJudgeById(id: number): Promise<JudgeResult | null> {
  try {
    const response = await fetch(`${COURTLISTENER_API_BASE}/people/${id}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Judge fetch error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching judge:', error);
    return null;
  }
}

/**
 * Get positions held by a judge
 */
export async function getJudgePositions(personId: number): Promise<any> {
  try {
    const response = await fetch(`${COURTLISTENER_API_BASE}/positions/?person=${personId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Positions API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching positions:', error);
    throw error;
  }
}

/**
 * Get educational history for a judge
 */
export async function getJudgeEducation(personId: number): Promise<any> {
  try {
    const response = await fetch(`${COURTLISTENER_API_BASE}/educations/?person=${personId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Education API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching education:', error);
    throw error;
  }
}

/**
 * Get political affiliations for a judge
 */
export async function getJudgePoliticalAffiliations(personId: number): Promise<any> {
  try {
    const response = await fetch(`${COURTLISTENER_API_BASE}/political-affiliations/?person=${personId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Political affiliations API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching political affiliations:', error);
    throw error;
  }
}

/**
 * Search judges by court ID
 */
export async function searchJudgesByCourt(courtId: string, page: number = 1): Promise<any> {
  return searchJudges({
    court: courtId,
    page,
    page_size: 20,
  });
}

/**
 * Format judge name
 */
export function formatJudgeName(judge: JudgeResult): string {
  return judge.name_full || `${judge.name_first} ${judge.name_last}`;
}

/**
 * Get judge photo URL
 */
export function getJudgePhotoUrl(judge: JudgeResult): string | null {
  if (!judge.has_photo) return null;
  return `https://www.courtlistener.com/api/rest/v4/people/${judge.id}/photo/`;
}

/**
 * Format CourtListener opinion result for display
 */
export function formatOpinionResult(opinion: OpinionResult) {
  return {
    id: opinion.id.toString(),
    caseName: opinion.case_name || opinion.case_name_full,
    citation: opinion.citation.join(', ') || 'No citation',
    court: opinion.court_name || opinion.court,
    dateDecided: opinion.date_filed,
    summary: extractSummary(opinion.plain_text || opinion.html),
    url: `https://www.courtlistener.com${opinion.absolute_url}`,
    downloadUrl: opinion.download_url,
    type: opinion.type,
    author: opinion.author_str,
  };
}

/**
 * Extract a summary from opinion text (first 300 characters)
 */
function extractSummary(text: string): string {
  if (!text) return 'No summary available';
  
  // Remove HTML tags if present
  const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (cleanText.length <= 300) return cleanText;
  
  // Find the last complete sentence within 300 chars
  const summary = cleanText.substring(0, 300);
  const lastPeriod = summary.lastIndexOf('.');
  
  if (lastPeriod > 100) {
    return summary.substring(0, lastPeriod + 1);
  }
  
  return summary + '...';
}

/**
 * State-specific court IDs for filtering
 */
export const STATE_COURT_IDS: Record<string, string[]> = {
  California: ['ca', 'cacd', 'cand', 'caed', 'casd', 'ca9'],
  Texas: ['tex', 'txnd', 'txed', 'txsd', 'txwd', 'ca5'],
  NewYork: ['ny', 'nynd', 'nyed', 'nysd', 'nywd', 'ca2'],
  Florida: ['fla', 'flnd', 'flmd', 'flsd', 'ca11'],
  Illinois: ['ill', 'ilnd', 'ilcd', 'ilsd', 'ca7'],
};

/**
 * Get court IDs for a specific state
 */
export function getCourtIdsForState(state: string): string[] {
  return STATE_COURT_IDS[state] || [];
}

/**
 * RECAP Documents API
 * Access to PACER documents uploaded via RECAP extension
 */
export interface RecapDocumentResult {
  id: number;
  docket_entry: number;
  date_created: string;
  date_modified: string;
  date_upload: string;
  document_type: string;
  document_number: string;
  attachment_number: number | null;
  pacer_doc_id: string;
  is_available: boolean;
  sha1: string;
  page_count: number | null;
  file_size: number | null;
  filepath_local: string;
  filepath_ia: string;
  ia_upload_failure_count: number | null;
  thumbnail: string | null;
  thumbnail_status: string;
  plain_text: string;
  ocr_status: string;
  is_free_on_pacer: boolean;
  is_sealed: boolean;
  description: string;
  absolute_url: string;
}

export interface RecapDocumentSearchParams {
  q?: string;
  docket_entry?: number;
  description?: string;
  document_number?: string;
  attachment_number?: number;
  is_available?: boolean;
  page?: number;
  page_size?: number;
}

/**
 * Search RECAP documents
 */
export async function searchRecapDocuments(params: RecapDocumentSearchParams): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const url = `${COURTLISTENER_API_BASE}/recap-documents/?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`RECAP API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching RECAP documents:', error);
    throw error;
  }
}

/**
 * Get RECAP document by ID
 */
export async function getRecapDocumentById(id: number): Promise<RecapDocumentResult | null> {
  try {
    const response = await fetch(`${COURTLISTENER_API_BASE}/recap-documents/${id}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`RECAP document fetch error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching RECAP document:', error);
    return null;
  }
}

/**
 * Parties API
 * Access information about parties involved in cases
 */
export interface PartyResult {
  id: number;
  name: string;
  party_type: string;
  extra_info: string;
  date_terminated: string | null;
  attorneys: number[]; // Attorney IDs
}

export interface PartySearchParams {
  q?: string;
  name?: string;
  party_type?: string;
  docket?: number;
  page?: number;
  page_size?: number;
}

/**
 * Search parties
 */
export async function searchParties(params: PartySearchParams): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const url = `${COURTLISTENER_API_BASE}/parties/?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Parties API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching parties:', error);
    throw error;
  }
}

/**
 * Attorneys API
 * Access information about attorneys involved in cases
 */
export interface AttorneyResult {
  id: number;
  name: string;
  contact_raw: string;
  phone: string;
  fax: string;
  email: string;
  roles: {
    role: string;
    date_action: string | null;
  }[];
}

export interface AttorneySearchParams {
  q?: string;
  name?: string;
  docket?: number;
  page?: number;
  page_size?: number;
}

/**
 * Search attorneys
 */
export async function searchAttorneys(params: AttorneySearchParams): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const url = `${COURTLISTENER_API_BASE}/attorneys/?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Attorneys API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching attorneys:', error);
    throw error;
  }
}

/**
 * Opinion Citations API
 * Track which cases cite which other cases
 */
export interface OpinionsCitedResult {
  id: number;
  citing_opinion: number;
  cited_opinion: number;
  depth: number;
  quoted: boolean;
  treatment: number;
  citation_count: number;
}

export interface OpinionsCitedSearchParams {
  citing_opinion?: number;
  cited_opinion?: number;
  depth?: number;
  page?: number;
  page_size?: number;
}

/**
 * Search opinion citations
 */
export async function searchOpinionsCited(params: OpinionsCitedSearchParams): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const url = `${COURTLISTENER_API_BASE}/opinions-cited/?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Citations API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching citations:', error);
    throw error;
  }
}

/**
 * Get citations for a specific opinion
 */
export async function getOpinionCitations(opinionId: number): Promise<any> {
  return searchOpinionsCited({
    citing_opinion: opinionId,
    page_size: 100,
  });
}

/**
 * Get cases that cite a specific opinion (reverse citations)
 */
export async function getOpinionCitedBy(opinionId: number): Promise<any> {
  return searchOpinionsCited({
    cited_opinion: opinionId,
    page_size: 100,
  });
}

/**
 * Opinion Clusters API
 * A cluster represents a single opinion that may have multiple formats
 */
export interface ClusterResult {
  id: number;
  case_name: string;
  case_name_full: string;
  case_name_short: string;
  slug: string;
  citation_count: number;
  precedential_status: string;
  date_filed: string;
  date_filed_is_approximate: boolean;
  judges: string;
  nature_of_suit: string;
  posture: string;
  syllabus: string;
  headnotes: string;
  summary: string;
  disposition: string;
  history: string;
  other_dates: string;
  cross_reference: string;
  correction: string;
  citation: string[];
  attorneys: string;
  procedural_history: string;
  source: string;
  absolute_url: string;
  docket: number;
  court: string;
  sub_opinions: number[]; // Opinion IDs
  panel: number[]; // Judge IDs
}

/**
 * Get cluster by ID
 */
export async function getClusterById(id: number): Promise<ClusterResult | null> {
  try {
    const response = await fetch(`${COURTLISTENER_API_BASE}/clusters/${id}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Cluster fetch error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching cluster:', error);
    return null;
  }
}

/**
 * CPS-specific RECAP document search
 */
export async function searchCPSRecapDocuments(keywords: string, page: number = 1) {
  return searchRecapDocuments({
    q: `child protective services ${keywords}`,
    is_available: true,
    page,
    page_size: 20,
  });
}

/**
 * Search for CPS attorneys
 */
export async function searchCPSAttorneys(name?: string, page: number = 1) {
  return searchAttorneys({
    q: name ? `${name} child protective services` : 'child protective services',
    page,
    page_size: 20,
  });
}

/**
 * Build citation network for an opinion
 * Returns both citations and reverse citations
 */
export async function buildCitationNetwork(opinionId: number): Promise<{
  citations: any[];
  citedBy: any[];
  totalCitations: number;
  totalCitedBy: number;
}> {
  try {
    const [citationsData, citedByData] = await Promise.all([
      getOpinionCitations(opinionId),
      getOpinionCitedBy(opinionId),
    ]);

    return {
      citations: citationsData.results || [],
      citedBy: citedByData.results || [],
      totalCitations: citationsData.count || 0,
      totalCitedBy: citedByData.count || 0,
    };
  } catch (error) {
    console.error('Error building citation network:', error);
    return {
      citations: [],
      citedBy: [],
      totalCitations: 0,
      totalCitedBy: 0,
    };
  }
}

/**
 * Get full case details including docket, parties, and attorneys
 */
export async function getFullCaseDetails(docketId: number): Promise<{
  docket: DocketResult | null;
  parties: any[];
  attorneys: any[];
}> {
  try {
    const [docket, partiesData, attorneysData] = await Promise.all([
      getDocketById(docketId),
      searchParties({ docket: docketId, page_size: 100 }),
      searchAttorneys({ docket: docketId, page_size: 100 }),
    ]);

    return {
      docket,
      parties: partiesData.results || [],
      attorneys: attorneysData.results || [],
    };
  } catch (error) {
    console.error('Error fetching full case details:', error);
    return {
      docket: null,
      parties: [],
      attorneys: [],
    };
  }
}