import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Briefcase, Users, FileText, Scale, Gavel, 
  Search, BookOpen, Building2, AlertTriangle,
  FileCheck, Zap, Crown, Shield, ChevronRight,
  FolderOpen, UserPlus, Download, Settings,
  Map, Database, FlaskConical, MessageSquare,
  FileEdit, ClipboardList, Lock, Sparkles,
  CheckCircle2, Copy
} from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AILegalAssistant } from './AILegalAssistant';

interface AttorneyDashboardProps {
  caseDetails: any;
  violations: any;
  documents: any[];
  timelineEvents: any[];
}

export function AttorneyDashboard({ caseDetails, violations, documents, timelineEvents }: AttorneyDashboardProps) {
  const { isAttorney } = useSubscription();
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [activeFeature, setActiveFeature] = useState<string>(''); // Add state for active feature
  const [legalQuestion, setLegalQuestion] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [questionHistory, setQuestionHistory] = useState<Array<{question: string; answer: string; timestamp: string}>>([]);

  if (!isAttorney) {
    return (
      <Card className="p-8 text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl mb-2">Attorney Suite Access Required</h3>
        <p className="text-muted-foreground mb-4">
          This professional litigation toolkit is available exclusively for licensed attorneys.
        </p>
        <Button>
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Attorney Suite - $99/month
        </Button>
      </Card>
    );
  }

  const attorneyFeatures = [
    {
      icon: Users,
      title: 'Multi-Client Management',
      description: 'Unlimited case files with custom folders per client',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      path: 'clients'
    },
    {
      icon: Sparkles,
      title: 'AI Paralegal',
      description: 'Attorney-grade drafting for motions, briefs, and pleadings',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      path: 'ai-paralegal'
    },
    {
      icon: Map,
      title: 'Multi-State Law Comparison',
      description: 'Compare CPS statutes and procedures across jurisdictions',
      color: 'text-green-600',
      bg: 'bg-green-50',
      path: 'law-comparison'
    },
    {
      icon: FlaskConical,
      title: 'Evidence Analysis',
      description: 'AI-powered review of audio, video, documents, and records',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      path: 'evidence'
    },
    {
      icon: ClipboardList,
      title: 'Discovery Toolkit',
      description: 'Auto-generate interrogatories, requests, and responses',
      color: 'text-red-600',
      bg: 'bg-red-50',
      path: 'discovery'
    },
    {
      icon: Scale,
      title: 'Federal Litigation Tools',
      description: '§1983, ADA, RICO, and Habeas petition generators',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      path: 'federal'
    },
    {
      icon: Gavel,
      title: 'Appeal Preparation',
      description: 'Notices, briefs, and appellate toolkit',
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      path: 'appeals'
    },
    {
      icon: BookOpen,
      title: 'Legal Research Assistant',
      description: 'Case law summaries and legal research tools',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      path: 'research'
    },
    {
      icon: MessageSquare,
      title: 'Expert Witness Prep',
      description: 'Question lists and evaluation request generators',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      path: 'expert'
    },
    {
      icon: Database,
      title: 'CPS Manual & Policy Engine',
      description: 'State manuals, regulations, and violation cross-reference',
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      path: 'policy'
    },
    {
      icon: FileCheck,
      title: 'Court-Ready Formatting',
      description: 'Professional exports with TOC, TOA, and signature blocks',
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      path: 'formatting'
    },
    {
      icon: Shield,
      title: 'ADA/IDEA Violation Scanner',
      description: 'Federal compliance analysis with case law citations',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      path: 'ada'
    }
  ];

  // Helper functions to render feature content - MUST be defined before JSX that uses them
  const renderAIParalegal = () => (
    <Card className="p-6">
      <h2 className="text-2xl mb-4">AI Paralegal - Document Generation</h2>
      <p className="text-muted-foreground mb-6">
        Generate professional legal documents using AI. Select a document type from the list to get started.
      </p>
      <div className="text-center text-sm text-muted-foreground">
        Navigate to the "AI Paralegal" tab in the main navigation to access the full document generator.
      </div>
    </Card>
  );

  const renderMultiStateLaw = () => (
    <Card className="p-6">
      <h2 className="text-2xl mb-4">Multi-State Law Comparison</h2>
      <p className="text-muted-foreground mb-6">
        Compare CPS statutes, procedures, and case law across different jurisdictions.
      </p>
      <div className="text-center text-sm text-muted-foreground">
        Navigate to the "Multi-State Law" tab in the main navigation to access the comparison tool.
      </div>
    </Card>
  );

  const renderEvidenceAnalysis = () => (
    <Card className="p-6">
      <h2 className="text-2xl mb-4">Evidence Analysis</h2>
      <p className="text-muted-foreground mb-4">
        AI-powered analysis of audio, video, documents, and records.
      </p>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4 border-2 border-dashed">
            <FlaskConical className="w-8 h-8 text-amber-600 mb-3" />
            <h3 className="mb-2">Audio Analysis</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Transcribe and analyze audio recordings for key statements
            </p>
            <Button size="sm" variant="outline">Upload Audio</Button>
          </Card>
          <Card className="p-4 border-2 border-dashed">
            <FlaskConical className="w-8 h-8 text-amber-600 mb-3" />
            <h3 className="mb-2">Video Analysis</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Extract and analyze video evidence
            </p>
            <Button size="sm" variant="outline">Upload Video</Button>
          </Card>
          <Card className="p-4 border-2 border-dashed">
            <FileText className="w-8 h-8 text-amber-600 mb-3" />
            <h3 className="mb-2">Document OCR</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Extract text from scanned documents
            </p>
            <Button size="sm" variant="outline">Upload Scans</Button>
          </Card>
          <Card className="p-4 border-2 border-dashed">
            <Database className="w-8 h-8 text-amber-600 mb-3" />
            <h3 className="mb-2">Records Analysis</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Analyze medical, school, and therapy records
            </p>
            <Button size="sm" variant="outline">Upload Records</Button>
          </Card>
        </div>
      </div>
    </Card>
  );

  const renderDiscoveryToolkit = () => (
    <Card className="p-6">
      <h2 className="text-2xl mb-4">Discovery Toolkit</h2>
      <p className="text-muted-foreground mb-4">
        Auto-generate discovery requests and responses for your CPS cases.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: 'Interrogatories', desc: 'Generate written questions', icon: FileText },
          { title: 'Requests for Admission', desc: 'Create admission requests', icon: CheckCircle2 },
          { title: 'Requests for Production', desc: 'Document production requests', icon: FolderOpen },
          { title: 'Discovery Responses', desc: 'Draft responses to discovery', icon: FileEdit },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="p-4 hover:border-primary cursor-pointer transition-all">
              <Icon className="w-8 h-8 text-red-600 mb-3" />
              <h3 className="mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
              <Button size="sm">Generate</Button>
            </Card>
          );
        })}
      </div>
    </Card>
  );

  const renderFederalTools = () => (
    <Card className="p-6">
      <h2 className="text-2xl mb-4">Federal Litigation Tools</h2>
      <p className="text-muted-foreground mb-4">
        Generate federal complaints and petitions for civil rights violations.
      </p>
      <div className="space-y-3">
        {[
          { title: '42 U.S.C. § 1983 Complaint', desc: 'Civil rights violation lawsuit', color: 'bg-indigo-50' },
          { title: 'ADA Title II Complaint', desc: 'Disability discrimination claim', color: 'bg-blue-50' },
          { title: 'Section 504 Complaint', desc: 'Rehabilitation Act violation', color: 'bg-purple-50' },
          { title: 'Habeas Corpus Petition', desc: 'Challenge unlawful custody', color: 'bg-pink-50' },
          { title: 'RICO Claim', desc: 'Racketeering claim framework', color: 'bg-red-50' },
          { title: 'Monell Policy Claim', desc: 'Municipal liability claim', color: 'bg-amber-50' },
        ].map((item, idx) => (
          <Card key={idx} className={`p-4 ${item.color} border-2 hover:border-primary cursor-pointer transition-all`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <Button size="sm">Generate</Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );

  const renderAppealsTools = () => (
    <Card className="p-6">
      <h2 className="text-2xl mb-4">Appeal Preparation</h2>
      <p className="text-muted-foreground mb-4">
        Comprehensive appellate toolkit for CPS case appeals.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: 'Notice of Appeal', desc: 'File notice to initiate appeal' },
          { title: 'Appellate Brief', desc: 'Comprehensive appeal brief' },
          { title: 'Assignments of Error', desc: 'List trial court errors' },
          { title: 'Motion to Supplement Record', desc: 'Add missing evidence' },
          { title: 'Petition for Review', desc: 'Higher court review petition' },
          { title: 'Reply Brief', desc: 'Response to appellee brief' },
        ].map((item, idx) => (
          <Card key={idx} className="p-4 hover:border-primary cursor-pointer transition-all">
            <Gavel className="w-8 h-8 text-pink-600 mb-3" />
            <h3 className="mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
            <Button size="sm" variant="outline">Generate</Button>
          </Card>
        ))}
      </div>
    </Card>
  );

  const renderResearchAssistant = () => (
    <Card className="p-6">
      <h2 className="text-2xl mb-4">Legal Research Assistant</h2>
      <div className="mb-6">
        <Input 
          placeholder="Search case law, statutes, or ask a legal research question..." 
          className="mb-3"
          value={legalQuestion}
          onChange={(e) => setLegalQuestion(e.target.value)}
          spellCheck={true}
        />
        <Button className="w-full" onClick={() => {
          if (legalQuestion) {
            setIsAsking(true);
            // Simulate a delay for the answer
            setTimeout(() => {
              const answer = `Answer to: ${legalQuestion}`;
              setQuestionHistory([...questionHistory, {question: legalQuestion, answer, timestamp: new Date().toLocaleString()}]);
              setIsAsking(false);
              setLegalQuestion('');
            }, 1000);
          }
        }}>
          <Search className="w-4 h-4 mr-2" />
          Research
        </Button>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm mb-2">Recent Searches</h3>
        {questionHistory.map((query, idx) => (
          <Card key={idx} className="p-3 hover:bg-muted cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="text-sm">{query.question}</span>
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{query.answer}</p>
            <p className="text-xs text-muted-foreground mt-1">Asked: {query.timestamp}</p>
          </Card>
        ))}
      </div>
    </Card>
  );

  const renderExpertWitnessPrep = () => (
    <Card className="p-6">
      <h2 className="text-2xl mb-4">Expert Witness Preparation</h2>
      <p className="text-muted-foreground mb-4">
        Generate expert witness questions and evaluation requests.
      </p>
      <div className="space-y-4">
        <Card className="p-4 bg-orange-50">
          <h3 className="mb-2">Expert Types</h3>
          <div className="flex flex-wrap gap-2">
            {['Psychologist', 'Medical', 'Educational', 'Forensic', 'Social Work'].map(type => (
              <Badge key={type} variant="outline">{type}</Badge>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="mb-3">Generate Expert Materials</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Expert Witness Questions
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileEdit className="w-4 h-4 mr-2" />
              Evaluation Request Letter
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ClipboardList className="w-4 h-4 mr-2" />
              Deposition Outline
            </Button>
          </div>
        </Card>
      </div>
    </Card>
  );

  const renderCourtFormatting = () => (
    <Card className="p-6">
      <h2 className="text-2xl mb-4">Court-Ready Formatting</h2>
      <p className="text-muted-foreground mb-4">
        Professional document formatting with TOC, TOA, and signature blocks.
      </p>
      <div className="space-y-4">
        <Alert>
          <FileCheck className="h-4 w-4" />
          <AlertTitle>Professional Formatting</AlertTitle>
          <AlertDescription>
            All generated documents include proper court formatting, headers, footers, 
            table of contents, table of authorities, and signature blocks.
          </AlertDescription>
        </Alert>
        <div className="grid md:grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-sm">Table of Contents</div>
          </Card>
          <Card className="p-4 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-sm">Table of Authorities</div>
          </Card>
          <Card className="p-4 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-sm">Signature Blocks</div>
          </Card>
        </div>
      </div>
    </Card>
  );

  const renderADAScanner = () => (
    <Card className="p-6">
      <h2 className="text-2xl mb-4">ADA/IDEA Violation Scanner</h2>
      <p className="text-muted-foreground mb-4">
        Scan for federal disability law violations with case law citations.
      </p>
      <Alert className="mb-4 bg-emerald-50 border-emerald-200">
        <Shield className="h-4 w-4 text-emerald-600" />
        <AlertTitle className="text-emerald-900">Federal Compliance Analysis</AlertTitle>
        <AlertDescription className="text-emerald-800">
          Analyzes cases for ADA Title II and IDEA violations including reasonable accommodations,
          discriminatory treatment, and free appropriate public education (FAPE) denials.
        </AlertDescription>
      </Alert>
      <div className="space-y-3">
        <Button className="w-full justify-start" variant="outline">
          <Shield className="w-4 h-4 mr-2" />
          Scan for ADA Violations
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <BookOpen className="w-4 h-4 mr-2" />
          IDEA/FAPE Analysis
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Generate Accommodation Request
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Scale className="w-4 h-4 mr-2" />
          Generate ADA Complaint
        </Button>
      </div>
    </Card>
  );

  // If a feature is selected, show specific content
  if (activeFeature) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setActiveFeature('')}>
          <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Attorney Dashboard
        </Button>
        
        {/* Render specific feature content */}
        {activeFeature === 'ai-paralegal' && renderAIParalegal()}
        {activeFeature === 'law-comparison' && renderMultiStateLaw()}
        {activeFeature === 'evidence' && renderEvidenceAnalysis()}
        {activeFeature === 'discovery' && renderDiscoveryToolkit()}
        {activeFeature === 'federal' && renderFederalTools()}
        {activeFeature === 'appeals' && renderAppealsTools()}
        {activeFeature === 'research' && renderResearchAssistant()}
        {activeFeature === 'expert' && renderExpertWitnessPrep()}
        {activeFeature === 'formatting' && renderCourtFormatting()}
        {activeFeature === 'ada' && renderADAScanner()}
        {!['ai-paralegal', 'law-comparison', 'evidence', 'discovery', 'federal', 'appeals', 'research', 'expert', 'formatting', 'ada'].includes(activeFeature) && (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground mb-4">This feature is under development</div>
            <p className="text-sm">Coming soon in the next update</p>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Attorney Suite Header */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-700 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl mb-1">Attorney Suite</div>
                <p className="text-sm text-slate-300">
                  Professional Litigation Toolkit for Family Law Practitioners
                </p>
              </div>
            </div>
          </div>
          <Badge className="bg-amber-500 text-white">
            <Crown className="w-3 h-3 mr-1" />
            Professional
          </Badge>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
          <div>
            <div className="text-2xl mb-1">{documents.length}</div>
            <p className="text-xs text-slate-300">Documents Uploaded</p>
          </div>
          <div>
            <div className="text-2xl mb-1">{Object.values(violations).filter(Boolean).length}</div>
            <p className="text-xs text-slate-300">Violations Found</p>
          </div>
          <div>
            <div className="text-2xl mb-1">{timelineEvents.length}</div>
            <p className="text-xs text-slate-300">Timeline Events</p>
          </div>
          <div>
            <div className="text-2xl mb-1">950</div>
            <p className="text-xs text-slate-300">AI Credits Left</p>
          </div>
        </div>
      </Card>

      {/* Professional Ethics Notice */}
      <Alert className="bg-blue-50 border-blue-200">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">Professional Use Notice</AlertTitle>
        <AlertDescription className="text-blue-800">
          As a licensed attorney, you remain fully responsible for all generated content, 
          legal advice, and work product. All AI outputs must be reviewed, verified, and 
          customized to your client's case. This tool is for document automation and research assistance only.
        </AlertDescription>
      </Alert>

      {/* AI Legal Assistant */}
      <AILegalAssistant 
        caseDetails={caseDetails}
        violations={violations}
        documents={documents}
        timelineEvents={timelineEvents}
      />

      {/* Feature Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xl mb-1">Professional Tools</div>
            <p className="text-sm text-muted-foreground">
              Comprehensive litigation toolkit for CPS defense attorneys
            </p>
          </div>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Suite Settings
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attorneyFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={idx}
                className="p-5 cursor-pointer transition-all hover:border-primary hover:shadow-lg group"
                onClick={() => setActiveFeature(feature.path)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${feature.bg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span>{feature.title}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Access Tabs */}
      <Card className="p-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="drafting">AI Drafting</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm">Recent Activity</div>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="space-y-3">
                  {[
                    { action: 'Generated Motion to Suppress', client: 'J.M.', time: '2 hours ago' },
                    { action: 'Created Discovery Requests', client: 'T.R.', time: '5 hours ago' },
                    { action: 'Uploaded Court Order', client: 'S.L.', time: '1 day ago' },
                    { action: 'Generated § 1983 Complaint', client: 'M.K.', time: '2 days ago' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="mb-0.5">{item.action}</div>
                        <p className="text-xs text-muted-foreground">
                          Client: {item.client} • {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm">Upcoming Deadlines</div>
                  <Button variant="ghost" size="sm">Calendar</Button>
                </div>
                <div className="space-y-3">
                  {[
                    { task: 'File Motion to Dismiss', client: 'J.M.', due: 'Tomorrow' },
                    { task: 'Discovery Response Due', client: 'T.R.', due: 'Jan 28' },
                    { task: 'Court Hearing', client: 'S.L.', due: 'Feb 2' },
                    { task: 'Appeal Brief Filing', client: 'M.K.', due: 'Feb 15' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between text-sm">
                      <div>
                        <div className="mb-0.5">{item.task}</div>
                        <p className="text-xs text-muted-foreground">
                          Client: {item.client}
                        </p>
                      </div>
                      <Badge variant={idx === 0 ? 'destructive' : 'outline'}>
                        {item.due}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="p-5 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <div className="flex items-start gap-4">
                <Zap className="w-8 h-8 text-purple-600 mt-1" />
                <div className="flex-1">
                  <div className="mb-2 text-purple-900">AI Credits Remaining</div>
                  <p className="text-sm text-purple-800 mb-3">
                    You have <strong>950 AI credits</strong> remaining this month. Attorney Suite includes 
                    1,000 monthly credits for document generation, research, and analysis.
                  </p>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '95%' }} />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">Active Clients</div>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { initials: 'J.M.', cases: 2, violations: 8, status: 'Active', lastActivity: '2 hours ago' },
                { initials: 'T.R.', cases: 1, violations: 5, status: 'Active', lastActivity: '5 hours ago' },
                { initials: 'S.L.', cases: 3, violations: 12, status: 'Appeal', lastActivity: '1 day ago' },
                { initials: 'M.K.', cases: 1, violations: 15, status: 'Federal', lastActivity: '2 days ago' },
                { initials: 'A.B.', cases: 2, violations: 6, status: 'Active', lastActivity: '3 days ago' }
              ].map((client, idx) => (
                <Card key={idx} className="p-4 hover:border-primary cursor-pointer transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">{client.initials}</span>
                      </div>
                      <div>
                        <div className="mb-1">Client {client.initials}</div>
                        <p className="text-xs text-muted-foreground">
                          Last activity: {client.lastActivity}
                        </p>
                      </div>
                    </div>
                    <Badge>{client.status}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center pt-3 border-t">
                    <div>
                      <div className="text-lg">{client.cases}</div>
                      <p className="text-xs text-muted-foreground">Cases</p>
                    </div>
                    <div>
                      <div className="text-lg">{client.violations}</div>
                      <p className="text-xs text-muted-foreground">Violations</p>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        Open
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="drafting" className="space-y-4 mt-6">
            <Alert className="bg-purple-50 border-purple-200">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <AlertTitle className="text-purple-900">AI Paralegal - Attorney-Grade Drafting</AlertTitle>
              <AlertDescription className="text-purple-800">
                Generate professional legal documents using AI. All outputs require attorney review and customization.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'Motion to Dismiss', icon: FileText, category: 'Motions' },
                { title: 'Motion to Suppress Evidence', icon: FileText, category: 'Motions' },
                { title: 'Appellate Brief', icon: Scale, category: 'Appeals' },
                { title: '§ 1983 Federal Complaint', icon: Gavel, category: 'Federal' },
                { title: 'Discovery Interrogatories', icon: ClipboardList, category: 'Discovery' },
                { title: 'Request for Admissions', icon: ClipboardList, category: 'Discovery' },
                { title: 'Memorandum of Law', icon: BookOpen, category: 'Research' },
                { title: 'ADA Violation Notice', icon: Shield, category: 'Federal' }
              ].map((doc, idx) => {
                const Icon = doc.icon;
                return (
                  <Card key={idx} className="p-4 hover:border-primary cursor-pointer transition-all group">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1">{doc.title}</div>
                        <p className="text-xs text-muted-foreground">{doc.category}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        Generate
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="research" className="space-y-4 mt-6">
            <div className="mb-4">
              <div className="text-sm mb-3">Legal Research Assistant</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search case law, statutes, or ask a legal research question..."
                  className="flex-1 px-4 py-2 border rounded-lg"
                  spellCheck={true}
                />
                <Button>
                  <Search className="w-4 h-4 mr-2" />
                  Research
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="text-sm">Recent Research</span>
                </div>
                <div className="space-y-3">
                  {[
                    'Standard for emergency removal in Texas',
                    'Caniglia v. Strom summary',
                    'Burden of proof for adjudication',
                    'ADA reasonable accommodation cases'
                  ].map((query, idx) => (
                    <div key={idx} className="text-sm p-3 bg-muted rounded hover:bg-muted/80 cursor-pointer">
                      {query}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Map className="w-5 h-5 text-primary" />
                  <span className="text-sm">Multi-State Comparison</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Compare CPS laws and procedures across different states
                </p>
                <Button variant="outline" className="w-full">
                  Compare States
                </Button>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">Team Members (3/3 used)</div>
              <Button variant="outline">
                Manage Team
              </Button>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Sarah Johnson, Esq.', role: 'Lead Attorney', access: 'Full Access' },
                { name: 'Michael Chen', role: 'Paralegal', access: 'Edit & View' },
                { name: 'Lisa Martinez', role: 'Legal Assistant', access: 'View Only' }
              ].map((member, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="mb-0.5">{member.name}</div>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{member.access}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}