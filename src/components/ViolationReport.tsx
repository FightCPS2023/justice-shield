import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  FileCheck, Download, Printer, Mail, Shield, AlertTriangle, 
  Scale, BookOpen, CheckCircle, ArrowRight, Sparkles, FileText, Crown
} from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { PremiumLock } from './PremiumUpgrade';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface ViolationReportProps {
  violations: any;
  documents: any[];
  timelineEvents: any[];
  caseDetails: any;
}

export function ViolationReport({ violations, documents, timelineEvents, caseDetails }: ViolationReportProps) {
  const { tier } = useSubscription();
  const [generating, setGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const violationCount = Object.values(violations).filter(Boolean).length;

  if (tier === 'free') {
    return (
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-primary" />
            Full Violation Report & Professional Case Summary
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
              Premium
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate a professional legal brief with all violations, statutes, case law, constitutional issues, and next steps.
          </p>
        </div>

        <PremiumLock 
          feature="AI-Generated Professional Legal Brief"
          description="Premium members get a comprehensive violation report including: all identified violations with case law citations, applicable statutes, constitutional violations analysis, missing evidence assessment, recommended defense strategies, and attorney-ready formatting. This report can be shared directly with your lawyer."
        />

        {/* Preview of what they'd get */}
        <Card className="p-6 bg-muted/50">
          <div className="mb-4 flex items-center gap-2 text-muted-foreground">
            <FileText className="w-5 h-5" />
            Preview: What You'll Get With Premium
          </div>
          <div className="space-y-4 opacity-60">
            <div className="border-l-4 border-primary pl-4">
              <div className="mb-2">CASE SUMMARY</div>
              <p className="text-sm text-muted-foreground">
                Comprehensive overview of your case including case number, jurisdiction, timeline, 
                and current status...
              </p>
            </div>
            <div className="border-l-4 border-destructive pl-4">
              <div className="mb-2">IDENTIFIED VIOLATIONS ({violationCount})</div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Fourth Amendment Violations - Warrantless Search/Entry</p>
                <p>• Fourteenth Amendment - Due Process Violations</p>
                <p>• ASFA Reasonable Efforts Violations</p>
                <p className="italic">...and {Math.max(0, violationCount - 3)} more</p>
              </div>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="mb-2">LEGAL BASIS & CASE LAW</div>
              <p className="text-sm text-muted-foreground">
                Detailed citations including Caniglia v. Strom (2021), Troxel v. Granville, 
                state-specific statutes...
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <div className="mb-2">RECOMMENDED ACTIONS</div>
              <p className="text-sm text-muted-foreground">
                Step-by-step legal strategy including motions to file, evidence to gather, 
                deadlines to meet...
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const generateReport = () => {
    setGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGenerating(false);
      setReportGenerated(true);
    }, 3000);
  };

  const reportSections = [
    {
      title: 'Executive Summary',
      icon: FileCheck,
      description: 'Overview of case status and critical findings',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Constitutional Violations',
      icon: Shield,
      description: `${violationCount} violations identified with case law`,
      color: 'text-destructive',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Applicable Statutes',
      icon: BookOpen,
      description: 'Federal and state laws violated by CPS',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Case Law Analysis',
      icon: Scale,
      description: 'Relevant precedents supporting your defense',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      title: 'Missing Evidence',
      icon: AlertTriangle,
      description: 'Gaps in CPS case that weaken their position',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Recommended Strategy',
      icon: CheckCircle,
      description: 'Specific next steps and filing deadlines',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <FileCheck className="w-6 h-6 text-primary" />
          Professional Legal Brief Generator
          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
            Premium
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          AI generates a comprehensive violation report with case law, statutes, and attorney-ready formatting.
        </p>
      </div>

      <Alert className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
        <Crown className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-900">Premium AI Legal Brief</AlertTitle>
        <AlertDescription className="text-amber-800">
          Based on your {documents.length} uploaded documents, {violationCount} identified violations, 
          and {timelineEvents.length} timeline events, our AI will generate a professional legal brief 
          you can share directly with your attorney.
        </AlertDescription>
      </Alert>

      {!reportGenerated ? (
        <>
          {/* What's Included */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your Report Will Include:
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {reportSections.map((section, idx) => (
                <Card key={idx} className={`p-4 ${section.bgColor} border ${section.borderColor}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <section.icon className={`w-5 h-5 ${section.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className={`mb-1 ${section.color}`}>{section.title}</div>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Card className="p-6 text-center bg-gradient-to-br from-primary/5 to-blue-50">
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <div className="text-xl mb-2">Ready to Generate Your Legal Brief?</div>
                <p className="text-sm text-muted-foreground">
                  Our AI will analyze your entire case and create a professional report in under 60 seconds.
                </p>
              </div>
              <Button 
                size="lg" 
                className="gap-2"
                onClick={generateReport}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Full Violation Report
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Analysis based on {documents.length} documents, {violationCount} violations, {timelineEvents.length} events
              </p>
            </div>
          </Card>

          {/* Case Overview */}
          <Card className="p-6">
            <div className="mb-4">Case Information</div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Case Number</div>
                <div>{caseDetails.caseNumber || 'Not provided'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">County/Jurisdiction</div>
                <div>{caseDetails.county || 'Not provided'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Documents Analyzed</div>
                <div>{documents.length} documents</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Violations Identified</div>
                <div className="flex items-center gap-2">
                  <span>{violationCount}</span>
                  {violationCount > 0 && (
                    <Badge variant="destructive">{violationCount >= 5 ? 'Critical' : 'Significant'}</Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <>
          {/* Generated Report */}
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Report Generated Successfully!</AlertTitle>
            <AlertDescription className="text-green-800">
              Your professional legal brief has been generated. Review below and share with your attorney.
            </AlertDescription>
          </Alert>

          {/* Report Preview */}
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between pb-4 border-b">
              <div>
                <div className="text-2xl mb-1">Professional Legal Brief</div>
                <p className="text-sm text-muted-foreground">
                  Generated on {new Date().toLocaleDateString()} • {violationCount} Violations Identified
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Executive Summary */}
              <div>
                <div className="mb-3 flex items-center gap-2 text-blue-600">
                  <FileCheck className="w-5 h-5" />
                  EXECUTIVE SUMMARY
                </div>
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <p className="text-sm text-blue-900 leading-relaxed">
                    This case involves significant constitutional and procedural violations by Child Protective Services. 
                    Analysis of {documents.length} case documents and {timelineEvents.length} timeline events reveals 
                    {violationCount} distinct violations of federal and state law, including violations of the Fourth 
                    Amendment (warrantless search), Fourteenth Amendment (due process), and ASFA reasonable efforts 
                    requirements. The evidence strongly suggests improper investigation procedures, falsified reports, 
                    and denial of fundamental parental rights. Immediate action is recommended to preserve rights and 
                    challenge CPS overreach.
                  </p>
                </Card>
              </div>

              {/* Constitutional Violations */}
              <div>
                <div className="mb-3 flex items-center gap-2 text-destructive">
                  <Shield className="w-5 h-5" />
                  CONSTITUTIONAL VIOLATIONS
                </div>
                <div className="space-y-3">
                  {Object.entries(violations)
                    .filter(([_, value]) => value)
                    .slice(0, 5)
                    .map(([key, _], idx) => (
                      <Card key={idx} className="p-4 border-l-4 border-destructive">
                        <div className="mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          CPS violated constitutional rights by [specific violation details based on documents].
                        </p>
                        <div className="text-xs text-muted-foreground">
                          <strong>Legal Basis:</strong> U.S. Constitution Amendment IV; Caniglia v. Strom (2021)
                        </div>
                      </Card>
                    ))}
                </div>
              </div>

              {/* Case Law Analysis */}
              <div>
                <div className="mb-3 flex items-center gap-2 text-amber-600">
                  <Scale className="w-5 h-5" />
                  APPLICABLE CASE LAW
                </div>
                <Card className="p-4 bg-amber-50 border-amber-200">
                  <ul className="space-y-2 text-sm text-amber-900">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Caniglia v. Strom (2021):</strong> SCOTUS ruled warrantless "community caretaking" 
                        exception does NOT apply to homes. Directly applicable to CPS warrantless entry.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Troxel v. Granville (2000):</strong> Parental rights are fundamental liberty 
                        interest. Government must show compelling interest and use least restrictive means.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Santosky v. Kramer (1982):</strong> Clear and convincing evidence required for 
                        termination. Hearsay and speculation insufficient.
                      </div>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Recommended Actions */}
              <div>
                <div className="mb-3 flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  RECOMMENDED IMMEDIATE ACTIONS
                </div>
                <div className="space-y-2">
                  {[
                    'File Motion to Suppress all evidence obtained through illegal search within 10 days',
                    'File Motion to Dismiss for Due Process violations and lack of reasonable efforts',
                    'Request complete case file including all emails, texts, and internal communications via FOIA',
                    'File formal complaint with CPS supervisor and state oversight agency',
                    'Gather witness statements contradicting false allegations',
                    'Document all future CPS interactions in writing with dates/times',
                    'Consult with civil rights attorney regarding §1983 lawsuit for constitutional violations'
                  ].map((action, idx) => (
                    <Card key={idx} className="p-3 bg-green-50 border-green-200">
                      <div className="flex items-start gap-3 text-sm text-green-900">
                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                          {idx + 1}
                        </div>
                        <div>{action}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Share Options */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="text-center space-y-4">
              <div>
                <div className="text-lg mb-2">Share This Report With Your Attorney</div>
                <p className="text-sm text-muted-foreground">
                  This attorney-ready report can be shared directly with your lawyer to strengthen your defense.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Email to Attorney
                </Button>
                <Button variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Copy
                </Button>
              </div>
            </div>
          </Card>

          <div className="flex justify-center">
            <Button variant="outline" onClick={() => setReportGenerated(false)}>
              Generate New Report
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
