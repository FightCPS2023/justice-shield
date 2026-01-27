import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Sparkles, Search, Brain, TrendingUp, Target,
  FileText, Scale, Zap, Crown, BookOpen,
  CheckCircle2, AlertCircle, Copy, Download,
  ExternalLink, Filter, BarChart3, Network,
  Lightbulb, Shield, Clock, Award, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Textarea } from './ui/textarea';

interface AILegalResearchProps {
  violations?: any;
  caseDetails?: any;
  userState?: string;
}

export function AILegalResearch({ violations = {}, caseDetails = {}, userState = '' }: AILegalResearchProps) {
  const { isAttorney } = useSubscription();
  const [researchQuery, setResearchQuery] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [researchResults, setResearchResults] = useState<any>(null);

  // Simulated AI research capabilities
  const researchCapabilities = [
    {
      icon: Brain,
      title: 'Natural Language Search',
      description: 'Ask questions in plain English - AI understands context and finds relevant cases',
      example: '"What cases deal with warrantless CPS home entries?"'
    },
    {
      icon: Target,
      title: 'Predictive Case Analysis',
      description: 'AI analyzes your case facts and predicts likely outcomes based on similar cases',
      example: 'Upload case facts → Get probability analysis'
    },
    {
      icon: Network,
      title: 'Citation Relationship Mapping',
      description: 'Visualize how cases cite each other and find the strongest precedents',
      example: 'See which cases are most frequently cited together'
    },
    {
      icon: Lightbulb,
      title: 'Argument Generator',
      description: 'AI drafts legal arguments based on your case facts and relevant precedents',
      example: 'Generate Fourth Amendment violation arguments'
    },
    {
      icon: TrendingUp,
      title: 'Jurisdiction Trends',
      description: 'Track how courts in your jurisdiction rule on specific issues',
      example: 'See success rates for similar motions in your state'
    },
    {
      icon: BarChart3,
      title: 'Judge Analytics',
      description: 'Research judge ruling patterns, tendencies, and case history',
      example: 'Know your judge\'s track record on CPS cases'
    }
  ];

  const sampleResearchResults = {
    query: 'Fourth Amendment violations in warrantless CPS home searches',
    confidence: 94,
    casesFound: 127,
    topCases: [
      {
        name: 'Calabretta v. Floyd',
        citation: '189 F.3d 808 (9th Cir. 1999)',
        relevance: 98,
        keyQuote: 'CPS social workers may not enter a home without a warrant, parental consent, or exigent circumstances.',
        applicationToYourCase: 'Highly relevant if CPS entered your home without warrant or consent',
        citedBy: 234,
        jurisdiction: '9th Circuit'
      },
      {
        name: 'Doe v. Heck',
        citation: '327 F.3d 492 (7th Cir. 2003)',
        relevance: 96,
        keyQuote: 'Strip search of child without warrant or exigent circumstances violates Fourth Amendment.',
        applicationToYourCase: 'Applies if child was examined without proper authorization',
        citedBy: 156,
        jurisdiction: '7th Circuit'
      },
      {
        name: 'Roska ex rel. Roska v. Sneddon',
        citation: '437 F.3d 964 (9th Cir. 2006)',
        relevance: 92,
        keyQuote: 'Warrantless interrogation of child at school requires reasonable suspicion.',
        applicationToYourCase: 'Relevant if child was interviewed at school without proper suspicion',
        citedBy: 98,
        jurisdiction: '9th Circuit'
      }
    ],
    legalTheory: {
      primaryArgument: 'Fourth Amendment Protection Against Unreasonable Searches',
      supportingPoints: [
        'Home is entitled to highest level of Fourth Amendment protection',
        'Warrantless entries require exigent circumstances (imminent danger)',
        'Anonymous tips alone insufficient for warrantless entry',
        'Parents must give knowing and voluntary consent'
      ],
      counterarguments: [
        'State interest in child protection (counter: must still follow Constitution)',
        'Exigent circumstances existed (counter: define specific articulable facts)',
        'Consent was given (counter: prove consent was voluntary and informed)'
      ]
    },
    strategicRecommendations: [
      {
        priority: 'Critical',
        action: 'File Motion to Suppress Evidence',
        reasoning: 'All evidence from illegal entry should be excluded',
        successRate: '73% in similar cases'
      },
      {
        priority: 'High',
        action: 'File 42 U.S.C. § 1983 Civil Rights Claim',
        reasoning: 'Violation of clearly established constitutional rights',
        successRate: '61% in similar cases'
      },
      {
        priority: 'Medium',
        action: 'Request Evidentiary Hearing on Warrantless Entry',
        reasoning: 'Force CPS to justify entry with specific facts',
        successRate: '85% when no exigency exists'
      }
    ],
    jurisdictionSpecific: {
      state: userState || 'California',
      stateCases: 3,
      stateStatutes: ['Cal. Welf. & Inst. Code § 305', 'Cal. Welf. & Inst. Code § 306'],
      stateTrends: 'California courts increasingly skeptical of warrantless CPS entries without clear exigency'
    }
  };

  const handleResearch = async () => {
    if (!researchQuery) {
      toast.error('Please enter a research question');
      return;
    }

    setIsResearching(true);

    // Simulate AI research
    setTimeout(() => {
      setResearchResults(sampleResearchResults);
      setIsResearching(false);
      toast.success('AI research complete! Found 127 relevant cases.');
    }, 3000);
  };

  const handleUseExample = (example: string) => {
    setResearchQuery(example);
    toast.success('Example loaded! Click "Research" to analyze.');
  };

  if (!isAttorney) {
    return (
      <Card className="p-8 text-center">
        <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl mb-2">AI Legal Research - Attorney Suite Only</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Advanced AI-powered legal research with natural language search, predictive case analysis, 
          citation mapping, argument generation, and judge analytics. Professional tools for serious litigation.
        </p>
        <Button size="lg">
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Attorney Suite - $99/mo
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-violet-50 to-fuchsia-50 border-violet-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl">AI Legal Research Engine</h2>
              <Badge className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                Advanced AI
              </Badge>
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                <Crown className="w-3 h-3 mr-1" />
                Attorney Suite
              </Badge>
            </div>
            <p className="text-sm text-violet-800 mb-3">
              Next-generation legal research powered by AI. Natural language search, predictive analytics, 
              citation mapping, and automated argument generation. Research in minutes what used to take hours.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-violet-700">
                <Database className="w-4 h-4" />
                <span>50M+ Court Opinions</span>
              </div>
              <div className="flex items-center gap-2 text-violet-700">
                <Zap className="w-4 h-4" />
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-violet-700">
                <Award className="w-4 h-4" />
                <span>Professional Grade</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Capabilities Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {researchCapabilities.map((capability, idx) => {
          const Icon = capability.icon;
          return (
            <Card key={idx} className="p-5 hover:border-violet-400 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1 text-sm">{capability.title}</h4>
                  <p className="text-xs text-muted-foreground">{capability.description}</p>
                </div>
              </div>
              <div className="bg-muted/50 p-2 rounded text-xs">
                <span className="text-muted-foreground">Example:</span>
                <br />
                {capability.example}
              </div>
            </Card>
          );
        })}
      </div>

      {/* AI Research Interface */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-primary" />
          <h3 className="text-lg">Natural Language Legal Research</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Ask your legal question in plain English. AI will search millions of cases, analyze relevance, 
          and provide specific recommendations for your case.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Research Question</label>
            <Textarea
              placeholder="Example: What are the constitutional standards for CPS to enter my home without a warrant? What cases support my Fourth Amendment defense?"
              value={researchQuery}
              onChange={(e) => setResearchQuery(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleResearch}
              disabled={isResearching}
              className="flex-1"
            >
              {isResearching ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-pulse" />
                  AI Researching... (analyzing 50M+ cases)
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Research with AI
                </>
              )}
            </Button>
            <Button variant="outline" disabled={isResearching}>
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Quick Examples */}
          <div>
            <div className="text-sm font-medium mb-2">Quick Examples:</div>
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleUseExample('What cases deal with warrantless CPS home entries?')}
              >
                Warrantless Entries
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleUseExample('Cases about hearsay evidence in CPS proceedings')}
              >
                Hearsay Evidence
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleUseExample('Due process violations in emergency removal')}
              >
                Due Process
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleUseExample('What is the standard for termination of parental rights?')}
              >
                TPR Standards
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Research Results */}
      {researchResults && (
        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cases" className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Top Cases ({researchResults.topCases.length})
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Legal Theory
            </TabsTrigger>
            <TabsTrigger value="strategy" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Strategic Plan
            </TabsTrigger>
            <TabsTrigger value="jurisdiction" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Your State
            </TabsTrigger>
          </TabsList>

          {/* Cases Tab */}
          <TabsContent value="cases" className="space-y-4">
            <Card className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-green-900 mb-1">
                    AI found <strong>{researchResults.casesFound}</strong> relevant cases
                  </div>
                  <p className="text-xs text-green-700">
                    Showing top 3 most relevant cases with {researchResults.confidence}% confidence match
                  </p>
                </div>
                <Badge className="bg-green-600 text-white">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Research Complete
                </Badge>
              </div>
            </Card>

            {researchResults.topCases.map((case_: any, idx: number) => (
              <Card key={idx} className="p-6 hover:border-primary transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                        #{idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-medium mb-1">{case_.name}</h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">{case_.citation}</Badge>
                          <Badge variant="outline" className="text-xs">{case_.jurisdiction}</Badge>
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {case_.relevance}% Relevance
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Cited by {case_.citedBy} cases
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
                    <div className="text-sm font-medium text-blue-900 mb-1">Key Quote:</div>
                    <p className="text-sm text-blue-800 italic">"{case_.keyQuote}"</p>
                  </div>

                  <div className="bg-purple-50 border-l-4 border-purple-600 p-3 rounded">
                    <div className="text-sm font-medium text-purple-900 mb-1">
                      <Target className="w-4 h-4 inline mr-1" />
                      Application to Your Case:
                    </div>
                    <p className="text-sm text-purple-800">{case_.applicationToYourCase}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Full Opinion
                  </Button>
                  <Button variant="outline" size="sm">
                    <Network className="w-4 h-4 mr-2" />
                    Citation Map
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Citation
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Legal Theory Tab */}
          <TabsContent value="theory" className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900">AI-Generated Legal Theory</AlertTitle>
              <AlertDescription className="text-blue-800">
                Based on analysis of {researchResults.casesFound} cases, here's your recommended legal framework.
              </AlertDescription>
            </Alert>

            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">{researchResults.legalTheory.primaryArgument}</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Supporting Points for Your Argument:
                  </div>
                  <ul className="space-y-2">
                    {researchResults.legalTheory.supportingPoints.map((point: string, idx: number) => (
                      <li key={idx} className="flex gap-3 text-sm">
                        <span className="text-green-600 font-bold">{idx + 1}.</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-600" />
                    Anticipated Counter-Arguments & Responses:
                  </div>
                  <ul className="space-y-2">
                    {researchResults.legalTheory.counterarguments.map((arg: string, idx: number) => (
                      <li key={idx} className="flex gap-3 text-sm">
                        <span className="text-orange-600 font-bold">{idx + 1}.</span>
                        <span>{arg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button className="w-full mt-4">
                <FileText className="w-4 h-4 mr-2" />
                Generate Legal Memorandum
              </Button>
            </Card>
          </TabsContent>

          {/* Strategy Tab */}
          <TabsContent value="strategy" className="space-y-4">
            <Alert className="bg-purple-50 border-purple-200">
              <Target className="h-4 w-4 text-purple-600" />
              <AlertTitle className="text-purple-900">Strategic Action Plan</AlertTitle>
              <AlertDescription className="text-purple-800">
                AI-recommended litigation strategy with success rate predictions based on similar cases.
              </AlertDescription>
            </Alert>

            {researchResults.strategicRecommendations.map((rec: any, idx: number) => (
              <Card key={idx} className="p-5">
                <div className="flex items-start gap-4">
                  <Badge 
                    className={`${
                      rec.priority === 'Critical' ? 'bg-red-600' :
                      rec.priority === 'High' ? 'bg-orange-600' :
                      'bg-blue-600'
                    } text-white`}
                  >
                    {rec.priority}
                  </Badge>
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">{rec.action}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{rec.reasoning}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">{rec.successRate}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Generate This Motion
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Jurisdiction Tab */}
          <TabsContent value="jurisdiction" className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <MapPin className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">{researchResults.jurisdictionSpecific.state}-Specific Analysis</AlertTitle>
              <AlertDescription className="text-green-800">
                Legal research tailored to your jurisdiction's statutes, case law, and trends.
              </AlertDescription>
            </Alert>

            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">State-Specific Resources</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Relevant State Cases:</div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {researchResults.jurisdictionSpecific.stateCases} cases found
                  </Badge>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Applicable State Statutes:</div>
                  <div className="space-y-1">
                    {researchResults.jurisdictionSpecific.stateStatutes.map((statute: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="mr-2">
                        {statute}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded">
                  <div className="text-sm font-medium text-amber-900 mb-1">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Jurisdiction Trend Analysis:
                  </div>
                  <p className="text-sm text-amber-800">{researchResults.jurisdictionSpecific.stateTrends}</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
