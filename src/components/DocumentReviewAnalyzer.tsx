import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Textarea } from './ui/textarea';
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingDown,
  TrendingUp,
  BookOpen,
  Scale,
  Target,
  Award,
  Eye,
  FileSearch,
  Brain,
  Lightbulb,
  AlertCircle,
  ArrowRight,
  Download,
  Sparkles,
  Shield,
  Gavel,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AnalysisResult {
  overallGrade: string;
  overallScore: number;
  strengthScore: number;
  clarityScore: number;
  accuracyScore: number;
  legalWritingScore: number;
  
  criticalErrors: Array<{
    type: string;
    location: string;
    description: string;
    severity: 'critical' | 'high' | 'medium';
    suggestion: string;
  }>;
  
  weakArguments: Array<{
    argument: string;
    location: string;
    weakness: string;
    strength: number;
    suggestion: string;
  }>;
  
  falseInformation: Array<{
    claim: string;
    location: string;
    issue: string;
    correction: string;
  }>;
  
  legalWritingIssues: Array<{
    type: string;
    examples: string[];
    suggestion: string;
  }>;
  
  strengtheningSuggestions: Array<{
    area: string;
    currentState: string;
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  
  missingArguments: Array<{
    argument: string;
    reason: string;
    priority: 'critical' | 'important' | 'suggested';
  }>;
  
  suggestedDocuments: Array<{
    documentType: string;
    purpose: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  
  summary: string;
}

export function DocumentReviewAnalyzer() {
  const [documentText, setDocumentText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']));

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.txt') && !file.name.endsWith('.docx')) {
        toast.error('Please upload a PDF, TXT, or DOCX file');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setUploadedFile(file);
      toast.success(`Uploaded: ${file.name}`);
      
      // Simulate reading the file
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setDocumentText(text.substring(0, 5000)); // Preview first 5000 chars
      };
      reader.readAsText(file);
    }
  };

  const analyzeDocument = async () => {
    if (!documentText && !uploadedFile) {
      toast.error('Please upload a document or paste text to analyze');
      return;
    }

    setIsAnalyzing(true);

    // Simulate AI analysis (replace with actual API call)
    setTimeout(() => {
      const mockResult: AnalysisResult = {
        overallGrade: 'B+',
        overallScore: 87,
        strengthScore: 82,
        clarityScore: 91,
        accuracyScore: 85,
        legalWritingScore: 88,
        
        criticalErrors: [
          {
            type: 'Citation Error',
            location: 'Page 3, Paragraph 2',
            description: 'Incorrect case citation format for federal case',
            severity: 'high',
            suggestion: 'Change "Smith v. Jones, 2020" to "Smith v. Jones, 123 F.3d 456 (9th Cir. 2020)" - include reporter, volume, and page number per Bluebook Rule 10.2'
          },
          {
            type: 'Procedural Error',
            location: 'Page 5, Motion Header',
            description: 'Missing required local rule citation',
            severity: 'critical',
            suggestion: 'Add reference to Local Rule 7.1 for motion practice in this jurisdiction'
          },
          {
            type: 'Jurisdictional Issue',
            location: 'Page 2, Legal Standard Section',
            description: 'Citing out-of-circuit case as binding precedent',
            severity: 'high',
            suggestion: 'Clarify that 5th Circuit case is persuasive authority only, not binding in 9th Circuit'
          }
        ],
        
        weakArguments: [
          {
            argument: 'Fourth Amendment violation based solely on officer\'s demeanor',
            location: 'Page 4, Argument II',
            weakness: 'Insufficient legal basis - demeanor alone does not establish constitutional violation',
            strength: 35,
            suggestion: 'Strengthen with objective evidence: lack of warrant, absence of exigent circumstances, or failure to obtain consent. Cite Terry v. Ohio, 392 U.S. 1 (1968) and Payton v. New York, 445 U.S. 573 (1980)'
          },
          {
            argument: 'Agency failed to provide "adequate" services without defining standard',
            location: 'Page 6, Argument III',
            weakness: 'Vague terminology - "adequate" is not legally sufficient without specific standard',
            strength: 42,
            suggestion: 'Define "adequate" using ASFA requirements (42 U.S.C. § 671(a)(15)), cite specific services required by state law, and identify exact services withheld with dates and documentation'
          },
          {
            argument: 'Best interests standard mentioned without analysis',
            location: 'Page 8, Conclusion',
            weakness: 'Conclusory - no factual application of best interests factors',
            strength: 28,
            suggestion: 'Apply state-specific best interests factors (usually 8-12 statutory factors) to case facts. Cite controlling state statute and show how each factor weighs in client\'s favor with specific evidence'
          }
        ],
        
        falseInformation: [
          {
            claim: 'Client attended all 15 required parenting classes',
            location: 'Page 7, Facts Section',
            issue: 'Contradicts Exhibit B which shows 12 attendances',
            correction: 'Correct to state "Client attended 12 of 15 required parenting classes" and explain reasons for 3 absences (documented medical emergencies per Exhibit C)'
          },
          {
            claim: 'No prior CPS involvement',
            location: 'Page 3, Background',
            issue: 'Agency records show 2019 case (closed as unfounded)',
            correction: 'Disclose 2019 case but emphasize it was closed as unfounded with no services required - shows pattern of false allegations rather than harm to children'
          }
        ],
        
        legalWritingIssues: [
          {
            type: 'Passive Voice Overuse',
            examples: [
              'Page 5: "It was determined that..." → Change to "The court determined that..."',
              'Page 6: "Services were not provided..." → Change to "CPS failed to provide services..."'
            ],
            suggestion: 'Use active voice for stronger, clearer arguments. Passive voice weakens attorney culpability and obscures agency responsibility'
          },
          {
            type: 'Excessive Legalese',
            examples: [
              'Page 2: "Hereinafter" appears 8 times - use sparingly',
              'Page 4: "Aforementioned" - replace with specific reference'
            ],
            suggestion: 'Replace archaic terms with plain language. Modern legal writing favors clarity over formality'
          },
          {
            type: 'Paragraph Length',
            examples: [
              'Page 5: 18-line paragraph - break into 3 focused paragraphs',
              'Page 7: 22-line paragraph covering 4 separate issues'
            ],
            suggestion: 'Limit paragraphs to 6-8 lines. Each paragraph should advance one point. Improve readability for judicial officers'
          }
        ],
        
        strengtheningSuggestions: [
          {
            area: 'Fourth Amendment Argument',
            currentState: 'Generic constitutional violation claim',
            suggestion: 'Add analysis under Santosky v. Kramer, 455 U.S. 745 (1982) - heightened clear and convincing evidence standard applies. Cite specific evidence CPS lacks and argue burden not met',
            impact: 'high'
          },
          {
            area: 'Due Process Violations',
            currentState: 'Brief mention of notice issues',
            suggestion: 'Expand with timeline showing inadequate notice (must be reasonable time before hearing per state law). Calculate exact days, cite local rule requirement, show prejudice to client\'s ability to prepare defense',
            impact: 'high'
          },
          {
            area: 'Service Plan Compliance',
            currentState: 'States client "substantially complied"',
            suggestion: 'Provide detailed compliance chart showing each requirement, completion date, and supporting exhibit. Quantify compliance rate (e.g., "92% compliance rate exceeds substantial compliance threshold established in [State Case]")',
            impact: 'medium'
          },
          {
            area: 'Expert Testimony',
            currentState: 'No mention of expert witnesses',
            suggestion: 'Consider adding bonding expert affidavit showing strong parent-child attachment (critical for reunification argument) or psychological expert rebutting agency\'s mental health concerns',
            impact: 'high'
          }
        ],
        
        missingArguments: [
          {
            argument: 'ICWA Compliance (Indian Child Welfare Act)',
            reason: 'No analysis of whether ICWA inquiry was properly conducted. If child has any Native American heritage, ICWA provides heightened protections and procedural requirements that CPS may have violated',
            priority: 'critical'
          },
          {
            argument: 'Reasonable Efforts Finding',
            reason: 'Document fails to challenge agency\'s reasonable efforts. Must argue agency failed to make reasonable efforts to prevent removal or reunify per 42 U.S.C. § 671(a)(15)(B)',
            priority: 'critical'
          },
          {
            argument: 'Least Restrictive Alternative',
            reason: 'No argument that placement with relative (mentioned in facts) is less restrictive than foster care. Should cite state preference for kinship placement',
            priority: 'important'
          },
          {
            argument: 'Visitation Restrictions',
            reason: 'Client\'s visitation was reduced without due process hearing. Argue visitation is fundamental liberty interest requiring procedural protections',
            priority: 'important'
          }
        ],
        
        suggestedDocuments: [
          {
            documentType: 'Motion to Compel Discovery',
            purpose: 'CPS has not provided complete case file. Motion to compel will obtain: all case worker notes, supervisor reviews, and any exculpatory evidence required by Brady v. Maryland',
            priority: 'high'
          },
          {
            documentType: 'Expert Witness Affidavit - Bonding Evaluation',
            purpose: 'Professional evaluation of parent-child bond will rebut agency claims and support reunification argument',
            priority: 'high'
          },
          {
            documentType: 'Notice of Insufficiency of Service Plan',
            purpose: 'Service plan does not meet ASFA requirements - lacks specific goals, measurable objectives, and reasonable timeframes',
            priority: 'medium'
          },
          {
            documentType: 'Motion for Modification of Visitation',
            purpose: 'Increase visitation frequency and duration to strengthen parent-child bond and demonstrate parenting capacity',
            priority: 'medium'
          },
          {
            documentType: 'Supplemental Declaration with Timeline',
            purpose: 'Detailed chronological timeline showing all client compliance efforts, agency failures, and procedural violations',
            priority: 'high'
          }
        ],
        
        summary: 'This motion demonstrates solid legal research and competent writing, earning a B+ grade (87/100). The document effectively argues several constitutional violations and shows good command of legal authority. However, several critical weaknesses require immediate attention:\n\nCRITICAL ISSUES:\n• Two factual inaccuracies that contradict exhibits - must correct immediately to preserve credibility\n• Missing ICWA analysis (critical if any Native American heritage)\n• Jurisdictional confusion citing out-of-circuit cases as binding authority\n• Weak Fourth Amendment argument needs substantial strengthening\n\nSTRENGTHS:\n• Excellent legal writing clarity (91/100)\n• Strong case law citations overall\n• Good organization and structure\n• Professional tone throughout\n\nRECOMMENDATIONS:\n1. Immediately correct factual errors on pages 3 and 7\n2. Add ICWA compliance analysis\n3. Strengthen Fourth Amendment argument with Santosky analysis\n4. Add reasonable efforts argument (critical missing element)\n5. File Motion to Compel Discovery and obtain bonding expert affidavit\n6. Revise weak arguments in Section II and III with suggested authorities\n\nWith these revisions, this motion could achieve an A- grade and significantly improve likelihood of success. The foundation is strong - focus on accuracy, completeness, and strengthening weak arguments.'
      };

      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
      toast.success('Analysis complete!');
    }, 3000);
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 dark:text-green-400';
    if (grade.startsWith('B')) return 'text-blue-600 dark:text-blue-400';
    if (grade.startsWith('C')) return 'text-yellow-600 dark:text-yellow-400';
    if (grade.startsWith('D')) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      default: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700';
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 70) return 'bg-green-500';
    if (strength >= 50) return 'bg-yellow-500';
    if (strength >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Review & Analyzer</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered legal document critique and grading system for attorney-composed court documents
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Gavel className="w-5 h-5 mr-2" />
          Attorney Tool
        </Badge>
      </div>

      {/* Feature Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Professional Document Review</AlertTitle>
        <AlertDescription>
          Upload any court document (motion, brief, pleading) for comprehensive AI analysis. Identifies errors, weak arguments,
          false information, legalese issues, and provides specific suggestions for strengthening your case.
        </AlertDescription>
      </Alert>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Document for Review
          </CardTitle>
          <CardDescription>
            Upload a PDF, DOCX, or TXT file, or paste your document text below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-primary transition-colors">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.txt,.docx"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF, DOCX, or TXT (max 10MB)
                </p>
              </div>
              {uploadedFile && (
                <Badge variant="outline" className="mt-2">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {uploadedFile.name}
                </Badge>
              )}
            </label>
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Or Paste Document Text</label>
            <Textarea
              placeholder="Paste your court document text here for analysis..."
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          {/* Analyze Button */}
          <Button
            onClick={analyzeDocument}
            disabled={isAnalyzing || (!documentText && !uploadedFile)}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Brain className="w-5 h-5 mr-2 animate-pulse" />
                Analyzing Document...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze Document
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Overall Grade Card */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Analysis Results</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Overall Grade */}
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getGradeColor(analysisResult.overallGrade)}`}>
                    {analysisResult.overallGrade}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Overall Grade</p>
                  <p className="text-2xl font-semibold mt-1">{analysisResult.overallScore}/100</p>
                </div>

                {/* Score Breakdown */}
                <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Argument Strength</span>
                      <span className="text-sm font-bold">{analysisResult.strengthScore}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${analysisResult.strengthScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Clarity</span>
                      <span className="text-sm font-bold">{analysisResult.clarityScore}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${analysisResult.clarityScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Accuracy</span>
                      <span className="text-sm font-bold">{analysisResult.accuracyScore}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${analysisResult.accuracyScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Legal Writing</span>
                      <span className="text-sm font-bold">{analysisResult.legalWritingScore}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${analysisResult.legalWritingScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Executive Summary */}
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() => toggleSection('summary')}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Executive Summary
                </CardTitle>
                {expandedSections.has('summary') ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </CardHeader>
            {expandedSections.has('summary') && (
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{analysisResult.summary}</p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Critical Errors */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader
              className="cursor-pointer bg-red-50 dark:bg-red-950/20"
              onClick={() => toggleSection('errors')}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <XCircle className="w-5 h-5" />
                  Critical Errors & Issues ({analysisResult.criticalErrors.length})
                </CardTitle>
                {expandedSections.has('errors') ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </CardHeader>
            {expandedSections.has('errors') && (
              <CardContent className="space-y-4 pt-6">
                {analysisResult.criticalErrors.map((error, index) => (
                  <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(error.severity)}>
                          {error.severity.toUpperCase()}
                        </Badge>
                        <span className="font-semibold">{error.type}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {error.location}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{error.description}</p>
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md p-3 mt-2">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error.suggestion}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Weak Arguments */}
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader
              className="cursor-pointer bg-orange-50 dark:bg-orange-950/20"
              onClick={() => toggleSection('weak')}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <TrendingDown className="w-5 h-5" />
                  Weak Arguments ({analysisResult.weakArguments.length})
                </CardTitle>
                {expandedSections.has('weak') ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </CardHeader>
            {expandedSections.has('weak') && (
              <CardContent className="space-y-4 pt-6">
                {analysisResult.weakArguments.map((arg, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-semibold mb-1">{arg.argument}</p>
                        <Badge variant="outline" className="text-xs">{arg.location}</Badge>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold" style={{ color: arg.strength < 50 ? '#ef4444' : '#f59e0b' }}>
                          {arg.strength}%
                        </div>
                        <p className="text-xs text-muted-foreground">Strength</p>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                      <div
                        className={getStrengthColor(arg.strength) + ' h-2 rounded-full'}
                        style={{ width: `${arg.strength}%` }}
                      />
                    </div>

                    <Alert variant="destructive" className="mb-3">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{arg.weakness}</AlertDescription>
                    </Alert>

                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{arg.suggestion}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* False Information */}
          {analysisResult.falseInformation.length > 0 && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader
                className="cursor-pointer bg-red-50 dark:bg-red-950/20"
                onClick={() => toggleSection('false')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    False or Inaccurate Information ({analysisResult.falseInformation.length})
                  </CardTitle>
                  {expandedSections.has('false') ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.has('false') && (
                <CardContent className="space-y-4 pt-6">
                  {analysisResult.falseInformation.map((item, index) => (
                    <div key={index} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-950/10 rounded-r-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-red-700 dark:text-red-400">Inaccurate Claim</span>
                        <Badge variant="outline" className="text-xs">{item.location}</Badge>
                      </div>
                      <p className="text-sm mb-2 line-through text-muted-foreground">{item.claim}</p>
                      <Alert variant="destructive" className="mb-2">
                        <AlertDescription className="text-xs">{item.issue}</AlertDescription>
                      </Alert>
                      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                        <p className="text-sm font-medium text-green-800 dark:text-green-300 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{item.correction}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          )}

          {/* Legal Writing Issues */}
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() => toggleSection('writing')}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Legal Writing & Style Issues ({analysisResult.legalWritingIssues.length})
                </CardTitle>
                {expandedSections.has('writing') ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </CardHeader>
            {expandedSections.has('writing') && (
              <CardContent className="space-y-4 pt-6">
                {analysisResult.legalWritingIssues.map((issue, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">{issue.type}</h4>
                    <div className="space-y-2 mb-3">
                      {issue.examples.map((example, i) => (
                        <p key={i} className="text-sm text-muted-foreground pl-4 border-l-2 border-yellow-400">
                          {example}
                        </p>
                      ))}
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        💡 {issue.suggestion}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Strengthening Suggestions */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader
              className="cursor-pointer bg-blue-50 dark:bg-blue-950/20"
              onClick={() => toggleSection('strengthen')}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <TrendingUp className="w-5 h-5" />
                  Strengthening Suggestions ({analysisResult.strengtheningSuggestions.length})
                </CardTitle>
                {expandedSections.has('strengthen') ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </CardHeader>
            {expandedSections.has('strengthen') && (
              <CardContent className="space-y-4 pt-6">
                {analysisResult.strengtheningSuggestions.map((suggestion, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold">{suggestion.area}</h4>
                      <Badge
                        variant={suggestion.impact === 'high' ? 'default' : 'outline'}
                        className={suggestion.impact === 'high' ? 'bg-green-600' : ''}
                      >
                        {suggestion.impact.toUpperCase()} IMPACT
                      </Badge>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 mb-3">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Current State:</span> {suggestion.currentState}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300 flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{suggestion.suggestion}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Missing Arguments */}
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader
              className="cursor-pointer bg-purple-50 dark:bg-purple-950/20"
              onClick={() => toggleSection('missing')}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <Target className="w-5 h-5" />
                  Missing Arguments ({analysisResult.missingArguments.length})
                </CardTitle>
                {expandedSections.has('missing') ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </CardHeader>
            {expandedSections.has('missing') && (
              <CardContent className="space-y-4 pt-6">
                {analysisResult.missingArguments.map((arg, index) => (
                  <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{arg.argument}</h4>
                      <Badge
                        variant={arg.priority === 'critical' ? 'destructive' : 'outline'}
                        className={arg.priority === 'critical' ? '' : arg.priority === 'important' ? 'border-orange-500 text-orange-700' : ''}
                      >
                        {arg.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{arg.reason}</p>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Suggested Documents */}
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader
              className="cursor-pointer bg-green-50 dark:bg-green-950/20"
              onClick={() => toggleSection('documents')}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <FileSearch className="w-5 h-5" />
                  Suggested Additional Documents ({analysisResult.suggestedDocuments.length})
                </CardTitle>
                {expandedSections.has('documents') ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </CardHeader>
            {expandedSections.has('documents') && (
              <CardContent className="space-y-4 pt-6">
                {analysisResult.suggestedDocuments.map((doc, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:border-green-500 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        {doc.documentType}
                      </h4>
                      <Badge
                        variant={doc.priority === 'high' ? 'default' : 'outline'}
                        className={doc.priority === 'high' ? 'bg-green-600' : doc.priority === 'medium' ? 'border-yellow-500 text-yellow-700' : ''}
                      >
                        {doc.priority.toUpperCase()} PRIORITY
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{doc.purpose}</p>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button variant="outline" size="lg" className="flex-1">
              <Download className="w-5 h-5 mr-2" />
              Export Full Report (PDF)
            </Button>
            <Button size="lg" className="flex-1">
              <Sparkles className="w-5 h-5 mr-2" />
              Analyze Another Document
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}