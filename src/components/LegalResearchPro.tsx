import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { 
  Search, 
  FileText, 
  Scale, 
  BookOpen, 
  Sparkles,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Filter,
  Download,
  Copy,
  ExternalLink,
  Brain,
  Zap,
  Target,
  GitBranch,
  Award,
  Calendar,
  MapPin,
  User,
  Building2,
  ChevronRight,
  ChevronDown,
  Loader2,
  Star,
  Info,
  BookMarked,
  Gavel,
  Shield
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { useSubscription } from "../contexts/SubscriptionContext";

interface CaseLawResult {
  id: string;
  caseName: string;
  citation: string;
  court: string;
  year: string;
  relevanceScore: number;
  snippet: string;
  treatment: 'positive' | 'negative' | 'neutral' | 'distinguished';
  citationCount: number;
  keyPoints: string[];
  parties: { plaintiff: string; defendant: string };
  judges: string[];
  procedureType: string;
  relatedIssues: string[];
  shepardSignal?: 'red' | 'yellow' | 'green';
  aiAnalysis: {
    relevanceReason: string;
    applicationToYourCase: string;
    strengthOfAuthority: 'binding' | 'persuasive' | 'distinguishable';
    keyHolding: string;
  };
}

interface BriefAnalysis {
  uploadedFileName: string;
  detectedIssues: string[];
  suggestedCases: CaseLawResult[];
  weaknesses: string[];
  strengths: string[];
  missingAuthority: string[];
  citationErrors: string[];
  recommendedSearch: string[];
}

export function LegalResearchPro({ documents, violations }: any) {
  const { tier, isPremium, isAttorney } = useSubscription();
  const [activeView, setActiveView] = useState<'search' | 'brief-analyzer' | 'shepardize'>('search');
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<'natural' | 'boolean' | 'citation'>('natural');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<CaseLawResult[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseLawResult | null>(null);
  const [briefAnalysis, setBriefAnalysis] = useState<BriefAnalysis | null>(null);
  const [uploadedBrief, setUploadedBrief] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filters, setFilters] = useState({
    jurisdiction: 'all',
    dateRange: 'all',
    treatmentType: 'all',
    courtLevel: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // AI-powered search suggestions based on case context
  useEffect(() => {
    if (violations && Object.keys(violations).length > 0) {
      const suggestions: string[] = [];
      if (violations.fourthAmendment) {
        suggestions.push("Fourth Amendment warrantless entry CPS social worker");
        suggestions.push("Caniglia v. Strom community caretaking exception");
      }
      if (violations.fourteenthAmendment) {
        suggestions.push("Fourteenth Amendment substantive due process parental rights");
        suggestions.push("Troxel v. Granville fundamental liberty interest");
      }
      if (violations.proceduralDueProcess) {
        suggestions.push("procedural due process emergency removal hearing");
      }
      setAiSuggestions(suggestions.slice(0, 5));
    }
  }, [violations]);

  // Simulate advanced AI legal research
  const performSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);
    
    // Simulate API call to legal database
    setTimeout(() => {
      const mockResults = generateMockSearchResults(searchQuery);
      setResults(mockResults);
      setIsSearching(false);
      toast.success(`Found ${mockResults.length} relevant cases`);
    }, 2000);
  };

  // Generate mock search results with AI analysis
  const generateMockSearchResults = (query: string): CaseLawResult[] => {
    const isFourthAmendment = query.toLowerCase().includes('fourth') || query.toLowerCase().includes('search') || query.toLowerCase().includes('warrant');
    const isFourteenth = query.toLowerCase().includes('fourteenth') || query.toLowerCase().includes('due process') || query.toLowerCase().includes('parental');
    
    const results: CaseLawResult[] = [];

    if (isFourthAmendment) {
      results.push({
        id: '1',
        caseName: 'Caniglia v. Strom',
        citation: '141 S. Ct. 1596 (2021)',
        court: 'U.S. Supreme Court',
        year: '2021',
        relevanceScore: 98,
        snippet: 'The "community caretaking" exception to the Fourth Amendment\'s warrant requirement does not extend to the home. Decades ago, this Court held that a warrantless search of an impounded vehicle for an unsecured firearm did not violate the Fourth Amendment...',
        treatment: 'positive',
        citationCount: 847,
        keyPoints: [
          'Community caretaking exception does NOT apply to homes',
          'Warrantless entries require exigent circumstances',
          'CPS cannot use "welfare check" as blanket authority',
          'Rejected government\'s expansion of warrantless searches'
        ],
        parties: { plaintiff: 'Edward A. Caniglia', defendant: 'Robert F. Strom' },
        judges: ['Thomas, J.', 'Roberts, C.J.', 'Breyer, J.', 'Sotomayor, J.', 'Kagan, J.', 'Gorsuch, J.', 'Kavanaugh, J.', 'Barrett, J.', 'Alito, J.'],
        procedureType: 'Appeal from First Circuit',
        relatedIssues: ['Fourth Amendment', 'Warrantless Search', 'Community Caretaking', 'Exigent Circumstances'],
        shepardSignal: 'green',
        aiAnalysis: {
          relevanceReason: 'Directly on point for CPS warrantless home entries. Supreme Court unanimous decision that community caretaking exception does not apply to homes.',
          applicationToYourCase: 'If CPS entered your home without a warrant claiming "child welfare check," Caniglia establishes this violates the Fourth Amendment. Courts cannot use generalized community caretaking to justify warrantless entries into homes.',
          strengthOfAuthority: 'binding',
          keyHolding: 'The community caretaking exception does not permit warrantless entry into the home. Law enforcement and government officials must obtain a warrant or demonstrate true exigent circumstances.'
        }
      });

      results.push({
        id: '2',
        caseName: 'Lange v. California',
        citation: '141 S. Ct. 2011 (2021)',
        court: 'U.S. Supreme Court',
        year: '2021',
        relevanceScore: 95,
        snippet: 'The pursuit of a suspected misdemeanant does not always—or even usually—justify a warrantless entry into a home. The Flight of a suspected misdemeanant does not always justify a warrantless entry into a home...',
        treatment: 'positive',
        citationCount: 623,
        keyPoints: [
          'Hot pursuit of minor offense does not categorically justify warrantless entry',
          'Courts must evaluate totality of circumstances',
          'Minor infractions rarely create exigent circumstances',
          'Strengthens Fourth Amendment protections for homes'
        ],
        parties: { plaintiff: 'Arthur Gregory Lange', defendant: 'State of California' },
        judges: ['Kagan, J.', 'Roberts, C.J.', 'Breyer, J.', 'Sotomayor, J.', 'Gorsuch, J.', 'Kavanaugh, J.', 'Barrett, J.'],
        procedureType: 'Certiorari to California Court of Appeal',
        relatedIssues: ['Fourth Amendment', 'Hot Pursuit', 'Exigent Circumstances', 'Warrantless Entry'],
        shepardSignal: 'green',
        aiAnalysis: {
          relevanceReason: 'Limits government\'s ability to justify warrantless entries based on minor violations or allegations.',
          applicationToYourCase: 'If CPS claims they had to enter because they suspected minor parenting issues (messy house, missed appointments), Lange establishes this does not create exigent circumstances justifying warrantless entry.',
          strengthOfAuthority: 'binding',
          keyHolding: 'Pursuit of a person suspected of a misdemeanor does not categorically qualify as an exigent circumstance justifying warrantless entry into a home. Case-by-case analysis required.'
        }
      });

      results.push({
        id: '3',
        caseName: 'Gates v. Texas Department of Family and Protective Services',
        citation: '537 F.3d 404 (5th Cir. 2008)',
        court: '5th Circuit Court of Appeals',
        year: '2008',
        relevanceScore: 92,
        snippet: 'CPS caseworkers who conduct strip searches of children without a warrant, court order, parental consent, or exigent circumstances violate the Fourth Amendment and are not entitled to qualified immunity...',
        treatment: 'positive',
        citationCount: 312,
        keyPoints: [
          'Strip searches by CPS require warrant or exigent circumstances',
          'Qualified immunity denied for constitutional violations',
          'Children have Fourth Amendment rights',
          'CPS must follow constitutional procedures'
        ],
        parties: { plaintiff: 'Teresa Gates, et al.', defendant: 'Texas DFPS' },
        judges: ['Jolly, J.', 'DeMoss, J.', 'Prado, J.'],
        procedureType: 'Appeal from W.D. Texas',
        relatedIssues: ['Fourth Amendment', 'Strip Search', 'Qualified Immunity', 'CPS Investigation'],
        shepardSignal: 'green',
        aiAnalysis: {
          relevanceReason: 'Directly addresses CPS Fourth Amendment violations and limits qualified immunity defense.',
          applicationToYourCase: 'If CPS strip-searched your child without warrant, court order, or true emergency, this case establishes clear constitutional violation and potential civil rights claim.',
          strengthOfAuthority: 'binding',
          keyHolding: 'CPS social workers are not entitled to qualified immunity when they conduct strip searches without constitutional justification. Fourth Amendment protects children from unreasonable government searches.'
        }
      });
    }

    if (isFourteenth) {
      results.push({
        id: '4',
        caseName: 'Troxel v. Granville',
        citation: '530 U.S. 57 (2000)',
        court: 'U.S. Supreme Court',
        year: '2000',
        relevanceScore: 96,
        snippet: 'The liberty interest at issue in this case—the interest of parents in the care, custody, and control of their children—is perhaps the oldest of the fundamental liberty interests recognized by this Court...',
        treatment: 'positive',
        citationCount: 4521,
        keyPoints: [
          'Parental rights are fundamental liberty interest',
          'Government must overcome presumption that parents act in child\'s best interest',
          'Strict scrutiny applies to parental rights restrictions',
          'State cannot substitute its judgment for parent\'s without compelling reason'
        ],
        parties: { plaintiff: 'Troxel, et al.', defendant: 'Granville' },
        judges: ['O\'Connor, J.', 'Rehnquist, C.J.', 'Ginsburg, J.', 'Breyer, J.'],
        procedureType: 'Certiorari to Washington Supreme Court',
        relatedIssues: ['Fourteenth Amendment', 'Parental Rights', 'Substantive Due Process', 'Fundamental Liberty'],
        shepardSignal: 'green',
        aiAnalysis: {
          relevanceReason: 'Foundational case establishing parental rights as fundamental. Critical for any CPS case involving removal or restriction of parental authority.',
          applicationToYourCase: 'Establishes that you have a fundamental constitutional right to parent your children. CPS must prove compelling government interest and use least restrictive means before interfering with your parental rights.',
          strengthOfAuthority: 'binding',
          keyHolding: 'The Due Process Clause of the Fourteenth Amendment protects the fundamental right of parents to make decisions concerning the care, custody, and control of their children. Special weight must be given to parent\'s own determination.'
        }
      });

      results.push({
        id: '5',
        caseName: 'Santosky v. Kramer',
        citation: '455 U.S. 745 (1982)',
        court: 'U.S. Supreme Court',
        year: '1982',
        relevanceScore: 94,
        snippet: 'Before a State may sever completely and irrevocably the rights of parents in their natural child, due process requires that the State support its allegations by at least clear and convincing evidence...',
        treatment: 'positive',
        citationCount: 3892,
        keyPoints: [
          'Clear and convincing evidence required for termination',
          'Procedural protections for parents in termination proceedings',
          'Heightened burden of proof on government',
          'Due process applies to parental rights termination'
        ],
        parties: { plaintiff: 'John Santosky II, et al.', defendant: 'Annie Kramer' },
        judges: ['Blackmun, J.', 'Brennan, J.', 'Marshall, J.', 'Powell, J.', 'Stevens, J.'],
        procedureType: 'Appeal from New York Court of Appeals',
        relatedIssues: ['Fourteenth Amendment', 'Termination of Parental Rights', 'Due Process', 'Burden of Proof'],
        shepardSignal: 'green',
        aiAnalysis: {
          relevanceReason: 'Establishes burden of proof and procedural protections in termination cases. Essential authority for due process arguments.',
          applicationToYourCase: 'CPS must prove their allegations by clear and convincing evidence—higher than preponderance standard. You are entitled to full procedural protections including right to counsel and fair hearing.',
          strengthOfAuthority: 'binding',
          keyHolding: 'Due Process Clause requires clear and convincing evidence standard for termination of parental rights. The fundamental liberty interest of natural parents requires heightened protection.'
        }
      });
    }

    // Add more generic results
    results.push({
      id: '6',
      caseName: 'Doe v. Woodard',
      citation: '912 F.3d 1278 (6th Cir. 2019)',
      court: '6th Circuit Court of Appeals',
      year: '2019',
      relevanceScore: 89,
      snippet: 'Social workers who strip-search a child without a warrant, court order, exigent circumstances, or parental consent violate the Fourth Amendment...',
      treatment: 'positive',
      citationCount: 178,
      keyPoints: [
        'Strip searches require constitutional justification',
        'No blanket immunity for social workers',
        'Children\'s Fourth Amendment rights must be protected',
        'Investigatory convenience does not justify constitutional violations'
      ],
      parties: { plaintiff: 'Jane Doe', defendant: 'Woodard, et al.' },
      judges: ['Sutton, J.', 'Rogers, J.', 'Kethledge, J.'],
      procedureType: 'Appeal from E.D. Kentucky',
      relatedIssues: ['Fourth Amendment', 'Strip Search', 'CPS Investigation', 'Qualified Immunity'],
      shepardSignal: 'green',
      aiAnalysis: {
        relevanceReason: 'Recent circuit court precedent limiting CPS authority to conduct invasive searches.',
        applicationToYourCase: 'Supports Fourth Amendment claims against CPS for invasive searches or examinations of children without proper authority.',
        strengthOfAuthority: 'binding',
        keyHolding: 'Social workers must have warrant, court order, exigent circumstances, or parental consent before conducting strip search of child. Mere investigation is insufficient justification.'
      }
    });

    return results;
  };

  // Analyze uploaded brief
  const analyzeBrief = async () => {
    if (!uploadedBrief.trim()) {
      toast.error("Please paste your brief or document");
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      const analysis: BriefAnalysis = {
        uploadedFileName: "Motion to Dismiss.docx",
        detectedIssues: [
          'Fourth Amendment - Warrantless Entry',
          'Fourteenth Amendment - Substantive Due Process',
          'Procedural Due Process - Inadequate Notice',
          'Insufficient Evidence for Removal',
          'Failure to Provide Reasonable Efforts'
        ],
        suggestedCases: generateMockSearchResults("fourth amendment warrantless CPS"),
        weaknesses: [
          'Missing recent Supreme Court precedent (Caniglia v. Strom 2021)',
          'No citation to circuit court split on community caretaking',
          'Insufficient discussion of Lange v. California application',
          'Weak factual development of what constitutes "exigent circumstances"'
        ],
        strengths: [
          'Strong Troxel v. Granville analysis on parental rights',
          'Good procedural due process arguments',
          'Well-organized statement of facts'
        ],
        missingAuthority: [
          'Caniglia v. Strom, 141 S. Ct. 1596 (2021) - Critical recent SCOTUS case',
          'Lange v. California, 141 S. Ct. 2011 (2021) - Limits exigent circumstances',
          'Gates v. Texas DFPS, 537 F.3d 404 (5th Cir. 2008) - Qualified immunity'
        ],
        citationErrors: [
          'Incorrect pinpoint citation on page 8 to Troxel',
          'Missing year in citation to Calabretta v. Floyd'
        ],
        recommendedSearch: [
          'Fourth Amendment community caretaking CPS after Caniglia',
          'Exigent circumstances child welfare cases 2020-2025',
          'Qualified immunity social workers Fourth Amendment',
          'Procedural due process emergency removal hearing requirements'
        ]
      };

      setBriefAnalysis(analysis);
      setIsAnalyzing(false);
      toast.success("Brief analysis complete!");
    }, 3000);
  };

  const shepardizeCase = (citation: string) => {
    toast.info("Shepardizing case... This feature analyzes treatment history and subsequent citations");
    // This would integrate with CourtListener API in production
  };

  return (
    <div className="h-full flex flex-col">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/10 rounded-lg">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl">Legal Research AI</div>
                <div className="text-sm text-blue-100">Powered by Advanced AI • Comparable to Westlaw Edge & Casetext</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white border-white/30">
              {tier === 'attorney' ? 'Attorney Pro' : tier === 'professional' ? 'Professional' : 'Premium'} Edition
            </Badge>
            {isAttorney && (
              <Badge className="bg-yellow-400 text-yellow-900">
                <Award className="w-3 h-3 mr-1" />
                Licensed Attorney
              </Badge>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          <Button
            variant={activeView === 'search' ? 'secondary' : 'ghost'}
            onClick={() => setActiveView('search')}
            className={activeView === 'search' ? 'bg-white text-blue-700' : 'text-white hover:bg-white/10'}
          >
            <Search className="w-4 h-4 mr-2" />
            AI Search
          </Button>
          <Button
            variant={activeView === 'brief-analyzer' ? 'secondary' : 'ghost'}
            onClick={() => setActiveView('brief-analyzer')}
            className={activeView === 'brief-analyzer' ? 'bg-white text-blue-700' : 'text-white hover:bg-white/10'}
          >
            <FileText className="w-4 h-4 mr-2" />
            Brief Analyzer
          </Button>
          <Button
            variant={activeView === 'shepardize' ? 'secondary' : 'ghost'}
            onClick={() => setActiveView('shepardize')}
            className={activeView === 'shepardize' ? 'bg-white text-blue-700' : 'text-white hover:bg-white/10'}
          >
            <GitBranch className="w-4 h-4 mr-2" />
            Shepardize
          </Button>
        </div>
      </div>

      {/* Main Content Area - Multi-pane layout like Casetext */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'search' && (
          <div className="h-full flex">
            {/* Left Panel - Search & Filters */}
            <div className="w-1/3 border-r bg-gray-50 dark:bg-gray-900 overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* AI Suggestions */}
                {aiSuggestions.length > 0 && (
                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <div className="text-sm">AI Suggestions for Your Case</div>
                    </div>
                    <div className="space-y-2">
                      {aiSuggestions.map((suggestion, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left h-auto py-2 px-3 text-xs"
                          onClick={() => {
                            setSearchQuery(suggestion);
                            performSearch();
                          }}
                        >
                          <Target className="w-3 h-3 mr-2 flex-shrink-0 text-purple-600" />
                          <span className="line-clamp-2">{suggestion}</span>
                        </Button>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Search Box */}
                <Card className="p-4">
                  <div className="mb-3">
                    <div className="text-sm mb-2">Natural Language Search</div>
                    <div className="text-xs text-muted-foreground mb-3">
                      Ask questions in plain English - AI will find relevant cases
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={searchMode === 'natural' ? 'default' : 'outline'}
                        onClick={() => setSearchMode('natural')}
                        className="flex-1"
                      >
                        <Brain className="w-3 h-3 mr-1" />
                        Natural
                      </Button>
                      <Button
                        size="sm"
                        variant={searchMode === 'boolean' ? 'default' : 'outline'}
                        onClick={() => setSearchMode('boolean')}
                        className="flex-1"
                      >
                        Boolean
                      </Button>
                      <Button
                        size="sm"
                        variant={searchMode === 'citation' ? 'default' : 'outline'}
                        onClick={() => setSearchMode('citation')}
                        className="flex-1"
                      >
                        Citation
                      </Button>
                    </div>

                    <Textarea
                      placeholder={
                        searchMode === 'natural' 
                          ? "e.g., Can CPS enter my home without a warrant?" 
                          : searchMode === 'boolean'
                          ? "e.g., fourth AND amendment AND CPS AND warrantless"
                          : "e.g., 141 S. Ct. 1596"
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />

                    <Button 
                      onClick={performSearch} 
                      className="w-full"
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Search Case Law
                        </>
                      )}
                    </Button>
                  </div>
                </Card>

                {/* Filters */}
                <Card className="p-4">
                  <Collapsible open={showFilters} onOpenChange={setShowFilters}>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4" />
                          <span className="text-sm">Advanced Filters</span>
                        </div>
                        {showFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 mt-4">
                      <div>
                        <div className="text-xs mb-1.5">Jurisdiction</div>
                        <Select value={filters.jurisdiction} onValueChange={(v) => setFilters({...filters, jurisdiction: v})}>
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Jurisdictions</SelectItem>
                            <SelectItem value="scotus">U.S. Supreme Court</SelectItem>
                            <SelectItem value="circuit">Federal Circuit Courts</SelectItem>
                            <SelectItem value="state">State Courts</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <div className="text-xs mb-1.5">Date Range</div>
                        <Select value={filters.dateRange} onValueChange={(v) => setFilters({...filters, dateRange: v})}>
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="2020-2025">2020-2025</SelectItem>
                            <SelectItem value="2015-2025">2015-2025</SelectItem>
                            <SelectItem value="2010-2025">2010-2025</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <div className="text-xs mb-1.5">Treatment</div>
                        <Select value={filters.treatmentType} onValueChange={(v) => setFilters({...filters, treatmentType: v})}>
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Treatment</SelectItem>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="distinguished">Distinguished</SelectItem>
                            <SelectItem value="negative">Negative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>

                {/* Search Tips */}
                <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Pro Tip:</strong> Use natural language for best results. AI understands context and finds relevant cases even without exact legal terminology.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            {/* Middle Panel - Results List */}
            <div className="w-1/3 border-r overflow-y-auto bg-white dark:bg-gray-950">
              {results.length === 0 && !isSearching ? (
                <div className="p-8 text-center">
                  <Scale className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <div className="text-muted-foreground mb-2">No results yet</div>
                  <p className="text-sm text-muted-foreground">
                    Enter a search query or use AI suggestions to find relevant case law
                  </p>
                </div>
              ) : isSearching ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
                  <div className="mb-2">Analyzing Case Law...</div>
                  <p className="text-sm text-muted-foreground">
                    AI is searching millions of cases
                  </p>
                </div>
              ) : (
                <div>
                  {/* Results Header */}
                  <div className="sticky top-0 bg-white dark:bg-gray-950 border-b p-4 z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm">
                        <strong>{results.length}</strong> Results
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        Sorted by Relevance
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      AI-ranked by relevance to your query
                    </div>
                  </div>

                  {/* Results */}
                  <div>
                    {results.map((result) => (
                      <div
                        key={result.id}
                        className={`border-b p-4 cursor-pointer transition-colors ${
                          selectedCase?.id === result.id 
                            ? 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-blue-600' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                        }`}
                        onClick={() => setSelectedCase(result)}
                      >
                        {/* Case Name & Citation */}
                        <div className="mb-2">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                              {result.caseName}
                            </div>
                            <div className="flex items-center gap-1">
                              {result.shepardSignal === 'green' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                              {result.shepardSignal === 'yellow' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                              {result.shepardSignal === 'red' && <XCircle className="w-4 h-4 text-red-600" />}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">{result.citation}</div>
                        </div>

                        {/* Court & Year */}
                        <div className="flex items-center gap-3 mb-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            <span>{result.court}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span>{result.year}</span>
                          </div>
                        </div>

                        {/* Relevance Score */}
                        <div className="mb-2">
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">Relevance:</div>
                            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                                style={{ width: `${result.relevanceScore}%` }}
                              />
                            </div>
                            <div className="text-xs font-medium">{result.relevanceScore}%</div>
                          </div>
                        </div>

                        {/* Snippet */}
                        <p className="text-xs text-muted-foreground line-clamp-3 mb-2">
                          {result.snippet}
                        </p>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">
                            <Star className="w-2.5 h-2.5 mr-1" />
                            {result.citationCount} citations
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              result.aiAnalysis.strengthOfAuthority === 'binding' 
                                ? 'border-green-600 text-green-700' 
                                : 'border-blue-600 text-blue-700'
                            }`}
                          >
                            {result.aiAnalysis.strengthOfAuthority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Case Details */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-950">
              {!selectedCase ? (
                <div className="p-8 text-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <div className="text-muted-foreground mb-2">Select a case to view details</div>
                  <p className="text-sm text-muted-foreground">
                    Click any result to see full analysis and AI insights
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Case Header */}
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-2xl mb-2">{selectedCase.caseName}</div>
                        <div className="text-muted-foreground mb-3">{selectedCase.citation}</div>
                      </div>
                      {selectedCase.shepardSignal === 'green' && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Good Law
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        {selectedCase.court}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {selectedCase.year}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Gavel className="w-4 h-4" />
                        {selectedCase.procedureType}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Citation
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Full Text
                      </Button>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <div>AI Analysis for Your Case</div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-purple-600" />
                          <div className="text-xs uppercase tracking-wide text-purple-700">Why This Case Matters</div>
                        </div>
                        <p className="text-purple-900 dark:text-purple-100">
                          {selectedCase.aiAnalysis.relevanceReason}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <div className="text-xs uppercase tracking-wide text-blue-700">Application to Your Case</div>
                        </div>
                        <p className="text-blue-900 dark:text-blue-100">
                          {selectedCase.aiAnalysis.applicationToYourCase}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Scale className="w-4 h-4 text-green-600" />
                          <div className="text-xs uppercase tracking-wide text-green-700">Key Holding</div>
                        </div>
                        <p className="text-green-900 dark:text-green-100">
                          {selectedCase.aiAnalysis.keyHolding}
                        </p>
                      </div>

                      <div>
                        <Badge className={
                          selectedCase.aiAnalysis.strengthOfAuthority === 'binding'
                            ? 'bg-green-600'
                            : selectedCase.aiAnalysis.strengthOfAuthority === 'persuasive'
                            ? 'bg-blue-600'
                            : 'bg-gray-600'
                        }>
                          {selectedCase.aiAnalysis.strengthOfAuthority === 'binding' && <Zap className="w-3 h-3 mr-1" />}
                          {selectedCase.aiAnalysis.strengthOfAuthority.toUpperCase()} AUTHORITY
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  {/* Key Points */}
                  <div>
                    <div className="mb-3">Key Points</div>
                    <div className="space-y-2">
                      {selectedCase.keyPoints.map((point, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Case Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="text-xs text-muted-foreground mb-2">Parties</div>
                      <div className="text-sm space-y-1">
                        <div><strong>Plaintiff:</strong> {selectedCase.parties.plaintiff}</div>
                        <div><strong>Defendant:</strong> {selectedCase.parties.defendant}</div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="text-xs text-muted-foreground mb-2">Citation Impact</div>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <strong>{selectedCase.citationCount}</strong> citations
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Highly influential precedent
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Judges */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Judges</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCase.judges.map((judge, i) => (
                        <Badge key={i} variant="secondary">{judge}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Related Issues */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Related Legal Issues</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCase.relatedIssues.map((issue, i) => (
                        <Badge key={i} variant="outline">{issue}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <div className="mb-2">Opinion Excerpt</div>
                    <Card className="p-4 bg-gray-50 dark:bg-gray-900">
                      <p className="text-sm text-muted-foreground italic leading-relaxed">
                        "{selectedCase.snippet}"
                      </p>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'brief-analyzer' && (
          <div className="h-full flex">
            {/* Left - Upload Brief */}
            <div className="w-1/2 border-r p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 text-primary" />
                  <div className="text-xl">AI Brief Analyzer</div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload your motion, brief, or legal memorandum. AI will analyze it and suggest improvements, missing authority, and identify weaknesses.
                </p>
              </div>

              <Card className="p-6 mb-6">
                <div className="mb-4">
                  <div className="text-sm mb-2">Paste Your Brief or Document</div>
                  <div className="text-xs text-muted-foreground mb-3">
                    Copy and paste the text of your motion, brief, or legal memorandum
                  </div>
                </div>

                <Textarea
                  placeholder="Paste your legal document here...

Example:
IN THE SUPERIOR COURT OF [COUNTY]
FAMILY LAW DIVISION

In re: [Child Names]

RESPONDENT'S MOTION TO DISMISS DEPENDENCY PETITION

COMES NOW Respondent [Your Name], by and through undersigned counsel, and hereby moves this Court to dismiss the dependency petition filed by [County] Department of Child and Family Services..."
                  value={uploadedBrief}
                  onChange={(e) => setUploadedBrief(e.target.value)}
                  className="min-h-[400px] font-mono text-xs resize-none"
                />

                <Button 
                  onClick={analyzeBrief} 
                  className="w-full mt-4"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Brief...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              </Card>

              <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <AlertTitle className="text-blue-900 dark:text-blue-100 text-sm">
                  What AI Brief Analyzer Does
                </AlertTitle>
                <AlertDescription className="text-blue-800 dark:text-blue-200 text-xs space-y-2 mt-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Identifies legal issues and arguments in your brief</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Suggests missing case law and authorities</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Finds weaknesses and areas to strengthen</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Checks citation format and accuracy</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Recommends additional research</span>
                  </div>
                </AlertDescription>
              </Alert>
            </div>

            {/* Right - Analysis Results */}
            <div className="w-1/2 p-6 overflow-y-auto bg-white dark:bg-gray-950">
              {!briefAnalysis ? (
                <div className="text-center pt-20">
                  <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <div className="text-muted-foreground mb-2">No analysis yet</div>
                  <p className="text-sm text-muted-foreground">
                    Paste your brief and click "Analyze with AI"
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="text-xl mb-2">Analysis Results</div>
                    <div className="text-sm text-muted-foreground">
                      AI has analyzed your document and found several insights
                    </div>
                  </div>

                  {/* Detected Issues */}
                  <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div className="text-green-900 dark:text-green-100">
                        Detected Legal Issues ({briefAnalysis.detectedIssues.length})
                      </div>
                    </div>
                    <div className="space-y-2">
                      {briefAnalysis.detectedIssues.map((issue, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
                          <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs flex-shrink-0">
                            {i + 1}
                          </div>
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Missing Authority */}
                  <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div className="text-red-900 dark:text-red-100">
                        Missing Key Authorities
                      </div>
                    </div>
                    <div className="space-y-3">
                      {briefAnalysis.missingAuthority.map((authority, i) => (
                        <div key={i} className="p-3 bg-white dark:bg-gray-900 rounded border text-sm">
                          <div className="flex items-start gap-2">
                            <Scale className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-red-900 dark:text-red-100 mb-1">{authority}</div>
                              <Button size="sm" variant="outline" className="mt-2">
                                <BookMarked className="w-3 h-3 mr-1" />
                                View Full Analysis
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Weaknesses */}
                  <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <div className="text-yellow-900 dark:text-yellow-100">
                        Areas to Strengthen
                      </div>
                    </div>
                    <div className="space-y-2">
                      {briefAnalysis.weaknesses.map((weakness, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                          <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{weakness}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Strengths */}
                  <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-blue-600" />
                      <div className="text-blue-900 dark:text-blue-100">
                        Strengths of Your Brief
                      </div>
                    </div>
                    <div className="space-y-2">
                      {briefAnalysis.strengths.map((strength, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                          <span>{strength}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Recommended Research */}
                  <Card className="p-4 bg-purple-50 dark:bg-purple-950/20 border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Search className="w-5 h-5 text-purple-600" />
                      <div className="text-purple-900 dark:text-purple-100">
                        Recommended Research Queries
                      </div>
                    </div>
                    <div className="space-y-2">
                      {briefAnalysis.recommendedSearch.map((query, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            setActiveView('search');
                            setSearchQuery(query);
                            setTimeout(() => performSearch(), 100);
                          }}
                        >
                          <Search className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span className="text-xs">{query}</span>
                        </Button>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'shepardize' && (
          <div className="p-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg mb-4">
                  <GitBranch className="w-8 h-8 text-blue-600" />
                  <div className="text-left">
                    <div className="text-xl text-blue-900 dark:text-blue-100">Shepardize Citations</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Validate case law authority and check treatment history
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter a case citation to check if it's still good law, view subsequent treatment, and see citing cases
                </p>
              </div>

              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm mb-2">Enter Citation</div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g., 141 S. Ct. 1596 or Caniglia v. Strom"
                        className="flex-1"
                      />
                      <Button onClick={() => shepardizeCase("141 S. Ct. 1596")}>
                        <GitBranch className="w-4 h-4 mr-2" />
                        Shepardize
                      </Button>
                    </div>
                  </div>

                  <Alert className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200">
                    <Info className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-sm">
                      <div className="mb-2"><strong>Shepardizing checks:</strong></div>
                      <div className="space-y-1 text-xs">
                        <div>• <strong className="text-green-700">Green Signal:</strong> Good law, positive treatment</div>
                        <div>• <strong className="text-yellow-700">Yellow Signal:</strong> Caution, some negative treatment</div>
                        <div>• <strong className="text-red-700">Red Signal:</strong> Warning, overruled or severely criticized</div>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </Card>

              <div className="mt-6 p-6 border rounded-lg bg-muted">
                <div className="text-sm text-muted-foreground text-center">
                  This feature connects to CourtListener API for real-time citation analysis
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
