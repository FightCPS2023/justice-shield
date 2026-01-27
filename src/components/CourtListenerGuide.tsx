import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { 
  BookOpen, 
  Database, 
  Headphones, 
  FileText, 
  Scale, 
  ExternalLink,
  CheckCircle,
  Sparkles,
  Download,
  Search,
  Users,
  Calendar,
  Info
} from 'lucide-react';

export function CourtListenerGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2">
          <Database className="size-6" />
          CourtListener Integration Guide
        </h2>
        <p className="text-muted-foreground mt-2">
          Learn how to access millions of court opinions, dockets, and oral arguments to build your CPS defense
        </p>
      </div>

      <Alert>
        <Sparkles className="size-4" />
        <AlertDescription>
          <strong>Free Legal Research Database:</strong> CourtListener provides free access to over 50 million court opinions, 
          millions of dockets, and the largest collection of oral argument recordings on the Internet. All data is provided 
          by the non-profit Free Law Project.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="opinions">Opinions</TabsTrigger>
          <TabsTrigger value="dockets">Dockets</TabsTrigger>
          <TabsTrigger value="audio">Oral Arguments</TabsTrigger>
          <TabsTrigger value="pacer">PACER Tracking</TabsTrigger>
          <TabsTrigger value="howto">How to Use</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>What is CourtListener?</CardTitle>
              <CardDescription>
                The nation's most comprehensive free legal research platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  CourtListener is a free legal research website containing millions of legal opinions from federal 
                  and state courts. It is sponsored by the non-profit Free Law Project and has been providing these 
                  services for over a decade.
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border-2">
                    <CardHeader>
                      <FileText className="size-8 mb-2 text-blue-600" />
                      <CardTitle className="text-lg">50M+ Opinions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Written court decisions from all federal courts and all 50 state supreme courts
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader>
                      <Scale className="size-8 mb-2 text-green-600" />
                      <CardTitle className="text-lg">Millions of Dockets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Active case files with filings, parties, attorneys, and court orders
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader>
                      <Headphones className="size-8 mb-2 text-purple-600" />
                      <CardTitle className="text-lg">Oral Arguments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Largest collection of oral argument audio recordings available online
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Coverage:</p>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span>U.S. Supreme Court (1754-present)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span>All Federal Circuit Courts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span>All Federal District Courts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span>All 50 State Supreme Courts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span>Many State Appellate Courts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span>Bankruptcy Courts</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OPINIONS TAB */}
        <TabsContent value="opinions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" />
                Court Opinions Database
              </CardTitle>
              <CardDescription>
                50+ million written court decisions searchable by keyword, citation, or case name
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What's Included:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="size-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>Full Text:</strong> Complete opinion text with citations, holdings, and reasoning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="size-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>Citations:</strong> Official case citations (e.g., "189 F.3d 808")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="size-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>Judge Information:</strong> Who wrote the opinion and who joined</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="size-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>Date Filed:</strong> When the decision was issued</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="size-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>PDF Downloads:</strong> Download official court documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="size-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>HTML with Citations:</strong> Read online with hyperlinked citations</span>
                  </li>
                </ul>
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <p className="text-sm font-medium mb-2">Example CPS Searches:</p>
                <div className="space-y-1 text-sm font-mono">
                  <p>• "child protective services fourth amendment warrantless"</p>
                  <p>• "parental rights due process termination"</p>
                  <p>• "ICWA notice requirements tribal intervention"</p>
                  <p>• "reasonable efforts ASFA timeline violation"</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Search by:</h3>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <Badge variant="outline">Keywords</Badge>
                  <Badge variant="outline">Case Name</Badge>
                  <Badge variant="outline">Citation</Badge>
                  <Badge variant="outline">Court</Badge>
                  <Badge variant="outline">Date Range</Badge>
                  <Badge variant="outline">Judge Name</Badge>
                  <Badge variant="outline">Nature of Suit</Badge>
                  <Badge variant="outline">Party Name</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCKETS TAB */}
        <TabsContent value="dockets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="size-5" />
                Dockets Database
              </CardTitle>
              <CardDescription>
                Track active cases with complete filing histories and party information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What's a Docket?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  A docket is the official record of all proceedings in a court case. It contains every filing, 
                  motion, order, and hearing date. Think of it as the case's complete history and current status.
                </p>

                <h3 className="font-semibold mb-2">Docket Information Includes:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="size-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>Case Name:</strong> Full parties (e.g., "Jane Doe v. Department of Children Services")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="size-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>Docket Number:</strong> Official case number (e.g., "1:16-cv-00745")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="size-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>Assigned Judge:</strong> Who is presiding over the case</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="size-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>Filing Dates:</strong> Date filed, last filing, termination date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="size-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>Nature of Suit:</strong> Type of legal claim</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="size-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>Jurisdiction:</strong> Why this court has authority</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="size-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span><strong>PACER Links:</strong> Access to federal court documents</span>
                  </li>
                </ul>
              </div>

              <Alert>
                <Info className="size-4" />
                <AlertDescription>
                  <strong>Use Dockets To:</strong> Track your own case, research how similar cases proceeded, 
                  see successful strategies, find out what motions were filed, and discover case outcomes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDIO TAB */}
        <TabsContent value="audio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="size-5" />
                Oral Argument Recordings
              </CardTitle>
              <CardDescription>
                Listen to actual courtroom arguments to learn persuasive legal techniques
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Why Listen to Oral Arguments?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Oral arguments are the most important moments in many cases. By listening to real arguments, 
                  you can hear how attorneys frame issues, what questions judges ask, and which arguments succeed.
                </p>

                <h3 className="font-semibold mb-2">What You Can Learn:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Headphones className="size-4 mt-0.5 text-purple-600 flex-shrink-0" />
                    <span><strong>Persuasive Techniques:</strong> How experienced attorneys argue CPS cases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Headphones className="size-4 mt-0.5 text-purple-600 flex-shrink-0" />
                    <span><strong>Judicial Questions:</strong> What concerns judges have about CPS issues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Headphones className="size-4 mt-0.5 text-purple-600 flex-shrink-0" />
                    <span><strong>Legal Framing:</strong> How to present Fourth/Fourteenth Amendment violations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Headphones className="size-4 mt-0.5 text-purple-600 flex-shrink-0" />
                    <span><strong>Responses:</strong> How to answer tough questions from the bench</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Headphones className="size-4 mt-0.5 text-purple-600 flex-shrink-0" />
                    <span><strong>Case Law Usage:</strong> How attorneys cite precedent in real arguments</span>
                  </li>
                </ul>
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <h3 className="font-semibold mb-2">Audio Features:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Download className="size-4" />
                    <span>High-quality MP3 downloads (22050Hz @ 48k bitrate)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="size-4" />
                    <span>Judge panel information and names</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>Argument dates and duration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="size-4" />
                    <span>Linked to case dockets for full context</span>
                  </div>
                </div>
              </div>

              <Alert>
                <Sparkles className="size-4" />
                <AlertDescription>
                  <strong>Pro Tip:</strong> Listen to oral arguments from cases you found in Opinion search. 
                  Hearing the argument that led to a favorable decision is incredibly valuable for understanding 
                  what worked and why.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PACER TRACKING TAB */}
        <TabsContent value="pacer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="size-5" />
                PACER Tracking
              </CardTitle>
              <CardDescription>
                Access federal court documents with PACER links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What is PACER?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  PACER (Public Access to Court Electronic Records) is a service provided by the federal courts 
                  to allow the public to access electronic case files, dockets, and other information. CourtListener 
                  provides links to PACER for federal court documents.
                </p>

                <h3 className="font-semibold mb-2">How to Use PACER Links:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Database className="size-4 mt-0.5 text-blue-600 flex-shrink-0" />
                    <span><strong>Access Documents:</strong> Click the PACER link to view or download court documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Database className="size-4 mt-0.5 text-blue-600 flex-shrink-0" />
                    <span><strong>Search Cases:</strong> Use the PACER search to find additional case information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Database className="size-4 mt-0.5 text-blue-600 flex-shrink-0" />
                    <span><strong>Track Filings:</strong> Monitor new filings and updates in your case</span>
                  </li>
                </ul>
              </div>

              <Alert>
                <Info className="size-4" />
                <AlertDescription>
                  <strong>Note:</strong> Accessing PACER documents may require a PACER account and may incur fees. 
                  CourtListener provides links for convenience, but you should verify the information with the 
                  official PACER system.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HOW TO USE TAB */}
        <TabsContent value="howto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How to Use CourtListener for Your CPS Case</CardTitle>
              <CardDescription>
                Step-by-step guide to finding and using legal research
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold mb-2">Step 1: Identify Your Violations</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Go to the "Violations" section and check all violations that apply to your case. 
                  This will help us recommend the most relevant case law.
                </p>
                <Badge>Required</Badge>
              </div>

              {/* Step 2 */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold mb-2">Step 2: Search for Opinions</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Use the "Case Law" tab to search for court opinions. Start with recommended cases 
                  for your violations, then use Live API Search for additional cases.
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">Recommended Cases</Badge>
                  <Badge variant="outline">Live API Search</Badge>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold mb-2">Step 3: Copy Citations</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  When you find relevant cases, click "Copy Citation" to save the official citation. 
                  You'll use these citations in your motions and court filings.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Example: "Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)"
                </p>
              </div>

              {/* Step 4 */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold mb-2">Step 4: Read Full Opinions</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Click "Read Full Opinion" to see the complete court decision. Understanding the 
                  reasoning helps you apply the case to your situation.
                </p>
              </div>

              {/* Step 5 */}
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold mb-2">Step 5: Listen to Oral Arguments (Optional)</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  If available, listen to the oral arguments to hear how attorneys presented the case. 
                  This is especially valuable for learning courtroom strategy.
                </p>
              </div>

              {/* Step 6 */}
              <div className="border-l-4 border-pink-500 pl-4">
                <h3 className="font-semibold mb-2">Step 6: Generate Defense Strategies</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Use the "Defense Strategies" section to create specific legal arguments based on 
                  the case law you found. Include citations to strengthen your position.
                </p>
              </div>

              <Alert>
                <BookOpen className="size-4" />
                <AlertDescription>
                  <strong>Remember:</strong> CourtListener provides the research tools, but you should consult 
                  with an attorney to apply this research to your specific case. Legal research is complex and 
                  case-specific.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button asChild>
                  <a href="https://www.courtlistener.com/help/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4 mr-2" />
                    CourtListener Help Center
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://www.courtlistener.com/api/rest/v4/" target="_blank" rel="noopener noreferrer">
                    <Database className="size-4 mr-2" />
                    API Documentation
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Sparkles className="size-4" />
            <AlertDescription>
              <strong>Support Open Legal Data:</strong> CourtListener is provided by the non-profit Free Law Project. 
              Consider <a href="https://www.courtlistener.com/donate/" target="_blank" rel="noopener noreferrer" className="underline">
                donating to support
              </a> their mission to make legal research free and accessible to everyone.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}