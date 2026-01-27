import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  BookOpen, FileText, Search, Scale, MapPin, 
  Download, ExternalLink, Star, Filter, 
  CheckCircle2, AlertCircle, Crown, Sparkles,
  Users, Building2, Gavel, Shield, Award,
  TrendingUp, Clock, BookMarked, MessageSquare,
  FileCheck, Library, Briefcase, GraduationCap
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface LegalResourceLibraryProps {
  userState?: string;
  violations?: any;
  caseDetails?: any;
}

export function LegalResourceLibrary({ userState = '', violations = {}, caseDetails = {} }: LegalResourceLibraryProps) {
  const { isPremium, isAttorney } = useSubscription();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>(userState);

  // Legal Resources organized by category
  const caseLibrary = [
    {
      id: 1,
      title: 'Troxel v. Granville',
      citation: '530 U.S. 57 (2000)',
      court: 'U.S. Supreme Court',
      year: 2000,
      category: 'Parental Rights',
      keyHolding: 'Parents have fundamental constitutional right to make decisions concerning care, custody, and control of their children.',
      relevance: 'Essential for challenging CPS overreach',
      applicationTips: [
        'Use when CPS interferes with parental decision-making without compelling justification',
        'Cite when arguing against restrictive visitation or service plans',
        'Foundation for substantive due process claims'
      ],
      relatedCases: ['Stanley v. Illinois', 'Santosky v. Kramer'],
      downloadUrl: '/cases/troxel-v-granville.pdf',
      tags: ['fundamental rights', 'parental authority', 'due process']
    },
    {
      id: 2,
      title: 'Santosky v. Kramer',
      citation: '455 U.S. 745 (1982)',
      court: 'U.S. Supreme Court',
      year: 1982,
      category: 'Due Process',
      keyHolding: 'Clear and convincing evidence standard required for termination of parental rights proceedings.',
      relevance: 'Critical for TPR defense',
      applicationTips: [
        'Challenge insufficient evidence in termination cases',
        'Argue burden of proof not met by state',
        'Motion to dismiss when evidence fails to meet standard'
      ],
      relatedCases: ['Lassiter v. DSS', 'M.L.B. v. S.L.J.'],
      downloadUrl: '/cases/santosky-v-kramer.pdf',
      tags: ['burden of proof', 'termination', 'due process']
    },
    {
      id: 3,
      title: 'Stanley v. Illinois',
      citation: '405 U.S. 645 (1972)',
      court: 'U.S. Supreme Court',
      year: 1972,
      category: 'Equal Protection',
      keyHolding: 'Unwed fathers entitled to hearing before children are removed.',
      relevance: 'Procedural due process violations',
      applicationTips: [
        'Challenge removal without proper hearing',
        'Assert equal protection for unmarried parents',
        'Demand individualized determination of fitness'
      ],
      relatedCases: ['Troxel v. Granville', 'Michael H. v. Gerald D.'],
      downloadUrl: '/cases/stanley-v-illinois.pdf',
      tags: ['unmarried parents', 'procedural rights', 'equal protection']
    },
    {
      id: 4,
      title: 'Lassiter v. Department of Social Services',
      citation: '452 U.S. 18 (1981)',
      court: 'U.S. Supreme Court',
      year: 1981,
      category: 'Right to Counsel',
      keyHolding: 'Right to counsel in termination proceedings depends on case-by-case analysis under due process.',
      relevance: 'When denied attorney representation',
      applicationTips: [
        'Argue complexity of case requires counsel',
        'Show inability to afford attorney',
        'Demonstrate risk of erroneous deprivation'
      ],
      relatedCases: ['Santosky v. Kramer', 'M.L.B. v. S.L.J.'],
      downloadUrl: '/cases/lassiter-v-dss.pdf',
      tags: ['right to counsel', 'due process', 'indigent parents']
    }
  ];

  const legalForms = [
    {
      id: 1,
      title: 'Motion to Dismiss - Insufficient Evidence',
      category: 'Motions',
      description: 'Template for challenging CPS petition based on lack of evidence meeting required standard.',
      state: 'Multi-State',
      pages: 8,
      difficulty: 'Intermediate',
      premium: true,
      includes: ['Legal standard citations', 'Argument structure', 'Supporting declarations']
    },
    {
      id: 2,
      title: 'Motion to Suppress Evidence',
      category: 'Motions',
      description: 'Challenge illegally obtained evidence from warrantless searches or Fourth Amendment violations.',
      state: 'Multi-State',
      pages: 12,
      difficulty: 'Advanced',
      premium: true,
      includes: ['Fourth Amendment analysis', 'Case law citations', 'Suppression hearing prep']
    },
    {
      id: 3,
      title: 'Discovery Request - CPS Records',
      category: 'Discovery',
      description: 'Comprehensive discovery demands for all CPS case files, communications, and investigative materials.',
      state: 'Multi-State',
      pages: 6,
      difficulty: 'Beginner',
      premium: false,
      includes: ['Document requests', 'Interrogatories', 'Subpoena templates']
    },
    {
      id: 4,
      title: 'Motion for Return of Children',
      category: 'Motions',
      description: 'Emergency motion to return children to parental custody pending resolution.',
      state: 'Multi-State',
      pages: 10,
      difficulty: 'Intermediate',
      premium: true,
      includes: ['Emergency procedures', 'Safety plan proposals', 'Supporting affidavits']
    },
    {
      id: 5,
      title: 'Affidavit of Bias - Case Worker',
      category: 'Affidavits',
      description: 'Challenge biased or retaliatory conduct by CPS caseworker.',
      state: 'Multi-State',
      pages: 4,
      difficulty: 'Beginner',
      premium: false,
      includes: ['Bias documentation', 'Timeline of events', 'Witness statements']
    },
    {
      id: 6,
      title: 'Motion to Modify Visitation',
      category: 'Motions',
      description: 'Request increased or unsupervised visitation based on compliance and progress.',
      state: 'Multi-State',
      pages: 7,
      difficulty: 'Beginner',
      premium: false,
      includes: ['Progress documentation', 'Best interest analysis', 'Proposed schedule']
    }
  ];

  const attorneyDirectory = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      firm: 'Family Defense Legal Group',
      location: 'Los Angeles, CA',
      experience: '15 years',
      specialties: ['CPS Defense', 'Termination Defense', 'Family Reunification'],
      rating: 4.9,
      reviews: 127,
      caseResults: 'Successfully defended 200+ CPS cases',
      availability: 'Accepting new clients',
      consultationFee: 'Free initial consultation',
      languages: ['English', 'Spanish']
    },
    {
      id: 2,
      name: 'Michael Chen',
      firm: 'Chen & Associates',
      location: 'New York, NY',
      experience: '12 years',
      specialties: ['Dependency Law', 'Appeals', 'Civil Rights'],
      rating: 4.8,
      reviews: 93,
      caseResults: '85% success rate in TPR defense',
      availability: 'Limited availability',
      consultationFee: '$150',
      languages: ['English', 'Mandarin']
    },
    {
      id: 3,
      name: 'Jennifer Rodriguez',
      firm: 'Rodriguez Family Law',
      location: 'Houston, TX',
      experience: '10 years',
      specialties: ['CPS Defense', 'Custody', 'Juvenile Law'],
      rating: 5.0,
      reviews: 156,
      caseResults: 'Board Certified in Family Law',
      availability: 'Accepting new clients',
      consultationFee: 'Free initial consultation',
      languages: ['English', 'Spanish', 'Portuguese']
    }
  ];

  const legalGuides = [
    {
      id: 1,
      title: 'Your Rights During a CPS Investigation',
      category: 'Know Your Rights',
      readTime: '10 min',
      lastUpdated: '2024-01-15',
      topics: ['Investigation process', 'When to allow entry', 'Right to refuse', 'Recording interactions'],
      difficulty: 'Beginner',
      views: 15420
    },
    {
      id: 2,
      title: 'Challenging Hearsay Evidence in CPS Cases',
      category: 'Evidence Strategy',
      readTime: '15 min',
      lastUpdated: '2024-01-10',
      topics: ['Hearsay rules', 'Exceptions', 'Objection procedures', 'Case law'],
      difficulty: 'Advanced',
      views: 8230
    },
    {
      id: 3,
      title: 'Building Your Family Defense Timeline',
      category: 'Case Preparation',
      readTime: '12 min',
      lastUpdated: '2024-01-20',
      topics: ['Documentation strategies', 'Timeline importance', 'Evidence collection', 'Witness preparation'],
      difficulty: 'Intermediate',
      views: 12350
    },
    {
      id: 4,
      title: 'Understanding the Termination Process',
      category: 'Termination Defense',
      readTime: '20 min',
      lastUpdated: '2024-01-08',
      topics: ['TPR standards', 'Reunification services', 'Permanency planning', 'Appeal rights'],
      difficulty: 'Intermediate',
      views: 9870
    }
  ];

  const handleSearch = () => {
    if (!searchQuery) {
      toast.error('Please enter a search term');
      return;
    }
    toast.success(`Searching for: ${searchQuery}`);
  };

  if (!isPremium && !isAttorney) {
    return (
      <Card className="p-8 text-center">
        <Library className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl mb-2">Legal Resource Library - Premium Feature</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Access our comprehensive legal research library with Supreme Court cases, legal form templates, 
          attorney directory, and expert guides. Everything you need to build a strong defense.
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
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Library className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl">Legal Resource Library</h2>
              <Badge className="bg-indigo-600 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                Powered by Legal Research
              </Badge>
            </div>
            <p className="text-sm text-indigo-800 mb-3">
              Comprehensive legal research tools including case law database, motion templates, 
              attorney directory, and expert legal guides - everything you need to build your defense.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-indigo-700">
                <Scale className="w-4 h-4" />
                <span>{caseLibrary.length} Supreme Court Cases</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-700">
                <FileText className="w-4 h-4" />
                <span>{legalForms.length} Legal Forms</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-700">
                <Users className="w-4 h-4" />
                <span>{attorneyDirectory.length} Attorney Profiles</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search cases, forms, attorneys, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="cases" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cases" className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Case Law ({caseLibrary.length})
          </TabsTrigger>
          <TabsTrigger value="forms" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Legal Forms ({legalForms.length})
          </TabsTrigger>
          <TabsTrigger value="attorneys" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Attorneys ({attorneyDirectory.length})
          </TabsTrigger>
          <TabsTrigger value="guides" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Guides ({legalGuides.length})
          </TabsTrigger>
        </TabsList>

        {/* Case Law Tab */}
        <TabsContent value="cases" className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Gavel className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900">Supreme Court Case Library</AlertTitle>
            <AlertDescription className="text-blue-800">
              Landmark Supreme Court decisions essential for CPS defense. Each case includes full citation, 
              key holdings, application tips, and related cases.
            </AlertDescription>
          </Alert>

          {caseLibrary.map((case_) => (
            <Card key={case_.id} className="p-6 hover:border-primary transition-all">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Scale className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium mb-1">{case_.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {case_.citation}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {case_.court}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {case_.year}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                          {case_.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <div className="text-sm font-medium mb-1">Key Holding:</div>
                  <p className="text-sm text-muted-foreground">{case_.keyHolding}</p>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Relevance to CPS Defense:</div>
                  <p className="text-sm text-muted-foreground">{case_.relevance}</p>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Application Tips:</div>
                  <ul className="space-y-1">
                    {case_.applicationTips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Tags:</span>
                  {case_.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Related:</span>
                  {case_.relatedCases.map((related, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      {related}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Text
                </Button>
                <Button variant="outline" size="sm">
                  <BookMarked className="w-4 h-4 mr-2" />
                  Add to Binder
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Legal Forms Tab */}
        <TabsContent value="forms" className="space-y-4">
          <Alert className="bg-purple-50 border-purple-200">
            <FileCheck className="h-4 w-4 text-purple-600" />
            <AlertTitle className="text-purple-900">Professional Legal Form Templates</AlertTitle>
            <AlertDescription className="text-purple-800">
              Attorney-drafted templates for motions, discovery, affidavits, and more. 
              Customizable for your specific case with built-in legal citations and argument structure.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {legalForms.map((form) => (
              <Card key={form.id} className="p-5 hover:border-primary transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{form.title}</h4>
                          {form.premium && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge variant="outline" className="text-xs">
                            {form.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {form.pages} pages
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {form.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {form.state}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{form.description}</p>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Includes:</span> {form.includes.join(' • ')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="default" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Attorney Directory Tab */}
        <TabsContent value="attorneys" className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <Users className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Find Experienced CPS Defense Attorneys</AlertTitle>
            <AlertDescription className="text-green-800">
              Connect with qualified family defense attorneys in your area. Filter by location, 
              specialization, language, and availability. Most offer free initial consultations.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {attorneyDirectory.map((attorney) => (
              <Card key={attorney.id} className="p-6 hover:border-primary transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-medium mb-1">{attorney.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{attorney.firm}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="w-3 h-3 mr-1" />
                            {attorney.location}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {attorney.experience}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{attorney.rating}</span>
                            <span className="text-xs text-muted-foreground">({attorney.reviews} reviews)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium">Specialties:</span>
                        {attorney.specialties.map((specialty, idx) => (
                          <Badge key={idx} className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium">Languages:</span>
                        {attorney.languages.map((lang, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>

                      <p className="text-sm text-muted-foreground">
                        <Award className="w-4 h-4 inline mr-1" />
                        {attorney.caseResults}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <div className={`flex items-center gap-2 ${attorney.availability === 'Accepting new clients' ? 'text-green-600' : 'text-orange-600'}`}>
                          <CheckCircle2 className="w-4 h-4" />
                          {attorney.availability}
                        </div>
                        <div className="text-muted-foreground">
                          {attorney.consultationFee}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Attorney
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-5 bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Don't see an attorney in your area? We're constantly adding new profiles.
            </p>
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search All Attorneys in {userState || 'Your State'}
            </Button>
          </Card>
        </TabsContent>

        {/* Legal Guides Tab */}
        <TabsContent value="guides" className="space-y-4">
          <Alert className="bg-amber-50 border-amber-200">
            <GraduationCap className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900">Expert Legal Guides & Articles</AlertTitle>
            <AlertDescription className="text-amber-800">
              In-depth guides written by CPS defense experts covering investigation procedures, 
              evidence strategies, case preparation, and your legal rights.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {legalGuides.map((guide) => (
              <Card key={guide.id} className="p-5 hover:border-primary transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{guide.title}</h4>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge variant="outline" className="text-xs">
                            {guide.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {guide.readTime}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {guide.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {guide.views.toLocaleString()} views
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs font-medium mb-1">Topics Covered:</div>
                      <div className="flex flex-wrap gap-1">
                        {guide.topics.map((topic, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Updated: {new Date(guide.lastUpdated).toLocaleDateString()}
                      </span>
                      <Button variant="outline" size="sm">
                        Read Guide
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
