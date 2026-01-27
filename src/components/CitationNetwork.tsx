import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Network, Search, ArrowRight, ArrowLeft, Scale,
  BookOpen, Crown, Sparkles, ExternalLink, Filter,
  TrendingUp, Link2, FileText, AlertCircle, Info,
  Copy, Download, Share2, Eye, ChevronRight, Target
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface Opinion {
  id: number;
  cluster_id: number;
  case_name: string;
  case_name_full: string;
  court: string;
  date_filed: string;
  absolute_url: string;
}

interface Citation {
  id: number;
  citing_opinion: string;
  cited_opinion: string;
  depth: number;
  citing_opinion_data?: Opinion;
  cited_opinion_data?: Opinion;
}

interface CitationNetworkProps {
  violations?: any;
  caseDetails?: any;
}

export function CitationNetwork({ violations = {}, caseDetails = {} }: CitationNetworkProps) {
  const { isPremium, isAttorney } = useSubscription();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpinionId, setSelectedOpinionId] = useState<number | null>(null);
  const [selectedOpinionName, setSelectedOpinionName] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'authorities' | 'citing'>('authorities');

  // Sample data - would be replaced with actual API calls
  const [authorities, setAuthorities] = useState<Citation[]>([
    {
      id: 1,
      citing_opinion: '/api/rest/v4/opinions/2812209/',
      cited_opinion: '/api/rest/v4/opinions/96405/',
      depth: 3,
      cited_opinion_data: {
        id: 96405,
        cluster_id: 12345,
        case_name: 'Loving v. Virginia',
        case_name_full: 'Loving v. Virginia',
        court: 'Supreme Court',
        date_filed: '1967-06-12',
        absolute_url: '/opinion/96405/loving-v-virginia/'
      }
    },
    {
      id: 2,
      citing_opinion: '/api/rest/v4/opinions/2812209/',
      cited_opinion: '/api/rest/v4/opinions/108713/',
      depth: 5,
      cited_opinion_data: {
        id: 108713,
        cluster_id: 12346,
        case_name: 'United States v. Windsor',
        case_name_full: 'United States v. Windsor',
        court: 'Supreme Court',
        date_filed: '2013-06-26',
        absolute_url: '/opinion/108713/united-states-v-windsor/'
      }
    },
    {
      id: 3,
      citing_opinion: '/api/rest/v4/opinions/2812209/',
      cited_opinion: '/api/rest/v4/opinions/2264443/',
      depth: 2,
      cited_opinion_data: {
        id: 2264443,
        cluster_id: 12347,
        case_name: 'Lawrence v. Texas',
        case_name_full: 'Lawrence v. Texas',
        court: 'Supreme Court',
        date_filed: '2003-06-26',
        absolute_url: '/opinion/2264443/lawrence-v-texas/'
      }
    }
  ]);

  const [citingCases, setCitingCases] = useState<Citation[]>([
    {
      id: 101,
      citing_opinion: '/api/rest/v4/opinions/10008139/',
      cited_opinion: '/api/rest/v4/opinions/2812209/',
      depth: 4,
      citing_opinion_data: {
        id: 10008139,
        cluster_id: 23456,
        case_name: 'Pavan v. Smith',
        case_name_full: 'Pavan v. Smith',
        court: 'Supreme Court',
        date_filed: '2017-06-26',
        absolute_url: '/opinion/10008139/pavan-v-smith/'
      }
    },
    {
      id: 102,
      citing_opinion: '/api/rest/v4/opinions/4576890/',
      cited_opinion: '/api/rest/v4/opinions/2812209/',
      depth: 2,
      citing_opinion_data: {
        id: 4576890,
        cluster_id: 23457,
        case_name: 'Masterpiece Cakeshop v. Colorado',
        case_name_full: 'Masterpiece Cakeshop, Ltd. v. Colorado Civil Rights Commission',
        court: 'Supreme Court',
        date_filed: '2018-06-04',
        absolute_url: '/opinion/4576890/masterpiece-cakeshop-v-colorado/'
      }
    }
  ]);

  // Suggested landmark CPS cases to explore
  const landmarkCases = [
    {
      name: 'Troxel v. Granville',
      citation: '530 U.S. 57 (2000)',
      topic: 'Parental Rights - Fundamental Right',
      description: 'Supreme Court recognized fundamental right of parents to make decisions concerning care, custody, and control of their children.',
      relevance: 'Essential for parental rights violations',
      relevant: true
    },
    {
      name: 'Santosky v. Kramer',
      citation: '455 U.S. 745 (1982)',
      topic: 'Due Process - Burden of Proof',
      description: 'Established clear and convincing evidence standard required for termination of parental rights.',
      relevance: 'Critical for due process violations',
      relevant: violations.dueProcess
    },
    {
      name: 'Stanley v. Illinois',
      citation: '405 U.S. 645 (1972)',
      topic: 'Equal Protection - Unwed Fathers',
      description: 'Unwed fathers entitled to hearing before children are removed.',
      relevance: 'Relevant for procedural violations',
      relevant: violations.noWrittenNotice || violations.noMirandaRights
    },
    {
      name: 'DeShaney v. Winnebago County',
      citation: '489 U.S. 189 (1989)',
      topic: 'State Liability - Failure to Protect',
      description: 'Established limits on state liability for failure to protect children from private harm.',
      relevance: 'Important for understanding CPS liability',
      relevant: true
    },
    {
      name: 'Lassiter v. Department of Social Services',
      citation: '452 U.S. 18 (1981)',
      topic: 'Right to Counsel',
      description: 'Addressed right to counsel in termination proceedings.',
      relevance: 'Critical if denied legal representation',
      relevant: violations.deniedLegalCounsel
    },
    {
      name: 'M.L.B. v. S.L.J.',
      citation: '519 U.S. 102 (1996)',
      topic: 'Access to Courts - Indigent Parents',
      description: 'Indigent parents entitled to free transcripts for termination appeals.',
      relevance: 'Relevant for equal protection claims',
      relevant: violations.fourteenthAmendment
    }
  ];

  const handleSearch = async (caseId: number, caseName: string) => {
    setIsSearching(true);
    setSelectedOpinionId(caseId);
    setSelectedOpinionName(caseName);

    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      toast.success(`Loaded citation network for ${caseName}`);
    }, 1500);
  };

  const handleSearchManual = () => {
    if (!searchQuery) {
      toast.error('Please enter a case name or opinion ID');
      return;
    }

    // Simulate search
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setSelectedOpinionId(2812209);
      setSelectedOpinionName('Obergefell v. Hodges');
      toast.success('Case found! Loading citation network...');
    }, 1000);
  };

  const getDepthColor = (depth: number) => {
    if (depth >= 5) return 'bg-red-100 text-red-800 border-red-200';
    if (depth >= 3) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (depth >= 2) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getDepthLabel = (depth: number) => {
    if (depth >= 5) return 'Heavily Cited';
    if (depth >= 3) return 'Frequently Cited';
    if (depth >= 2) return 'Moderately Cited';
    return 'Cited Once';
  };

  if (!isPremium && !isAttorney) {
    return (
      <Card className="p-8 text-center">
        <Network className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl mb-2">Citation Network - Premium Feature</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Explore the web of legal precedent with interactive citation network analysis. 
          Discover which cases cite your key authorities, trace legal reasoning through time, 
          and identify the most influential precedents for your defense strategy.
        </p>
        <div className="flex gap-3 justify-center">
          <Button size="lg">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium - $19.99/mo
          </Button>
          <Button size="lg" variant="outline">
            <Crown className="w-4 h-4 mr-2" />
            Attorney Suite - $99/mo
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl">Citation Network Analysis</h2>
              <Badge className="bg-purple-600 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                CourtListener Citation Graph
              </Badge>
            </div>
            <p className="text-sm text-purple-800 mb-3">
              Explore the web of legal precedent connecting millions of court opinions. 
              Understand which cases cite your authorities and trace the evolution of legal principles over time.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-purple-700">
                <Link2 className="w-4 h-4" />
                <span>Millions of Citations Analyzed</span>
              </div>
              <div className="flex items-center gap-2 text-purple-700">
                <Target className="w-4 h-4" />
                <span>Powered by Eyecite</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* API Info Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">How Citation Analysis Works</AlertTitle>
        <AlertDescription className="text-blue-800">
          <strong>Authorities (Backward Citations):</strong> Cases that your selected case cites - these are the legal foundations it relies upon.
          <br />
          <strong>Citing Cases (Forward Citations):</strong> Later cases that cite your selected case - shows its ongoing influence.
          <br />
          <strong>Depth:</strong> How many times a case is referenced (higher depth = more important authority).
        </AlertDescription>
      </Alert>

      {/* Search Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-primary" />
          <h3 className="text-lg">Search Citation Network</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter case name or CourtListener opinion ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchManual()}
              className="flex-1"
            />
            <Button onClick={handleSearchManual} disabled={isSearching}>
              {isSearching ? (
                <>
                  <Search className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {selectedOpinionName && (
            <Alert className="bg-green-50 border-green-200">
              <Target className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">Currently Viewing</AlertTitle>
              <AlertDescription className="text-green-800 flex items-center justify-between">
                <span>{selectedOpinionName} (Opinion ID: {selectedOpinionId})</span>
                <Button variant="ghost" size="sm" onClick={() => {
                  setSelectedOpinionId(null);
                  setSelectedOpinionName('');
                }}>
                  Clear
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Landmark CPS Cases */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-primary" />
          <h3 className="text-lg">Landmark CPS & Parental Rights Cases</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Explore citation networks for these foundational cases. Click to view their authorities and citing cases.
        </p>

        <div className="grid gap-3">
          {landmarkCases.map((case_, idx) => (
            <Card 
              key={idx} 
              className={`p-4 transition-all cursor-pointer hover:border-purple-400 ${
                case_.relevant ? 'border-purple-200 bg-purple-50/50' : ''
              }`}
              onClick={() => handleSearch(1000000 + idx, case_.name)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{case_.name}</h4>
                    {case_.relevant && (
                      <Badge className="bg-purple-600 text-white text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Relevant to Your Case
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {case_.citation}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {case_.topic}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{case_.description}</p>
                  <p className="text-xs text-purple-700">{case_.relevance}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Network className="w-4 h-4 mr-2" />
                  View Network
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Citation Network Tabs */}
      {selectedOpinionId && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="authorities" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Authorities ({authorities.length})
              <Info className="w-3 h-3 text-muted-foreground" />
            </TabsTrigger>
            <TabsTrigger value="citing" className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Citing Cases ({citingCases.length})
              <Info className="w-3 h-3 text-muted-foreground" />
            </TabsTrigger>
          </TabsList>

          {/* Authorities Tab */}
          <TabsContent value="authorities" className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900">Authorities (Backward Citations)</AlertTitle>
              <AlertDescription className="text-blue-800">
                These are the cases that <strong>{selectedOpinionName}</strong> cited as legal authority. 
                The "depth" shows how many times each case was referenced (higher = more reliance).
              </AlertDescription>
            </Alert>

            <Card className="p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <strong>{authorities.length}</strong> authorities cited
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              {authorities.map((citation) => (
                <Card key={citation.id} className="p-5 hover:border-primary transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <ArrowLeft className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">
                            {citation.cited_opinion_data?.case_name || 'Unknown Case'}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {citation.cited_opinion_data?.court || 'Unknown Court'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {citation.cited_opinion_data?.date_filed 
                                ? new Date(citation.cited_opinion_data.date_filed).getFullYear()
                                : 'Unknown Date'}
                            </Badge>
                            <Badge className={`text-xs ${getDepthColor(citation.depth)}`}>
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Depth: {citation.depth} - {getDepthLabel(citation.depth)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground ml-8">
                        Opinion ID: {citation.cited_opinion_data?.id || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Network className="w-4 h-4 mr-2" />
                        Explore
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Citing Cases Tab */}
          <TabsContent value="citing" className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">Citing Cases (Forward Citations)</AlertTitle>
              <AlertDescription className="text-green-800">
                These are later cases that cited <strong>{selectedOpinionName}</strong> as authority. 
                This shows the ongoing influence and application of this precedent.
              </AlertDescription>
            </Alert>

            <Card className="p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <strong>{citingCases.length}</strong> cases citing this opinion
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter by Court
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export List
                  </Button>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              {citingCases.map((citation) => (
                <Card key={citation.id} className="p-5 hover:border-primary transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <ArrowRight className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">
                            {citation.citing_opinion_data?.case_name || 'Unknown Case'}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {citation.citing_opinion_data?.court || 'Unknown Court'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {citation.citing_opinion_data?.date_filed 
                                ? new Date(citation.citing_opinion_data.date_filed).getFullYear()
                                : 'Unknown Date'}
                            </Badge>
                            <Badge className={`text-xs ${getDepthColor(citation.depth)}`}>
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Depth: {citation.depth} - {getDepthLabel(citation.depth)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground ml-8">
                        Opinion ID: {citation.citing_opinion_data?.id || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Network className="w-4 h-4 mr-2" />
                        Explore
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Usage Tips */}
      <Card className="p-5 bg-muted/50">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium mb-2">Citation Network Analysis Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>High Depth:</strong> Cases with depth ≥5 are heavily relied upon - these are crucial authorities</li>
              <li>• <strong>Recent Citations:</strong> Look for recent cases citing your authorities to find current applications</li>
              <li>• <strong>Supreme Court:</strong> SCOTUS cases tend to have the most citing cases due to their precedential value</li>
              <li>• <strong>Parallel Citations:</strong> Some cases have multiple citations; not all may be captured in the network</li>
              <li>• <strong>Export Data:</strong> Download citation lists to reference in your legal memoranda or briefs</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
