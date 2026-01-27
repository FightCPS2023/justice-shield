import { Card } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import { 
  Brain, 
  FileText, 
  Upload, 
  CheckCircle2, 
  ArrowRight,
  Scale,
  Shield,
  Sparkles,
  Info
} from "lucide-react";

export function AIIntegrationGuide() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-6 h-6 text-primary" />
          <div>AI Analysis & Document Generation Guide</div>
        </div>
        <p className="text-sm text-muted-foreground">
          Learn how AI analyzes your documents and enhances your court filings
        </p>
      </div>

      {/* Overview */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">
          AI-Powered Case Analysis
        </AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          Every document you upload is automatically analyzed by AI to identify violations, extract case law, 
          find key facts, and generate defense strategies. These insights are then automatically integrated 
          into your court documents.
        </AlertDescription>
      </Alert>

      {/* The AI Pipeline */}
      <Card className="p-6">
        <div className="mb-4">
          <div className="text-sm mb-2">The AI Analysis Pipeline</div>
          <p className="text-xs text-muted-foreground">
            How your documents flow through AI analysis
          </p>
        </div>

        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge>Step 1</Badge>
                <span className="text-sm">Upload Document</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload CPS reports, court orders, case plans, emails, or any case-related documents. 
                AI supports PDF, DOCX, TXT, and images with OCR.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-2" />
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-purple-600">Step 2</Badge>
                <span className="text-sm">AI Analysis</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                AI immediately analyzes the document and extracts:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-start gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Violations (24 types)</span>
                </div>
                <div className="flex items-start gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Case law citations</span>
                </div>
                <div className="flex items-start gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Key dates & events</span>
                </div>
                <div className="flex items-start gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Defense strategies</span>
                </div>
                <div className="flex items-start gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Case numbers & names</span>
                </div>
                <div className="flex items-start gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Risk assessment</span>
                </div>
                <div className="flex items-start gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Recommended actions</span>
                </div>
                <div className="flex items-start gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Legal standards</span>
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-2" />
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-green-600">Step 3</Badge>
                <span className="text-sm">Auto-Population</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                AI findings are automatically added to your case:
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-green-600" />
                  <span className="text-muted-foreground"><strong>Violations tab</strong> - Auto-checked violations</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-green-600" />
                  <span className="text-muted-foreground"><strong>Timeline tab</strong> - Auto-added events</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-green-600" />
                  <span className="text-muted-foreground"><strong>Defense Strategy</strong> - AI recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-green-600" />
                  <span className="text-muted-foreground"><strong>Document storage</strong> - Analysis saved with doc</span>
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-2" />
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-blue-600">Step 4</Badge>
                <span className="text-sm">Document Generation</span>
              </div>
              <p className="text-xs text-muted-foreground">
                When you generate court documents, AI enhancement is automatically enabled. Your motions, 
                affidavits, and legal filings include case law, evidence, and arguments extracted from 
                ALL your uploaded documents.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* What AI Finds */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-primary" />
          <div>What AI Discovers in Your Documents</div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-red-600" />
              <div className="text-sm">24 Types of Violations</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>• Constitutional violations (4th, 14th Amendment)</div>
              <div>• Procedural violations (notice, deadlines)</div>
              <div>• Evidence issues (hearsay, fabrication)</div>
              <div>• Rights denials (counsel, visitation)</div>
              <div>• Service failures (no reasonable efforts)</div>
              <div>• Placement issues (separation, relatives)</div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-5 h-5 text-blue-600" />
              <div className="text-sm">Modern Case Law (2020-2025)</div>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>• Caniglia v. Strom (2021) - Warrantless entry limits</div>
              <div>• Lange v. California (2021) - Hot pursuit limits</div>
              <div>• Gates v. Texas DFPS (2022) - Qualified immunity limits</div>
              <div>• Plus 50+ relevant Supreme Court & Circuit Court cases</div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <div className="text-sm">Defense Strategies</div>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>• Challenge predictive algorithms & AI risk tools</div>
              <div>• File Daubert motions for expert testimony</div>
              <div>• Constitutional challenges (strict scrutiny)</div>
              <div>• FOIA requests for complete records</div>
              <div>• §1983 civil rights claims</div>
              <div>• Evidence suppression strategies</div>
            </div>
          </div>
        </div>
      </Card>

      {/* How AI Enhances Documents */}
      <Card className="p-6 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <div className="text-purple-900 dark:text-purple-100">
            How AI Enhances Your Court Documents
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <div className="font-medium mb-2 text-purple-900 dark:text-purple-100">Motion to Dismiss</div>
            <div className="space-y-1 text-purple-800 dark:text-purple-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Incorporates case law from analyzed documents in "Insufficient Evidence" section</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Uses your timeline events as factual foundation</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Cites relevant constitutional violations found by AI</span>
              </div>
            </div>
          </div>

          <div>
            <div className="font-medium mb-2 text-purple-900 dark:text-purple-100">Motion to Suppress</div>
            <div className="space-y-1 text-purple-800 dark:text-purple-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Adds Fourth Amendment case law discovered in your documents</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Includes warrantless search precedents from AI analysis</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Cites specific illegal entry case law</span>
              </div>
            </div>
          </div>

          <div>
            <div className="font-medium mb-2 text-purple-900 dark:text-purple-100">Affidavit</div>
            <div className="space-y-1 text-purple-800 dark:text-purple-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Adds AI-identified CPS failures in "Lack of Reasonable Efforts" section</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Includes recommended actions from document analysis</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Auto-numbers paragraphs based on violations and timeline</span>
              </div>
            </div>
          </div>

          <div>
            <div className="font-medium mb-2 text-purple-900 dark:text-purple-100">All Documents</div>
            <div className="space-y-1 text-purple-800 dark:text-purple-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Proper court captions with your case information</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Professional legal formatting and structure</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Evidence-based arguments from YOUR uploaded documents</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-6 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-green-600" />
          <div className="text-green-900 dark:text-green-100">
            Tips for Maximum AI Benefits
          </div>
        </div>

        <div className="space-y-3 text-sm text-green-800 dark:text-green-200">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 text-xs">1</div>
            <div>
              <div className="font-medium">Upload Documents First</div>
              <div className="text-xs">Upload all your CPS documents BEFORE generating court filings. More documents = better AI analysis.</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 text-xs">2</div>
            <div>
              <div className="font-medium">Check Violations Tab</div>
              <div className="text-xs">Review auto-detected violations after upload. Add any AI missed, remove false positives.</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 text-xs">3</div>
            <div>
              <div className="font-medium">Review Timeline</div>
              <div className="text-xs">AI auto-populates timeline events. Edit for accuracy and add context.</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 text-xs">4</div>
            <div>
              <div className="font-medium">Keep AI Enhancement ON</div>
              <div className="text-xs">The toggle in Document Generator should stay ON for AI-enhanced documents with case law citations.</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 text-xs">5</div>
            <div>
              <div className="font-medium">Review AI Summary</div>
              <div className="text-xs">Check the "AI Analysis Summary" card before generating documents to see what AI found.</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 text-xs">6</div>
            <div>
              <div className="font-medium">Attorney Review Required</div>
              <div className="text-xs">AI provides excellent foundation, but ALWAYS have attorney review before filing.</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Legal Disclaimer */}
      <Alert variant="default" className="border-red-200 bg-red-50 dark:bg-red-950/20">
        <AlertCircle className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800 dark:text-red-200 text-xs">
          <strong>IMPORTANT:</strong> AI analysis is for educational and research purposes only. It does not 
          constitute legal advice. All AI-generated content must be reviewed, verified, and customized by a 
          licensed attorney in your jurisdiction before use in legal proceedings. The accuracy of AI analysis 
          depends on the quality and completeness of uploaded documents.
        </AlertDescription>
      </Alert>
    </div>
  );
}
