import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Search, 
  BookOpen, 
  Scale, 
  FileText, 
  AlertCircle, 
  CheckCircle2,
  Key,
  ExternalLink,
  Download,
  Clock,
  Building2,
  Gavel,
  Shield,
  Sparkles,
  Database
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner@2.0.3";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  LEGAL_API_CONFIG,
  API_KEY_STORAGE,
  getAPIStatus,
  getSetupInstructions,
  searchCaseLaw,
  searchCourtListener,
  searchCPSCaseLaw,
  searchFourthAmendmentCases,
  searchDueProcessCases,
  searchASFACaseLaw
} from "../utils/legalAPIs";

export function LegalResearchHub() {
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [apiKeys, setApiKeys] = useState(getAPIStatus());
  const [showKeySetup, setShowKeySetup] = useState(false);
  const [selectedAPI, setSelectedAPI] = useState<keyof typeof LEGAL_API_CONFIG | ''>('');

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];

  const handleQuickSearch = async (searchType: string) => {
    setIsSearching(true);
    try {
      let results;
      switch (searchType) {
        case 'fourth-amendment':
          results = await searchFourthAmendmentCases();
          toast.success('Found Fourth Amendment CPS cases!');
          break;
        case 'due-process':
          results = await searchDueProcessCases();
          toast.success('Found Due Process parental rights cases!');
          break;
        case 'asfa':
          results = await searchASFACaseLaw();
          toast.success('Found ASFA reasonable efforts cases!');
          break;
        default:
          results = await searchCPSCaseLaw(searchQuery, selectedState);
      }
      setSearchResults(Array.isArray(results) ? results : [results]);
    } catch (error: any) {
      toast.error(error.message || 'Search failed. Check API key setup.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleGeneralSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    try {
      // Try Caselaw Access Project first (no key required)
      const results = await searchCaseLaw({
        search: searchQuery,
        jurisdiction: selectedState ? selectedState.toLowerCase().substring(0, 2) : undefined
      });
      
      setSearchResults(results.results || []);
      toast.success(`Found ${results.count || 0} cases!`);
    } catch (error: any) {
      // Fallback to CourtListener if available
      if (apiKeys.courtListener) {
        try {
          const clResults = await searchCourtListener({
            query: searchQuery,
            court: selectedState ? selectedState.toLowerCase() : undefined
          });
          setSearchResults(clResults.results || []);
          toast.success(`Found ${clResults.count || 0} cases!`);
        } catch (clError: any) {
          toast.error(clError.message || 'Search failed');
        }
      } else {
        toast.error(error.message || 'Search failed. Try adding CourtListener API key for better results.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveAPIKey = (apiName: keyof typeof LEGAL_API_CONFIG, key: string) => {
    API_KEY_STORAGE.setKey(apiName, key);
    setApiKeys(getAPIStatus());
    toast.success(`${LEGAL_API_CONFIG[apiName].name} API key saved!`);
    setShowKeySetup(false);
  };

  const setupInstructions = getSetupInstructions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-600" />
            Legal Research Hub
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Access millions of cases, statutes, regulations, and legislation from trusted sources
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowKeySetup(!showKeySetup)}
          className="gap-2"
        >
          <Key className="w-4 h-4" />
          API Setup
          {Object.values(apiKeys).filter(Boolean).length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {Object.values(apiKeys).filter(Boolean).length}/7
            </Badge>
          )}
        </Button>
      </div>

      {/* API Key Setup Panel */}
      {showKeySetup && (
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-600" />
                API Key Setup
              </h3>
            </div>

            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <strong>Good news!</strong> Caselaw Access Project requires NO API key and gives you access to 40+ million cases for FREE!
                Add other API keys to unlock additional features.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(LEGAL_API_CONFIG).map(([key, config]) => {
                const apiKey = key as keyof typeof LEGAL_API_CONFIG;
                const hasKey = apiKeys[apiKey];
                
                return (
                  <Card key={key} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            {config.name}
                            {hasKey && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {config.coverage}
                          </p>
                        </div>
                      </div>

                      {!config.requiresAuth ? (
                        <Badge variant="secondary" className="text-xs">
                          No API Key Required
                        </Badge>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              type="password"
                              placeholder="Enter API key"
                              className="text-sm"
                              id={`api-key-${key}`}
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                const input = document.getElementById(`api-key-${key}`) as HTMLInputElement;
                                if (input?.value) {
                                  handleSaveAPIKey(apiKey, input.value);
                                }
                              }}
                            >
                              Save
                            </Button>
                          </div>
                          <a
                            href={config.signupURL || config.docs}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-600 hover:underline flex items-center gap-1"
                          >
                            Get free API key <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline">{config.cost}</Badge>
                        {config.rateLimit && (
                          <Badge variant="outline" className="text-xs">
                            {config.rateLimit}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="search">
            <Search className="w-4 h-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="quick">
            <Sparkles className="w-4 h-4 mr-2" />
            Quick Search
          </TabsTrigger>
          <TabsTrigger value="sources">
            <Database className="w-4 h-4 mr-2" />
            Sources
          </TabsTrigger>
          <TabsTrigger value="help">
            <AlertCircle className="w-4 h-4 mr-2" />
            Help
          </TabsTrigger>
        </TabsList>

        {/* General Search */}
        <TabsContent value="search" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="search-query">Search Case Law</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="search-query"
                    placeholder='e.g., "Fourth Amendment" "child protective services"'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGeneralSearch()}
                  />
                  <Button onClick={handleGeneralSearch} disabled={isSearching}>
                    {isSearching ? (
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Search
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="state-filter">Filter by State (Optional)</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="All states" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All States</SelectItem>
                    {states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <BookOpen className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Search Tips:</strong> Use quotes for exact phrases. Search terms like "parental rights," 
                  "reasonable efforts," "Fourth Amendment," or case citations like "455 U.S. 745"
                </AlertDescription>
              </Alert>
            </div>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Search Results ({searchResults.length})</h3>
              <div className="space-y-4">
                {searchResults.slice(0, 10).map((result, index) => (
                  <Card key={index} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">
                        {result.name_abbreviation || result.caseName || result.name || 'Untitled Case'}
                      </h4>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {result.citations && (
                          <Badge variant="outline">{result.citations[0]?.cite || 'No citation'}</Badge>
                        )}
                        {result.court && (
                          <Badge variant="secondary">{result.court.name || result.court}</Badge>
                        )}
                        {result.decision_date && (
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            {result.decision_date}
                          </Badge>
                        )}
                      </div>
                      {result.preview && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {result.preview}
                        </p>
                      )}
                      <div className="flex gap-2">
                        {result.frontend_url && (
                          <a href={result.frontend_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Full Case
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Quick CPS-Specific Searches */}
        <TabsContent value="quick" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">CPS-Specific Legal Research</h3>
                <p className="text-sm text-muted-foreground">
                  One-click searches for the most important CPS case law topics
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleQuickSearch('fourth-amendment')}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold">Fourth Amendment Cases</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Warrantless home entry, illegal searches, CPS investigations
                    </p>
                    <Button variant="outline" className="w-full" disabled={isSearching}>
                      {isSearching ? 'Searching...' : 'Search Fourth Amendment'}
                    </Button>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleQuickSearch('due-process')}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Scale className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold">Due Process Cases</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Parental rights, procedural protections, notice requirements
                    </p>
                    <Button variant="outline" className="w-full" disabled={isSearching}>
                      {isSearching ? 'Searching...' : 'Search Due Process'}
                    </Button>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleQuickSearch('asfa')}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Gavel className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold">ASFA / Reasonable Efforts</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Adoption and Safe Families Act, reasonable efforts requirements
                    </p>
                    <Button variant="outline" className="w-full" disabled={isSearching}>
                      {isSearching ? 'Searching...' : 'Search ASFA Cases'}
                    </Button>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-600" />
                      <h4 className="font-semibold">Custom CPS Search</h4>
                    </div>
                    <Input
                      placeholder="e.g., qualified immunity, hearsay"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mt-2"
                    />
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleQuickSearch('custom')}
                      disabled={isSearching || !searchQuery.trim()}
                    >
                      {isSearching ? 'Searching...' : 'Search CPS Cases'}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </Card>

          {/* Quick Search Results */}
          {searchResults.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Results ({searchResults.length})</h3>
              <div className="space-y-3">
                {searchResults.slice(0, 8).map((result: any, index) => (
                  <Card key={index} className="p-3 hover:bg-muted/50">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {result.name_abbreviation || result.caseName || 'Untitled'}
                        </h4>
                        {result.decision_date && (
                          <p className="text-xs text-muted-foreground">{result.decision_date}</p>
                        )}
                      </div>
                      {result.frontend_url && (
                        <a href={result.frontend_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Data Sources */}
        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(LEGAL_API_CONFIG).map(([key, config]) => {
              const apiKey = key as keyof typeof LEGAL_API_CONFIG;
              const hasKey = apiKeys[apiKey];
              
              return (
                <Card key={key} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Database className="w-5 h-5 text-purple-600" />
                          {config.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          by {config.provider}
                        </p>
                      </div>
                      {hasKey ? (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Connected
                        </Badge>
                      ) : config.requiresAuth ? (
                        <Badge variant="outline">Setup Required</Badge>
                      ) : (
                        <Badge variant="secondary">Ready</Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm">{config.coverage}</p>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">{config.cost}</Badge>
                        {config.rateLimit && (
                          <Badge variant="outline" className="text-xs">{config.rateLimit}</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a href={config.docs} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <FileText className="w-3 h-3 mr-1" />
                          Docs
                        </Button>
                      </a>
                      {config.signupURL && (
                        <a href={config.signupURL} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Sign Up
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Help */}
        <TabsContent value="help" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold">How to Get Started</h3>
              
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  <strong>Start Here:</strong> Caselaw Access Project requires NO setup! You can search 40+ million 
                  cases right now without any API keys. Click the "Search" tab and try it!
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Adding More Sources (Optional):</h4>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li>Click "API Setup" button at the top</li>
                  <li>Choose which services you want to add</li>
                  <li>Click "Get free API key" to sign up (takes 2 minutes)</li>
                  <li>Copy your API key and paste it into The CPS Punisher</li>
                  <li>Click "Save" and start searching!</li>
                </ol>
              </div>

              <Alert variant="default" className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm">
                  <strong>Pro Tip:</strong> Get the api.data.gov key first - it works for 3 services 
                  (Regulations.gov, Congress.gov, and GovInfo)!
                </AlertDescription>
              </Alert>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-sm mb-2">What You Can Search:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>40+ million court opinions (all published US case law)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Federal and state court dockets</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Federal regulations and proposed rules</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Congressional bills and legislative actions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>US Code (all federal statutes)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>State legislation for all 50 states</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Federal Register and CFR</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Supreme Court oral arguments</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Legal Disclaimer */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Legal Research Tool:</strong> This tool helps you find legal materials for educational purposes. 
          Results should be reviewed by a licensed attorney. Always verify citations and check if cases are still good law.
        </AlertDescription>
      </Alert>
    </div>
  );
}
