import { Card } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { 
  Scale, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Gavel,
  ClipboardCheck,
  BookOpen,
  Info
} from "lucide-react";
import { Badge } from "./ui/badge";

export function CourtFilingGuide() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-6 h-6 text-primary" />
          <div>Court Filing Requirements Guide</div>
        </div>
        <p className="text-sm text-muted-foreground">
          Essential information about properly filing court documents in CPS cases
        </p>
      </div>

      {/* Critical Warning */}
      <Alert variant="default" className="border-red-200 bg-red-50 dark:bg-red-950/20">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <AlertTitle className="text-red-900 dark:text-red-100">
          CRITICAL: Attorney Review Required
        </AlertTitle>
        <AlertDescription className="text-red-800 dark:text-red-200">
          <strong>DO NOT file any court documents without attorney review.</strong> This guide and the generated documents are for educational purposes only. Improper filing can seriously harm your case. Always consult with a licensed attorney in your jurisdiction before filing any documents with the court.
        </AlertDescription>
      </Alert>

      {/* Court Document Basics */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gavel className="w-5 h-5 text-primary" />
          <div>Understanding Court Documents</div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm mb-2">What Makes a Court Document Official?</div>
            <p className="text-sm text-muted-foreground mb-3">
              Court documents must follow specific formatting and procedural requirements to be accepted by the court. These requirements vary by jurisdiction but generally include:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Case Caption:</strong> The heading that identifies the court, case number, parties, and document type</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Proper Formatting:</strong> Margins, font size, line spacing, and page numbering as required by local rules</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Signature Block:</strong> Your signature, name, address, and contact information</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Certificate of Service:</strong> Proof that you served copies on all other parties</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Supporting Evidence:</strong> Affidavits, exhibits, and documentation supporting your claims</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Filing Process */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardCheck className="w-5 h-5 text-primary" />
          <div>Court Filing Process</div>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          <AccordionItem value="step1" className="border rounded-lg px-4">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Badge>Step 1</Badge>
                <span>Prepare Your Document</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-3">
              <div className="text-sm space-y-2">
                <p className="font-medium">Before Filing:</p>
                <ul className="space-y-2 ml-4 text-muted-foreground">
                  <li>• Generate document using the Document Generator</li>
                  <li>• Fill in all required information (name, case number, facts, etc.)</li>
                  <li>• Have attorney review and customize for your specific case</li>
                  <li>• Verify all statements are true and accurate</li>
                  <li>• Check local court rules for specific formatting requirements</li>
                  <li>• Print on clean white paper (usually required)</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="step2" className="border rounded-lg px-4">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Badge>Step 2</Badge>
                <span>Gather Supporting Documents</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-3">
              <div className="text-sm space-y-2">
                <p className="font-medium">Collect Evidence:</p>
                <ul className="space-y-2 ml-4 text-muted-foreground">
                  <li>• Your sworn affidavit (must be notarized)</li>
                  <li>• Copies of CPS reports and documents</li>
                  <li>• Timeline of events</li>
                  <li>• Photos, texts, emails proving your claims</li>
                  <li>• Character reference letters</li>
                  <li>• Proof of services completed</li>
                  <li>• Any evidence contradicting CPS allegations</li>
                  <li>• Medical records, police reports, etc. if relevant</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="step3" className="border rounded-lg px-4">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Badge>Step 3</Badge>
                <span>Make Copies</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-3">
              <div className="text-sm space-y-2">
                <p className="font-medium">Number of Copies Needed:</p>
                <ul className="space-y-2 ml-4 text-muted-foreground">
                  <li>• <strong>Original for the Court</strong> - Usually signed in blue ink to distinguish from copies</li>
                  <li>• <strong>One copy for CPS attorney</strong></li>
                  <li>• <strong>One copy for Guardian ad Litem</strong> (if appointed)</li>
                  <li>• <strong>One copy for your attorney</strong> (if represented)</li>
                  <li>• <strong>One copy for your records</strong></li>
                  <li>• Check local rules - some courts may require additional copies</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="step4" className="border rounded-lg px-4">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Badge>Step 4</Badge>
                <span>File With the Court</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-3">
              <div className="text-sm space-y-3">
                <div>
                  <p className="font-medium mb-2">Filing Options:</p>
                  <div className="space-y-2 ml-4 text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground">In Person:</p>
                      <ul className="space-y-1 mt-1">
                        <li>• Go to court clerk's office during business hours</li>
                        <li>• Bring all copies and original</li>
                        <li>• Clerk will stamp all copies with filing date</li>
                        <li>• Pay filing fee (may be waived if indigent)</li>
                        <li>• Get file-stamped copy for your records</li>
                      </ul>
                    </div>
                    <div className="pt-2">
                      <p className="font-medium text-foreground">By Mail:</p>
                      <ul className="space-y-1 mt-1">
                        <li>• Send original and required copies</li>
                        <li>• Include filing fee or fee waiver request</li>
                        <li>• Include self-addressed stamped envelope for file-stamped copy</li>
                        <li>• Use certified mail with return receipt</li>
                        <li>• Check local rules - not all courts accept mail filing</li>
                      </ul>
                    </div>
                    <div className="pt-2">
                      <p className="font-medium text-foreground">Electronic Filing (E-Filing):</p>
                      <ul className="space-y-1 mt-1">
                        <li>• Some courts require or allow electronic filing</li>
                        <li>• You'll need to register for e-filing system</li>
                        <li>• Upload PDF of your document</li>
                        <li>• Pay filing fee online</li>
                        <li>• You'll receive email confirmation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="step5" className="border rounded-lg px-4">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Badge>Step 5</Badge>
                <span>Serve Other Parties</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-3">
              <div className="text-sm space-y-2">
                <p className="font-medium">Service of Process:</p>
                <p className="text-muted-foreground mb-2">
                  You MUST provide copies to all other parties in the case. This is called "service." Methods include:
                </p>
                <ul className="space-y-2 ml-4 text-muted-foreground">
                  <li>• <strong>Personal Service:</strong> Have someone over 18 (not you) hand-deliver copies</li>
                  <li>• <strong>Certified Mail:</strong> Send via certified mail, return receipt requested</li>
                  <li>• <strong>Email:</strong> If parties have agreed or court rules allow</li>
                  <li>• <strong>Attorney Service:</strong> If parties have attorneys, serve the attorneys</li>
                </ul>
                <Alert className="mt-3">
                  <Info className="w-4 h-4" />
                  <AlertDescription className="text-xs">
                    Keep proof of service! You'll need to file a Certificate of Service showing when and how you served the documents.
                  </AlertDescription>
                </Alert>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="step6" className="border rounded-lg px-4">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Badge>Step 6</Badge>
                <span>Follow Up</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-3">
              <div className="text-sm space-y-2">
                <p className="font-medium">After Filing:</p>
                <ul className="space-y-2 ml-4 text-muted-foreground">
                  <li>• Note the file-stamped date on your copy</li>
                  <li>• Track any deadlines for responses or hearings</li>
                  <li>• Check court docket/schedule for hearing dates</li>
                  <li>• Respond to any orders or requests from the court</li>
                  <li>• Prepare for hearing on your motion</li>
                  <li>• Coordinate with your attorney</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Common Filing Mistakes */}
      <Card className="p-6 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <div className="text-amber-900 dark:text-amber-100">
            Common Filing Mistakes to Avoid
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
            <div>
              <div className="font-medium text-amber-900 dark:text-amber-100">Filing Without Attorney Review</div>
              <div className="text-amber-800 dark:text-amber-200">
                This is the #1 mistake. Even if you're representing yourself, have an attorney review your documents before filing. Many bar associations offer free brief advice.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
            <div>
              <div className="font-medium text-amber-900 dark:text-amber-100">Wrong Court or Wrong Caption</div>
              <div className="text-amber-800 dark:text-amber-200">
                Make sure you're filing in the correct court and using the exact case caption (case number, names, etc.) from existing court documents.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
            <div>
              <div className="font-medium text-amber-900 dark:text-amber-100">Failing to Serve Other Parties</div>
              <div className="text-amber-800 dark:text-amber-200">
                You must serve copies on all parties and file proof of service. Failure to do so can result in your motion being denied without consideration.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
            <div>
              <div className="font-medium text-amber-900 dark:text-amber-100">Vague or Unsupported Claims</div>
              <div className="text-amber-800 dark:text-amber-200">
                Every claim must be specific with dates, facts, and supporting evidence. Saying "CPS violated my rights" is not enough - you must say exactly what happened, when, and who was involved.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">5</div>
            <div>
              <div className="font-medium text-amber-900 dark:text-amber-100">Missing Deadlines</div>
              <div className="text-amber-800 dark:text-amber-200">
                Court deadlines are strict. Missing a deadline can waive your rights. File as early as possible and track all deadlines carefully.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">6</div>
            <div>
              <div className="font-medium text-amber-900 dark:text-amber-100">Emotional or Unprofessional Language</div>
              <div className="text-amber-800 dark:text-amber-200">
                Court documents must be professional and factual. Avoid emotional language, name-calling, or excessive punctuation. Stick to facts and law.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">7</div>
            <div>
              <div className="font-medium text-amber-900 dark:text-amber-100">Forgetting to Sign</div>
              <div className="text-amber-800 dark:text-amber-200">
                All documents must be signed. For affidavits, signature must be notarized. Some documents require original signatures (not copies).
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* State-Specific Requirements */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-primary" />
          <div>State-Specific Filing Requirements</div>
        </div>

        <div className="space-y-3 text-sm">
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              <strong>Important:</strong> Every state and even every county can have different rules for filing court documents. You MUST check your local rules. These are usually available online or at the court clerk's office.
            </AlertDescription>
          </Alert>

          <div className="space-y-2 text-muted-foreground">
            <p>Common variations by state include:</p>
            <ul className="space-y-1 ml-4">
              <li>• Required margin sizes and spacing</li>
              <li>• Page number placement</li>
              <li>• Font type and size requirements</li>
              <li>• Whether line numbers are required</li>
              <li>• Certificate of service format</li>
              <li>• Filing fees and fee waiver procedures</li>
              <li>• Time limits for filing motions</li>
              <li>• Requirements for exhibits and attachments</li>
            </ul>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
            <div className="font-medium mb-2">How to Find Your Local Rules:</div>
            <ol className="space-y-1 ml-4 text-muted-foreground">
              <li>1. Search online for "[Your County] [Your State] court rules" or "local court rules"</li>
              <li>2. Visit your court's website and look for "Forms" or "Rules"</li>
              <li>3. Call the court clerk's office and ask for filing requirements</li>
              <li>4. Visit the law library at your courthouse</li>
              <li>5. Ask your attorney for local rule requirements</li>
            </ol>
          </div>
        </div>
      </Card>

      {/* Document Types */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <div>Types of Court Documents</div>
        </div>

        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="font-medium mb-2">Motion to Dismiss</div>
            <p className="text-sm text-muted-foreground mb-2">
              Asks the court to dismiss the case against you. This is appropriate when:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• CPS has no legal basis for the case</li>
              <li>• Your constitutional rights were violated</li>
              <li>• CPS failed to follow required procedures</li>
              <li>• There's insufficient evidence to proceed</li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="font-medium mb-2">Motion to Suppress Evidence</div>
            <p className="text-sm text-muted-foreground mb-2">
              Asks the court to exclude evidence that was illegally obtained. File this when:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• CPS entered your home without consent or warrant</li>
              <li>• Evidence was obtained through Fourth Amendment violation</li>
              <li>• Statements were coerced or obtained improperly</li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="font-medium mb-2">Motion for Return of Children</div>
            <p className="text-sm text-muted-foreground mb-2">
              Requests immediate return of your children. Strongest when:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• CPS failed to make reasonable efforts</li>
              <li>• No present danger exists</li>
              <li>• You've completed all requirements</li>
              <li>• Removal was improper from the start</li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="font-medium mb-2">Affidavit</div>
            <p className="text-sm text-muted-foreground mb-2">
              Your sworn testimony in written form. Must be notarized. Critical for:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Stating facts under oath</li>
              <li>• Documenting violations of your rights</li>
              <li>• Presenting your version of events</li>
              <li>• Supporting other motions and filings</li>
            </ul>
            <Alert className="mt-2">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-xs">
                <strong>Warning:</strong> Everything in an affidavit must be 100% true. False statements in an affidavit constitute perjury and can result in criminal charges.
              </AlertDescription>
            </Alert>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="font-medium mb-2">Discovery Requests</div>
            <p className="text-sm text-muted-foreground mb-2">
              Formal requests for CPS to provide documents and information. Essential for:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Getting complete CPS case file</li>
              <li>• Obtaining investigation records</li>
              <li>• Finding evidence to support your defense</li>
              <li>• Discovering CPS's evidence against you</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Additional Resources */}
      <Card className="p-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-blue-600" />
          <div className="text-blue-900 dark:text-blue-100">
            Where to Get Help
          </div>
        </div>

        <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <div className="font-medium mb-1">Free Legal Assistance:</div>
            <ul className="space-y-1 ml-4">
              <li>• Legal Aid organizations in your area</li>
              <li>• Law school legal clinics</li>
              <li>• State Bar Association pro bono programs</li>
              <li>• Court-appointed attorneys (if qualified)</li>
            </ul>
          </div>

          <div>
            <div className="font-medium mb-1">Court Resources:</div>
            <ul className="space-y-1 ml-4">
              <li>• Court clerk's office (for procedural questions only)</li>
              <li>• Court self-help center or family law facilitator</li>
              <li>• Courthouse law library</li>
              <li>• Court website forms and instructions</li>
            </ul>
          </div>

          <div>
            <div className="font-medium mb-1">Parent Support:</div>
            <ul className="space-y-1 ml-4">
              <li>• Parent advocacy organizations</li>
              <li>• Family defense centers</li>
              <li>• Online parent support groups</li>
              <li>• CPS ombudsman office</li>
            </ul>
          </div>

          <Alert className="mt-3 border-blue-300 bg-blue-100 dark:bg-blue-900/30">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200 text-xs">
              Remember: Court clerks can answer procedural questions (like "Where do I file this?") but cannot give legal advice (like "Should I file this?"). For legal advice, you need an attorney.
            </AlertDescription>
          </Alert>
        </div>
      </Card>
    </div>
  );
}
