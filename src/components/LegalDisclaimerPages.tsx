import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { 
  AlertTriangle, Shield, Scale, Info, 
  CheckCircle, GraduationCap, Briefcase, ArrowRight, ArrowLeft
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Progress } from './ui/progress';

interface LegalDisclaimerPagesProps {
  onAccept: (userType: 'parent' | 'attorney') => void;
}

export function LegalDisclaimerPages({ onAccept }: LegalDisclaimerPagesProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [userType, setUserType] = useState<'parent' | 'attorney'>('parent');
  const [understood, setUnderstood] = useState(false);
  const [noAttorneyRelationship, setNoAttorneyRelationship] = useState(false);
  const [consultAttorney, setConsultAttorney] = useState(false);
  const [attorneyAcknowledgment, setAttorneyAcknowledgment] = useState(false);

  const totalPages = userType === 'attorney' ? 6 : 5;

  useEffect(() => {
    const accepted = localStorage.getItem('cps_legal_disclaimer_accepted');
    const acceptedVersion = localStorage.getItem('cps_legal_disclaimer_version');
    const currentVersion = '2.0';
    
    if (!accepted || acceptedVersion !== currentVersion) {
      setShowModal(true);
    }
  }, []);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleAccept = () => {
    localStorage.setItem('cps_legal_disclaimer_accepted', 'true');
    localStorage.setItem('cps_legal_disclaimer_version', '2.0');
    localStorage.setItem('cps_user_type', userType);
    
    setShowModal(false);
    onAccept(userType);
  };

  const canProceed = () => {
    if (currentPage === 1) return true;
    if (currentPage === 2) return true;
    if (currentPage === 3) return true;
    if (currentPage === 4 && userType === 'attorney') return attorneyAcknowledgment;
    if (currentPage === 4 && userType === 'parent') return true;
    if (currentPage === 5 && userType === 'attorney') return true;
    if ((currentPage === 5 && userType === 'parent') || (currentPage === 6 && userType === 'attorney')) {
      return understood && noAttorneyRelationship && consultAttorney;
    }
    return false;
  };

  return (
    <Dialog open={showModal} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 md:p-8 w-[95vw] sm:w-full" onPointerDownOutside={(e) => e.preventDefault()}>
        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              Step {currentPage} of {totalPages}
            </span>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              {Math.round((currentPage / totalPages) * 100)}% Complete
            </span>
          </div>
          <Progress value={(currentPage / totalPages) * 100} className="h-2" />
        </div>

        {/* PAGE 1: USER TYPE SELECTION */}
        {currentPage === 1 && (
          <>
            <DialogHeader className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Scale className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <DialogTitle className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">Welcome to The CPS Punisher</DialogTitle>
                  <DialogDescription className="text-sm sm:text-base">
                    Before we begin, please tell us about yourself
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 sm:space-y-8 pt-2">
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <AlertTitle className="text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">User Type Selection</AlertTitle>
                <AlertDescription className="text-blue-800 dark:text-blue-200 leading-relaxed text-xs sm:text-sm">
                  Different terms and conditions apply based on your role. Please select the option that best describes you.
                  Your selection helps us provide the most relevant features and guidance.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold">I am a:</h3>
                <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'parent' | 'attorney')} className="space-y-3 sm:space-y-4">
                  {/* Parent Option */}
                  <Card 
                    className={`p-6 cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
                      userType === 'parent' ? 'border-primary border-2 bg-primary/5 shadow-sm' : 'border-2 border-transparent'
                    }`}
                    onClick={() => setUserType('parent')}
                  >
                    <div className="flex items-start gap-5">
                      <RadioGroupItem value="parent" id="parent" className="mt-1.5 w-5 h-5" />
                      <Label htmlFor="parent" className="cursor-pointer flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${userType === 'parent' ? 'bg-primary/10' : 'bg-muted'}`}>
                            <GraduationCap className={`w-6 h-6 ${userType === 'parent' ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <span className="text-xl font-semibold">Parent / Guardian / Individual</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed pl-0">
                          I am using this tool for my own personal case or to help a family member navigate 
                          the child protective services system. I need help understanding my rights, tracking 
                          my case, and developing defense strategies.
                        </p>
                      </Label>
                    </div>
                  </Card>

                  {/* Attorney Option */}
                  <Card 
                    className={`p-6 cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
                      userType === 'attorney' ? 'border-primary border-2 bg-primary/5 shadow-sm' : 'border-2 border-transparent'
                    }`}
                    onClick={() => setUserType('attorney')}
                  >
                    <div className="flex items-start gap-5">
                      <RadioGroupItem value="attorney" id="attorney" className="mt-1.5 w-5 h-5" />
                      <Label htmlFor="attorney" className="cursor-pointer flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${userType === 'attorney' ? 'bg-primary/10' : 'bg-muted'}`}>
                            <Briefcase className={`w-6 h-6 ${userType === 'attorney' ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <span className="text-xl font-semibold">Licensed Attorney</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed pl-0">
                          I am a licensed attorney using this tool for client case management, document automation, 
                          legal research assistance, and professional litigation support. I understand the professional 
                          responsibilities and ethical obligations that come with legal practice.
                        </p>
                      </Label>
                    </div>
                  </Card>
                </RadioGroup>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Your selection will customize your experience and determine which features and disclaimers are shown.
                  You can review your selection in Settings at any time.
                </p>
              </div>
            </div>
          </>
        )}

        {/* PAGE 2: MAIN LEGAL DISCLAIMER */}
        {currentPage === 2 && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <DialogTitle className="text-2xl">Legal Disclaimer</DialogTitle>
                  <DialogDescription>
                    Important information about this application
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <Alert className="bg-destructive/10 border-destructive">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertTitle className="text-destructive">CRITICAL NOTICE</AlertTitle>
                <AlertDescription className="text-destructive-foreground">
                  This application provides legal information, NOT legal advice. Please read carefully.
                </AlertDescription>
              </Alert>

              <Card className="p-6 bg-muted/50">
                <div className="mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-lg">LEGAL DISCLAIMER</span>
                </div>
                <div className="space-y-4 text-sm leading-relaxed">
                  <div className="p-4 bg-background rounded-lg border-l-4 border-destructive">
                    <p className="font-semibold mb-2">This app provides legal information, not legal advice.</p>
                    <p className="text-muted-foreground">
                      There is a critical difference between legal information (general facts about the law) 
                      and legal advice (specific guidance for your unique situation).
                    </p>
                  </div>

                  <div className="p-4 bg-background rounded-lg">
                    <p className="font-semibold mb-2">We are not attorneys</p>
                    <p className="text-muted-foreground">
                      The creators and operators of this application are not practicing attorneys and cannot 
                      provide legal advice.
                    </p>
                  </div>

                  <div className="p-4 bg-background rounded-lg">
                    <p className="font-semibold mb-2">No attorney-client relationship</p>
                    <p className="text-muted-foreground">
                      Using this app does not create an attorney-client relationship with anyone. You are not 
                      our client, and we have no professional obligations to you.
                    </p>
                  </div>

                  <div className="p-4 bg-background rounded-lg border-l-4 border-amber-500">
                    <p className="font-semibold mb-2">Educational purposes only</p>
                    <p className="text-muted-foreground">
                      All analysis, document generation, timelines, and recommendations are for educational, 
                      informational, and organizational purposes only.
                    </p>
                  </div>

                  <div className="p-4 bg-destructive/10 rounded-lg border border-destructive">
                    <p className="font-semibold mb-2 text-destructive">You must consult a licensed attorney</p>
                    <p className="text-muted-foreground">
                      For legal advice specific to your case, you must consult with a licensed attorney in your 
                      jurisdiction who can review your unique facts and circumstances.
                    </p>
                  </div>

                  <div className="p-4 bg-destructive/10 rounded-lg border border-destructive">
                    <p className="font-semibold mb-2 text-destructive">Not a substitute for legal counsel</p>
                    <p className="text-muted-foreground">
                      No output from this app should be relied upon as a substitute for formal legal counsel. 
                      Do not make legal decisions based solely on information from this app.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* PAGE 3: LIMITATIONS & ACCURACY */}
        {currentPage === 3 && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Info className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <DialogTitle className="text-2xl">Important Limitations</DialogTitle>
                  <DialogDescription>
                    Understanding the limits of this tool
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <Card className="p-6 bg-amber-50 border-amber-200">
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-lg text-amber-900">Accuracy & Completeness</span>
                </div>
                <div className="space-y-4 text-sm text-amber-900">
                  <div className="p-4 bg-white rounded-lg">
                    <p className="font-semibold mb-2">Information may not be accurate or current</p>
                    <p className="text-amber-800">
                      The information provided may contain errors, omissions, or outdated content. We cannot 
                      guarantee the accuracy or completeness of any information.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <p className="font-semibold mb-2">Laws vary by jurisdiction</p>
                    <p className="text-amber-800">
                      Laws differ significantly between states, counties, and municipalities. What applies in 
                      one jurisdiction may not apply in yours.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <p className="font-semibold mb-2">Laws change frequently</p>
                    <p className="text-amber-800">
                      Legislation, regulations, and case law change regularly. Information that was accurate 
                      yesterday may be outdated today.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <p className="font-semibold mb-2">Cannot account for your unique circumstances</p>
                    <p className="text-amber-800">
                      Every case is different. This app cannot analyze the specific facts, evidence, and 
                      circumstances that make your case unique.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <p className="font-semibold mb-2">AI-generated content requires human review</p>
                    <p className="text-amber-800">
                      Any AI-generated analysis, documents, or recommendations must be reviewed and verified 
                      by a qualified professional before use.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* PAGE 4: ATTORNEY-SPECIFIC (only shown if attorney selected) */}
        {currentPage === 4 && userType === 'attorney' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-2xl">Attorney Use Notice</DialogTitle>
                  <DialogDescription>
                    Special terms for legal professionals
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900">Professional Responsibility Notice</AlertTitle>
                <AlertDescription className="text-blue-800">
                  As a licensed attorney, you have specific professional obligations when using this tool.
                </AlertDescription>
              </Alert>

              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-lg text-blue-900">ATTORNEY USE NOTICE</span>
                </div>
                <div className="space-y-4 text-sm text-blue-900">
                  <div className="p-4 bg-white rounded-lg">
                    <p className="font-semibold mb-2">This is a document automation tool</p>
                    <p className="text-blue-800">
                      This software is a document automation and analysis tool. It does not perform legal 
                      services or provide legal advice.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500">
                    <p className="font-semibold mb-3">You remain fully responsible for:</p>
                    <ul className="space-y-2 text-blue-800">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                        <span><strong>Reviewing all generated content</strong> - You must personally review every document, analysis, and recommendation.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                        <span><strong>Ensuring accuracy</strong> - You must verify all facts, citations, and legal theories.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                        <span><strong>Applying professional judgment</strong> - You must use your legal expertise to adapt any content to your client's case.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                        <span><strong>Offering legal advice</strong> - Only you, not this app, can provide legal advice to your clients.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                        <span><strong>Complying with ethical rules</strong> - You must follow all rules of professional conduct in your jurisdiction.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-100 rounded-lg border border-blue-300">
                    <p className="font-semibold mb-2">Ethical Obligations</p>
                    <p className="text-blue-800 mb-3">
                      By using this tool, you acknowledge that you understand your professional obligations under 
                      the rules of professional conduct in your jurisdiction, including but not limited to:
                    </p>
                    <ul className="space-y-1 text-blue-800 text-xs ml-4">
                      <li>• Duty of competence</li>
                      <li>• Duty of confidentiality</li>
                      <li>• Duty of supervision of technology and non-lawyer assistants</li>
                      <li>• Duty of communication with clients</li>
                      <li>• Duty of candor to the tribunal</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-destructive/10 rounded-lg border border-destructive">
                    <p className="font-semibold mb-2 text-destructive">You are solely responsible</p>
                    <p className="text-muted-foreground">
                      You are solely responsible for any documents, advice, or representations made to clients. 
                      All AI-generated content must be reviewed, verified, and customized by you before use.
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Checkbox 
                  id="attorney-ack" 
                  checked={attorneyAcknowledgment}
                  onCheckedChange={(checked) => setAttorneyAcknowledgment(checked as boolean)}
                />
                <Label htmlFor="attorney-ack" className="cursor-pointer text-sm leading-relaxed text-blue-900">
                  <strong>I acknowledge and understand</strong> that as a licensed attorney, I am responsible for 
                  reviewing all AI-generated content, ensuring accuracy, applying my professional judgment, and 
                  complying with all applicable rules of professional conduct. I understand this tool does not 
                  provide legal services or advice.
                </Label>
              </div>
            </div>
          </>
        )}

        {/* PAGE 4 (Parent) / PAGE 5 (Attorney): WARRANTY & LIABILITY */}
        {((currentPage === 4 && userType === 'parent') || (currentPage === 5 && userType === 'attorney')) && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <DialogTitle className="text-2xl">No Warranty & Limitation of Liability</DialogTitle>
                  <DialogDescription>
                    Important legal protections you need to understand
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <Card className="p-6 bg-amber-50 border-amber-200">
                <div className="mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-lg text-amber-900">NO WARRANTY</span>
                </div>
                <div className="space-y-3 text-sm text-amber-900">
                  <div className="p-4 bg-white rounded-lg">
                    <p className="font-semibold mb-2">"AS IS" Provision</p>
                    <p className="text-amber-800">
                      This app is provided "AS IS" and "AS AVAILABLE" without any warranties of any kind, 
                      either express or implied.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <p className="font-semibold mb-2">No Guarantees</p>
                    <p className="text-amber-800">
                      We do not warrant that: (a) the app will be error-free, (b) defects will be corrected, 
                      (c) the app is free of viruses or harmful components, or (d) the results will meet your requirements.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <p className="font-semibold mb-2">Disclaimer of All Warranties</p>
                    <p className="text-amber-800">
                      We specifically disclaim all warranties including merchantability, fitness for a particular 
                      purpose, non-infringement, and any warranties arising from course of dealing or usage of trade.
                    </p>
                  </div>

                  <div className="p-4 bg-amber-100 rounded-lg border border-amber-300">
                    <p className="font-semibold mb-2 text-destructive">You use this app entirely at your own risk</p>
                    <p className="text-amber-800">
                      Your use of this application is at your sole risk. You assume full responsibility for any 
                      consequences that may result from your use of this app.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-red-50 border-red-200">
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-lg text-red-900">LIMITATION OF LIABILITY</span>
                </div>
                <div className="space-y-3 text-sm text-red-900">
                  <div className="p-4 bg-white rounded-lg border-l-4 border-red-500">
                    <p className="font-semibold mb-2">No Liability for Damages</p>
                    <p className="text-red-800">
                      In no event shall CPS Case Defense Analyzer, its creators, operators, affiliates, or 
                      contributors be liable for any direct, indirect, incidental, special, consequential, or 
                      punitive damages arising from your use of or inability to use this app.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <p className="font-semibold mb-2">Types of Excluded Damages</p>
                    <p className="text-red-800 mb-2">
                      This limitation includes, without limitation, damages for:
                    </p>
                    <ul className="text-red-800 space-y-1 ml-4">
                      <li>• Loss of profits or revenue</li>
                      <li>• Loss of data or information</li>
                      <li>• Loss of business opportunity</li>
                      <li>• Legal fees and costs</li>
                      <li>• Emotional distress</li>
                      <li>• Any other intangible losses</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <p className="font-semibold mb-2">Applies Even If We Were Warned</p>
                    <p className="text-red-800">
                      This limitation applies even if we have been advised of the possibility of such damages.
                    </p>
                  </div>

                  <div className="p-4 bg-red-100 rounded-lg border border-red-300">
                    <p className="font-semibold mb-2 text-destructive">Not Responsible for Legal Outcomes</p>
                    <p className="text-red-800">
                      <strong>We are not responsible for the outcome of your legal case.</strong> We make no 
                      representations or warranties about what may happen in your case if you use this tool.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* PAGE 5 (Parent) / PAGE 6 (Attorney): FINAL ACKNOWLEDGMENTS */}
        {((currentPage === 5 && userType === 'parent') || (currentPage === 6 && userType === 'attorney')) && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <DialogTitle className="text-2xl">Final Acknowledgments</DialogTitle>
                  <DialogDescription>
                    Confirm you understand these important terms
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Required Acknowledgments</AlertTitle>
                <AlertDescription>
                  Please read each statement carefully and check the boxes to confirm your understanding. 
                  All three must be checked to proceed.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Card className={`p-3 sm:p-4 transition-all w-full ${understood ? 'bg-green-50 border-green-200' : 'bg-muted/50'}`}>
                  <div className="flex items-start gap-2 sm:gap-3 w-full">
                    <Checkbox 
                      id="understood" 
                      checked={understood}
                      onCheckedChange={(checked) => setUnderstood(checked as boolean)}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <Label htmlFor="understood" className="cursor-pointer flex-1 leading-snug min-w-0">
                      <div className="font-semibold mb-1 flex items-center gap-2 flex-wrap">
                        <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                          1
                        </span>
                        <span className="text-sm">Information vs. Advice</span>
                      </div>
                      <p className="text-xs text-muted-foreground break-words">
                        <strong>I understand that this app provides legal information, not legal advice,</strong> and 
                        that all content is for educational, informational, and organizational purposes only. I understand 
                        the difference between general legal information and specific legal advice tailored to my situation.
                      </p>
                    </Label>
                  </div>
                </Card>

                <Card className={`p-5 transition-all ${noAttorneyRelationship ? 'bg-green-50 border-green-200' : 'bg-muted/50'}`}>
                  <div className="flex items-start gap-4">
                    <Checkbox 
                      id="no-attorney" 
                      checked={noAttorneyRelationship}
                      onCheckedChange={(checked) => setNoAttorneyRelationship(checked as boolean)}
                      className="mt-1"
                    />
                    <Label htmlFor="no-attorney" className="cursor-pointer flex-1 leading-relaxed">
                      <div className="font-semibold mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                          2
                        </span>
                        No Attorney-Client Relationship
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>I understand that using this app does not create an attorney-client relationship</strong> with 
                        anyone, and that the creators of this app are not my attorneys and have no professional obligations to me. 
                        I am not a client of this service.
                      </p>
                    </Label>
                  </div>
                </Card>

                <Card className={`p-5 transition-all ${consultAttorney ? 'bg-green-50 border-green-200' : 'bg-muted/50'}`}>
                  <div className="flex items-start gap-4">
                    <Checkbox 
                      id="consult" 
                      checked={consultAttorney}
                      onCheckedChange={(checked) => setConsultAttorney(checked as boolean)}
                      className="mt-1"
                    />
                    <Label htmlFor="consult" className="cursor-pointer flex-1 leading-relaxed">
                      <div className="font-semibold mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                          3
                        </span>
                        Must Consult Licensed Attorney
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>I understand that I should consult with a licensed attorney</strong> for legal advice specific 
                        to my case, and that I will not rely on this app as a substitute for professional legal counsel. I will 
                        seek qualified legal representation for my legal matters.
                      </p>
                    </Label>
                  </div>
                </Card>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900">Your Protection</AlertTitle>
                <AlertDescription className="text-blue-800">
                  By using this tool in conjunction with qualified legal counsel, you maximize your protection and 
                  chances of success. This app is designed to help you organize information and identify issues to 
                  discuss with your attorney—not to replace professional legal guidance.
                </AlertDescription>
              </Alert>

              {!canProceed() && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-900">Action Required</AlertTitle>
                  <AlertDescription className="text-amber-800">
                    Please check all three boxes above to confirm your understanding and proceed to the application.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}

        {/* Navigation Footer */}
        <DialogFooter className="flex items-center justify-between gap-4 pt-8 mt-8 border-t">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentPage === 1}
            className="gap-2 px-6 h-11"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {currentPage < totalPages ? (
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2 px-6 h-11 text-base"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleAccept}
                disabled={!canProceed()}
                className="gap-2 px-8 h-11 bg-green-600 hover:bg-green-700 text-base"
              >
                <CheckCircle className="w-4 h-4" />
                I Accept - Enter App
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Export the same footer components
export { FooterDisclaimer, AIContentDisclaimer } from './LegalDisclaimer';