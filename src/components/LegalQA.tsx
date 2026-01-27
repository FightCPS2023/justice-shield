import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Send, 
  Scale, 
  BookOpen, 
  FileText, 
  Gavel, 
  Building, 
  Search,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Bookmark
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface Citation {
  id: string;
  type: 'statute' | 'code' | 'case-law' | 'supreme-court' | 'regulation' | 'constitution';
  title: string;
  citation: string;
  jurisdiction: string;
  relevance: number; // 0-100
  excerpt: string;
  url?: string;
  date?: string;
}

interface AnalysisSection {
  title: string;
  content: string;
  citations: string[]; // IDs of citations
  strength: 'strong' | 'moderate' | 'weak';
}

interface LegalAnalysis {
  question: string;
  summary: string;
  confidence: number; // 0-100
  sections: AnalysisSection[];
  citations: Citation[];
  recommendations: string[];
  warnings: string[];
  nextSteps: string[];
  timestamp: Date;
}

export function LegalQA({ userState }: { userState?: string }) {
  const [question, setQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<LegalAnalysis | null>(null);
  const [expandedCitations, setExpandedCitations] = useState<Set<string>>(new Set());

  const toggleCitation = (id: string) => {
    const newExpanded = new Set(expandedCitations);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCitations(newExpanded);
  };

  const getCitationIcon = (type: Citation['type']) => {
    switch (type) {
      case 'statute':
        return <FileText className="w-4 h-4" />;
      case 'code':
        return <BookOpen className="w-4 h-4" />;
      case 'case-law':
        return <Gavel className="w-4 h-4" />;
      case 'supreme-court':
        return <Building className="w-4 h-4" />;
      case 'constitution':
        return <Scale className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getCitationColor = (type: Citation['type']) => {
    switch (type) {
      case 'statute':
        return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300';
      case 'code':
        return 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300';
      case 'case-law':
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300';
      case 'supreme-court':
        return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300';
      case 'constitution':
        return 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleAnalyze = async () => {
    if (!question.trim()) return;

    setIsAnalyzing(true);

    // Simulate AI analysis with mock data
    // In production, this would call your AI endpoint
    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockAnalysis: LegalAnalysis = {
      question: question,
      summary: "Based on comprehensive analysis of federal and state law, CPS violated your Fourth Amendment rights by conducting a warrantless search without exigent circumstances. The evidence suggests multiple procedural violations that could strengthen your case for suppression of evidence and dismissal.",
      confidence: 87,
      sections: [
        {
          title: "Constitutional Analysis",
          content: "The Fourth Amendment protects against unreasonable searches and seizures. CPS workers are subject to the same constitutional constraints as law enforcement when conducting investigative home visits. The warrantless entry into your home without consent, exigent circumstances, or a valid court order constitutes a violation of your Fourth Amendment rights.",
          citations: ['cit1', 'cit2', 'cit3'],
          strength: 'strong'
        },
        {
          title: "Statutory Requirements",
          content: `Under ${userState || 'your state'} law, CPS must follow specific procedural requirements before removing a child or conducting a search. The statutes require reasonable suspicion of imminent danger for emergency removal, which appears to be lacking in your case based on the facts presented.`,
          citations: ['cit4', 'cit5'],
          strength: 'strong'
        },
        {
          title: "Case Law Precedent",
          content: "Multiple circuit court decisions have established that CPS workers cannot use their investigative authority to circumvent Fourth Amendment protections. The precedent strongly supports your position that the search was unconstitutional and any evidence obtained should be suppressed.",
          citations: ['cit6', 'cit7', 'cit8'],
          strength: 'moderate'
        },
        {
          title: "Procedural Due Process",
          content: "You have a fundamental liberty interest in the care, custody, and management of your children. The procedures used in your case may not have provided adequate due process protections, including proper notice, opportunity to be heard, and clear standards for removal decisions.",
          citations: ['cit9', 'cit10'],
          strength: 'strong'
        }
      ],
      citations: [
        {
          id: 'cit1',
          type: 'supreme-court',
          title: 'Wyman v. James',
          citation: '400 U.S. 309 (1971)',
          jurisdiction: 'United States Supreme Court',
          relevance: 95,
          excerpt: 'The Court held that while home visits by welfare caseworkers are not per se unreasonable under the Fourth Amendment, they must be conducted with proper consent and cannot be used as a pretext for criminal investigation.',
          url: 'https://supreme.justia.com/cases/federal/us/400/309/',
          date: '1971-01-12'
        },
        {
          id: 'cit2',
          type: 'supreme-court',
          title: 'Camara v. Municipal Court',
          citation: '387 U.S. 523 (1967)',
          jurisdiction: 'United States Supreme Court',
          relevance: 92,
          excerpt: 'Administrative searches of private property must comply with Fourth Amendment requirements. The government must demonstrate a reasonable legislative or administrative purpose and cannot conduct searches based solely on the occupant\'s refusal to permit inspection.',
          url: 'https://supreme.justia.com/cases/federal/us/387/523/',
          date: '1967-06-05'
        },
        {
          id: 'cit3',
          type: 'constitution',
          title: 'Fourth Amendment - U.S. Constitution',
          citation: 'U.S. Const. amend. IV',
          jurisdiction: 'Federal',
          relevance: 100,
          excerpt: 'The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated, and no Warrants shall issue, but upon probable cause...',
          date: '1791-12-15'
        },
        {
          id: 'cit4',
          type: 'statute',
          title: `${userState || 'State'} Child Protective Services Act`,
          citation: `${userState || 'State'} Code § 26-14-8`,
          jurisdiction: userState || 'State',
          relevance: 88,
          excerpt: 'Emergency removal of a child without a court order is permitted only when there is probable cause to believe that the child is in imminent danger of serious physical harm and there is insufficient time to petition the court for a removal order.',
          date: '2018-03-15'
        },
        {
          id: 'cit5',
          type: 'code',
          title: 'Requirements for CPS Investigation',
          citation: `${userState || 'State'} Admin. Code § 65C-29.002`,
          jurisdiction: userState || 'State',
          relevance: 85,
          excerpt: 'All CPS investigations must be conducted in accordance with due process requirements, including proper documentation of allegations, thorough investigation of facts, and adherence to constitutional protections against unlawful search and seizure.',
          date: '2020-07-01'
        },
        {
          id: 'cit6',
          type: 'case-law',
          title: 'Doe v. Kearney',
          citation: '329 F.3d 1286 (11th Cir. 2003)',
          jurisdiction: '11th Circuit Court of Appeals',
          relevance: 90,
          excerpt: 'CPS caseworkers are not entitled to qualified immunity when they violate clearly established Fourth Amendment rights by removing children without a warrant, court order, or exigent circumstances. The right to family integrity is a fundamental liberty interest.',
          url: 'https://caselaw.findlaw.com/court/us-11th-circuit/1194932.html',
          date: '2003-05-09'
        },
        {
          id: 'cit7',
          type: 'case-law',
          title: 'Calabretta v. Floyd',
          citation: '189 F.3d 808 (9th Cir. 1999)',
          jurisdiction: '9th Circuit Court of Appeals',
          relevance: 93,
          excerpt: 'The Fourth Amendment prohibits social workers from forcing entry into a home to investigate suspected child abuse absent consent, exigent circumstances, or a warrant. Parents have a fundamental right to privacy in their home and family relationships.',
          url: 'https://caselaw.findlaw.com/court/us-9th-circuit/1394642.html',
          date: '1999-08-24'
        },
        {
          id: 'cit8',
          type: 'case-law',
          title: 'Roe v. Texas Department of Protective Services',
          citation: '299 F.3d 395 (5th Cir. 2002)',
          jurisdiction: '5th Circuit Court of Appeals',
          relevance: 87,
          excerpt: 'Removal of children from their parents without a court order or exigent circumstances violates the Fourteenth Amendment. CPS must demonstrate that the danger to the child is imminent and that removal is the least restrictive means of protecting the child.',
          url: 'https://caselaw.findlaw.com/court/us-5th-circuit/1261478.html',
          date: '2002-08-13'
        },
        {
          id: 'cit9',
          type: 'supreme-court',
          title: 'Santosky v. Kramer',
          citation: '455 U.S. 745 (1982)',
          jurisdiction: 'United States Supreme Court',
          relevance: 94,
          excerpt: 'The fundamental liberty interest of natural parents in the care, custody, and management of their child is protected by the Fourteenth Amendment. Before a State may sever completely and irrevocably the rights of parents, due process requires clear and convincing evidence.',
          url: 'https://supreme.justia.com/cases/federal/us/455/745/',
          date: '1982-03-24'
        },
        {
          id: 'cit10',
          type: 'supreme-court',
          title: 'Troxel v. Granville',
          citation: '530 U.S. 57 (2000)',
          jurisdiction: 'United States Supreme Court',
          relevance: 91,
          excerpt: 'The liberty interest of parents in the care, custody, and control of their children is perhaps the oldest of the fundamental liberty interests recognized by this Court. The Due Process Clause protects the fundamental right of parents to make decisions concerning the care of their children.',
          url: 'https://supreme.justia.com/cases/federal/us/530/57/',
          date: '2000-06-05'
        }
      ],
      recommendations: [
        "File a Motion to Suppress Evidence obtained during the unconstitutional search",
        "Consider filing a § 1983 civil rights lawsuit for Fourth Amendment violations",
        "Document all interactions with CPS workers for future proceedings",
        "Request all CPS records and case files through proper legal channels",
        "Consult with a family law attorney who specializes in CPS defense cases"
      ],
      warnings: [
        "Time limits apply for filing motions and appeals - act promptly",
        "Do not speak with CPS without your attorney present",
        "Avoid making any statements that could be used against you",
        "Qualified immunity may protect some CPS workers from liability"
      ],
      nextSteps: [
        "Schedule consultation with a family law attorney within 48 hours",
        "Gather all documentation related to the CPS investigation",
        "Prepare a detailed timeline of all events and interactions",
        "Identify potential witnesses who can testify on your behalf",
        "Begin documenting your compliance with any court-ordered services"
      ],
      timestamp: new Date()
    };

    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Legal Q&A Assistant</h2>
              <p className="text-blue-100 text-sm">AI-Powered Legal Research & Analysis</p>
            </div>
          </div>
          <p className="text-white/90 text-sm max-w-3xl">
            Ask any question about your CPS case and receive comprehensive analysis backed by constitutional law, 
            statutes, case precedent, and Supreme Court rulings. Our AI analyzes multiple legal sources to provide 
            you with the most accurate and actionable guidance.
          </p>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <Alert className="border-l-4 border-l-amber-600 bg-amber-50 dark:bg-amber-950/20">
        <AlertCircle className="h-5 w-5 text-amber-600" />
        <AlertDescription className="text-sm text-amber-900 dark:text-amber-100">
          <strong className="font-semibold">Important:</strong> This AI assistant provides educational information only 
          and does not constitute legal advice. Always consult with a qualified attorney for advice specific to your situation. 
          Citations are provided for your attorney's review.
        </AlertDescription>
      </Alert>

      {/* Question Input */}
      <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            Ask Your Legal Question
          </CardTitle>
          <CardDescription>
            Be specific and include relevant details about your situation. The more context you provide, 
            the better the AI can analyze applicable law.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Textarea
              placeholder="Example: CPS entered my home without my consent and without a warrant. They didn't explain why they needed to come in, and I felt pressured to let them in. They took photos of my children and home. Was this legal? What are my rights?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-32 text-base"
              disabled={isAnalyzing}
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {userState && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md">
                    <Info className="w-3 h-3" />
                    Analysis will include {userState}-specific law
                  </span>
                )}
              </div>
              <Button 
                onClick={handleAnalyze}
                disabled={!question.trim() || isAnalyzing}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Analyzing Legal Sources...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Analyze Question
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Summary Card */}
          <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Legal Analysis Complete</h3>
                  <p className="text-blue-100 text-sm">
                    Analyzed {analysis.citations.length} legal sources • Generated {new Date(analysis.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{analysis.confidence}%</div>
                    <div className="text-xs text-blue-100">Confidence</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                <p className="text-white leading-relaxed">{analysis.summary}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(analysis.summary)}>
                  <Copy className="w-3 h-3 mr-1.5" />
                  Copy Summary
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-3 h-3 mr-1.5" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Bookmark className="w-3 h-3 mr-1.5" />
                  Save to Case
                </Button>
              </div>
            </div>
          </Card>

          {/* Analysis Sections */}
          <div className="grid gap-6">
            {analysis.sections.map((section, index) => (
              <Card key={index} className="border-2 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <Badge 
                      variant={section.strength === 'strong' ? 'default' : 'secondary'}
                      className={
                        section.strength === 'strong' 
                          ? 'bg-green-600 text-white' 
                          : section.strength === 'moderate'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-white'
                      }
                    >
                      {section.strength === 'strong' ? 'Strong' : section.strength === 'moderate' ? 'Moderate' : 'Weak'} Position
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    {section.content}
                  </p>

                  {/* Supporting Citations */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Supporting Legal Authority ({section.citations.length})
                    </h4>
                    <div className="space-y-2">
                      {section.citations.map(citId => {
                        const citation = analysis.citations.find(c => c.id === citId);
                        if (!citation) return null;

                        const isExpanded = expandedCitations.has(citation.id);

                        return (
                          <div 
                            key={citation.id} 
                            className={`border-2 rounded-lg overflow-hidden transition-all ${getCitationColor(citation.type)}`}
                          >
                            <button
                              onClick={() => toggleCitation(citation.id)}
                              className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/50 dark:bg-black/20 rounded-lg flex items-center justify-center">
                                  {getCitationIcon(citation.type)}
                                </div>
                                <div className="text-left">
                                  <div className="font-semibold text-sm">{citation.title}</div>
                                  <div className="text-xs opacity-80">{citation.citation}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                  <div className="text-xs font-semibold">Relevance</div>
                                  <div className="text-sm font-bold">{citation.relevance}%</div>
                                </div>
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="px-4 py-4 bg-white/30 dark:bg-black/20 border-t border-current/20 space-y-3">
                                <div>
                                  <div className="text-xs font-semibold mb-1 opacity-70">Excerpt:</div>
                                  <p className="text-sm italic leading-relaxed">"{citation.excerpt}"</p>
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                  <div>
                                    <span className="opacity-70">Jurisdiction:</span>{' '}
                                    <span className="font-semibold">{citation.jurisdiction}</span>
                                  </div>
                                  {citation.date && (
                                    <div>
                                      <span className="opacity-70">Date:</span>{' '}
                                      <span className="font-semibold">{new Date(citation.date).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                                {citation.url && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="w-full"
                                    onClick={() => window.open(citation.url, '_blank')}
                                  >
                                    <ExternalLink className="w-3 h-3 mr-2" />
                                    View Full Text
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recommendations, Warnings, Next Steps */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Recommendations */}
            <Card className="border-2 border-green-200 dark:border-green-800 shadow-lg">
              <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <CardTitle className="text-lg flex items-center gap-2 text-green-900 dark:text-green-100">
                  <CheckCircle className="w-5 h-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Warnings */}
            <Card className="border-2 border-red-200 dark:border-red-800 shadow-lg">
              <CardHeader className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
                <CardTitle className="text-lg flex items-center gap-2 text-red-900 dark:text-red-100">
                  <AlertCircle className="w-5 h-5" />
                  Important Warnings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {analysis.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{warning}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg">
              <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <Info className="w-5 h-5" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {analysis.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* All Citations Reference */}
          <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Complete Legal Authority ({analysis.citations.length} Sources)
              </CardTitle>
              <CardDescription>
                All sources analyzed and cited in this legal opinion. Click to expand full details.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-3">
                {analysis.citations.map(citation => {
                  const isExpanded = expandedCitations.has(citation.id);
                  return (
                    <div 
                      key={citation.id}
                      className={`border-2 rounded-xl overflow-hidden transition-all ${getCitationColor(citation.type)}`}
                    >
                      <button
                        onClick={() => toggleCitation(citation.id)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/50 dark:bg-black/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            {getCitationIcon(citation.type)}
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-base">{citation.title}</div>
                            <div className="text-sm opacity-80 font-mono">{citation.citation}</div>
                            <div className="text-xs opacity-70 mt-1">{citation.jurisdiction}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="bg-white/50 dark:bg-black/30">
                            {citation.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Badge>
                          <div className="text-right">
                            <div className="text-xs font-semibold opacity-70">Relevance</div>
                            <div className="text-xl font-bold">{citation.relevance}%</div>
                          </div>
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 py-5 bg-white/30 dark:bg-black/20 border-t border-current/20 space-y-4">
                          <div>
                            <div className="text-sm font-bold mb-2 opacity-70">Relevant Excerpt:</div>
                            <p className="text-sm italic leading-relaxed p-4 bg-white/50 dark:bg-black/30 rounded-lg border border-current/20">
                              "{citation.excerpt}"
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              {citation.date && (
                                <span className="opacity-70">
                                  Decided: <span className="font-semibold">{new Date(citation.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => copyToClipboard(`${citation.title}, ${citation.citation}`)}
                              >
                                <Copy className="w-3 h-3 mr-1.5" />
                                Copy Citation
                              </Button>
                              {citation.url && (
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  onClick={() => window.open(citation.url, '_blank')}
                                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                                >
                                  <ExternalLink className="w-3 h-3 mr-1.5" />
                                  Read Full Case
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resources Library Promotion */}
      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-600 rounded-lg shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2 text-purple-900 dark:text-purple-100">
                📚 Legal Resources Library Available
              </h3>
              <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                Access comprehensive legal references including Federal Bench Books, Maxims of Law, Federalist Papers, 
                U.S. Constitution, Magna Carta, The Bible with religious freedom protections, and detailed explanations 
                of the Parens Patriae doctrine. Perfect for citing in motions, understanding your rights, and supporting your defense strategy.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-600 text-white">Federal Bench Books</Badge>
                <Badge className="bg-purple-600 text-white">Maxims of Law</Badge>
                <Badge className="bg-red-600 text-white">Constitution & Bill of Rights</Badge>
                <Badge className="bg-green-600 text-white">Federalist Papers</Badge>
                <Badge className="bg-orange-600 text-white">Magna Carta</Badge>
                <Badge className="bg-amber-600 text-white">The Bible</Badge>
                <Badge className="bg-indigo-600 text-white">Parens Patriae</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
