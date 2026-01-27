import { useState, useEffect } from 'react';
import { Shield, Scale, AlertTriangle, ExternalLink, Info, Eye, EyeOff, CheckCircle, GraduationCap, Briefcase } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { EnvironmentVariablesViewer } from './EnvironmentVariablesViewer';

interface LegalDisclaimerProps {
  onAccept: (userType: 'parent' | 'attorney') => void;
}

export function LegalDisclaimer({ onAccept }: LegalDisclaimerProps) {
  const [showModal, setShowModal] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [noAttorneyRelationship, setNoAttorneyRelationship] = useState(false);
  const [consultAttorney, setConsultAttorney] = useState(false);
  const [userType, setUserType] = useState<'parent' | 'attorney'>('parent');
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Check if user has already accepted disclaimer
    const accepted = localStorage.getItem('cps_legal_disclaimer_accepted');
    const acceptedVersion = localStorage.getItem('cps_legal_disclaimer_version');
    const currentVersion = '2.0'; // Update this when disclaimer changes
    
    if (!accepted || acceptedVersion !== currentVersion) {
      setShowModal(true);
    }
  }, []);

  const handleAccept = () => {
    if (!understood || !noAttorneyRelationship || !consultAttorney) {
      return;
    }

    localStorage.setItem('cps_legal_disclaimer_accepted', 'true');
    localStorage.setItem('cps_legal_disclaimer_version', '2.0');
    localStorage.setItem('cps_user_type', userType);
    
    setShowModal(false);
    onAccept(userType);
  };

  const canProceed = understood && noAttorneyRelationship && consultAttorney;

  return (
    <Dialog open={showModal} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <Scale className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Legal Disclaimer & Terms of Use</DialogTitle>
              <DialogDescription>
                Please read carefully and confirm your understanding
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Type Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <div className="mb-2">I am a:</div>
                <p className="text-sm text-muted-foreground mb-4">
                  Please select your user type. Different terms apply for attorneys.
                </p>
              </div>

              <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'parent' | 'attorney')}>
                <Card className={`p-4 cursor-pointer transition-all ${userType === 'parent' ? 'border-primary bg-primary/5' : ''}`}>
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="parent" id="parent" />
                    <Label htmlFor="parent" className="cursor-pointer flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-5 h-5 text-primary" />
                        <span className="font-medium">Parent/Guardian/Individual</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        I am using this tool for my own personal case or to help a family member
                      </p>
                    </Label>
                  </div>
                </Card>

                <Card className={`p-4 cursor-pointer transition-all ${userType === 'attorney' ? 'border-primary bg-primary/5' : ''}`}>
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="attorney" id="attorney" />
                    <Label htmlFor="attorney" className="cursor-pointer flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        <span className="font-medium">Licensed Attorney</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        I am a licensed attorney using this tool for client case management
                      </p>
                    </Label>
                  </div>
                </Card>
              </RadioGroup>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Disclaimer Content */}
          {step === 2 && (
            <>
              <Alert className="bg-destructive/10 border-destructive">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertTitle className="text-destructive">IMPORTANT LEGAL NOTICE</AlertTitle>
                <AlertDescription className="text-destructive-foreground">
                  This application provides legal information, NOT legal advice. You must read and understand 
                  the following terms before using this tool.
                </AlertDescription>
              </Alert>

              {/* General Disclaimer */}
              <Card className="p-6 bg-muted/50">
                <div className="mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-semibold">LEGAL DISCLAIMER</span>
                </div>
                <div className="space-y-3 text-sm">
                  <p>
                    <strong>This app provides legal information, not legal advice.</strong>
                  </p>
                  <p>
                    We are not attorneys, and this app does not create an attorney–client relationship.
                  </p>
                  <p>
                    All analysis, document generation, timelines, and recommendations are for 
                    <strong> educational, informational, and organizational purposes only</strong>.
                  </p>
                  <p>
                    Users should consult a licensed attorney for legal advice.
                  </p>
                  <p>
                    <strong>No output should be relied upon as a substitute for formal legal counsel.</strong>
                  </p>
                  <p className="text-muted-foreground pt-2 border-t">
                    The information provided by this app may not be accurate, complete, or up-to-date. 
                    Laws vary significantly by jurisdiction and change frequently. This app cannot account 
                    for the unique facts and circumstances of your individual case.
                  </p>
                </div>
              </Card>

              {/* Attorney-Specific Terms (if attorney selected) */}
              {userType === 'attorney' && (
                <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <div className="mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-blue-900 dark:text-blue-100">ATTORNEY USE NOTICE</span>
                  </div>
                  <div className="space-y-3 text-sm text-blue-900 dark:text-blue-100">
                    <p>
                      <strong>This software is a document automation and analysis tool.</strong>
                    </p>
                    <p>
                      You remain fully responsible for:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Reviewing all generated content</li>
                      <li>Ensuring accuracy</li>
                      <li>Applying professional judgment</li>
                      <li>Offering legal advice</li>
                      <li>Complying with your jurisdiction's ethical rules</li>
                    </ul>
                    <p className="pt-2 border-t border-blue-200 dark:border-blue-700">
                      <strong>This app does not perform legal services or provide legal advice.</strong> 
                      All AI-generated content must be reviewed, verified, and customized by you before 
                      use with clients. You are solely responsible for any documents, advice, or 
                      representations made to clients.
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      By using this tool, you acknowledge that you understand your professional 
                      obligations under the rules of professional conduct in your jurisdiction, 
                      including duties of competence, confidentiality, and supervision of technology.
                    </p>
                  </div>
                </Card>
              )}

              {/* No Warranty */}
              <Card className="p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <div className="mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span className="font-semibold text-amber-900 dark:text-amber-100">NO WARRANTY</span>
                </div>
                <div className="space-y-2 text-sm text-amber-900 dark:text-amber-100">
                  <p>
                    This app is provided "as is" without any warranties, express or implied, 
                    including but not limited to warranties of merchantability, fitness for a 
                    particular purpose, or non-infringement.
                  </p>
                  <p>
                    We do not warrant that the app will be error-free, that defects will be 
                    corrected, or that the app is free of viruses or other harmful components.
                  </p>
                  <p>
                    <strong>You use this app entirely at your own risk.</strong>
                  </p>
                </div>
              </Card>

              {/* Limitation of Liability */}
              <Card className="p-6 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="font-semibold text-red-900 dark:text-red-100">LIMITATION OF LIABILITY</span>
                </div>
                <div className="space-y-2 text-sm text-red-900 dark:text-red-100">
                  <p>
                    In no event shall CPS Case Defense Analyzer, its creators, operators, or 
                    affiliates be liable for any direct, indirect, incidental, special, consequential, 
                    or punitive damages arising from your use of or inability to use this app.
                  </p>
                  <p>
                    This includes, without limitation, damages for loss of profits, data, or other 
                    intangible losses, even if we have been advised of the possibility of such damages.
                  </p>
                  <p>
                    <strong>We are not responsible for the outcome of your legal case.</strong>
                  </p>
                </div>
              </Card>

              {/* Acknowledgments */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="understood" 
                      checked={understood}
                      onCheckedChange={(checked) => setUnderstood(checked as boolean)}
                    />
                    <Label htmlFor="understood" className="cursor-pointer text-sm leading-relaxed">
                      <strong>I understand that this app provides legal information, not legal advice,</strong> 
                      and that all content is for educational and informational purposes only.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="no-attorney" 
                      checked={noAttorneyRelationship}
                      onCheckedChange={(checked) => setNoAttorneyRelationship(checked as boolean)}
                    />
                    <Label htmlFor="no-attorney" className="cursor-pointer text-sm leading-relaxed">
                      <strong>I understand that using this app does not create an attorney-client relationship</strong> 
                      and that the creators of this app are not my attorneys.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="consult" 
                      checked={consultAttorney}
                      onCheckedChange={(checked) => setConsultAttorney(checked as boolean)}
                    />
                    <Label htmlFor="consult" className="cursor-pointer text-sm leading-relaxed">
                      <strong>I understand that I should consult with a licensed attorney</strong> for legal 
                      advice specific to my case, and that I will not rely on this app as a substitute for 
                      professional legal counsel.
                    </Label>
                  </div>

                  {userType === 'attorney' && (
                    <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-900 dark:text-blue-100">
                        <strong>As a licensed attorney, I acknowledge</strong> that I am responsible for 
                        reviewing all AI-generated content, ensuring accuracy, applying my professional 
                        judgment, and complying with all applicable rules of professional conduct.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {step === 2 && (
          <DialogFooter className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button 
              onClick={handleAccept}
              disabled={!canProceed}
              className="gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              I Accept - Continue to App
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Footer Disclaimer Component
export function FooterDisclaimer() {
  return (
    <footer className="border-t bg-gradient-to-b from-muted/30 to-muted/50 mt-12" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="space-y-6 sm:space-y-8">
          {/* Primary Disclaimer */}
          <Alert className="bg-amber-50 dark:bg-amber-950 border-2 border-amber-300 dark:border-amber-700 shadow-lg">
            <Scale className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-900 dark:text-amber-100 text-base sm:text-lg font-bold mb-2">
              ⚖️ IMPORTANT LEGAL DISCLAIMER - READ CAREFULLY
            </AlertTitle>
            <AlertDescription className="text-amber-900 dark:text-amber-200 text-sm sm:text-base leading-relaxed space-y-2">
              <p>
                <strong className="underline">THIS APPLICATION PROVIDES LEGAL INFORMATION ONLY, NOT LEGAL ADVICE.</strong> The creators, operators, and contributors to this application are <strong>NOT licensed attorneys</strong> and do not provide legal services. Use of this application does <strong>NOT</strong> create an attorney-client relationship, and no such relationship is intended or implied.
              </p>
              <p>
                <strong>All content, analysis, document templates, violation checks, defense strategies, case timelines, AI-generated outputs, and recommendations provided by this application are for educational, informational, and organizational purposes only.</strong> They are NOT a substitute for professional legal advice tailored to your specific circumstances.
              </p>
              <p className="font-semibold text-amber-950 dark:text-amber-100">
                ⚠️ CRITICAL: Child protective services cases involve complex legal issues that can result in permanent loss of parental rights. You MUST consult with a qualified, licensed family law attorney in your jurisdiction before taking ANY legal action.
              </p>
            </AlertDescription>
          </Alert>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Limitations & Warnings */}
            <Card className="p-4 sm:p-5 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800">
              <div className="mb-3 flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold text-base">Limitations & Warnings</span>
              </div>
              <ul className="space-y-2 text-sm text-red-900 dark:text-red-200">
                <li>• <strong>No Liability:</strong> We assume NO liability for the outcome of your case</li>
                <li>• <strong>State Variations:</strong> Laws vary significantly by state and jurisdiction</li>
                <li>• <strong>No Guarantees:</strong> This tool cannot guarantee case success or outcomes</li>
                <li>• <strong>AI Limitations:</strong> AI-generated content may contain errors or inaccuracies</li>
                <li>• <strong>Not Comprehensive:</strong> Cannot account for your unique case circumstances</li>
                <li>• <strong>Time-Sensitive:</strong> Laws change frequently; information may be outdated</li>
              </ul>
            </Card>

            {/* Required Actions */}
            <Card className="p-4 sm:p-5 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800">
              <div className="mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Shield className="w-5 h-5" />
                <span className="font-bold text-base">You MUST Do This</span>
              </div>
              <ul className="space-y-2 text-sm text-blue-900 dark:text-blue-200">
                <li>• <strong>Hire an Attorney:</strong> Consult a licensed family law attorney immediately</li>
                <li>• <strong>Verify Everything:</strong> Have your attorney review all app-generated content</li>
                <li>• <strong>Meet Deadlines:</strong> Never miss court dates or filing deadlines</li>
                <li>• <strong>Follow Orders:</strong> Comply with all court orders and CPS requirements</li>
                <li>• <strong>Document Everything:</strong> Keep detailed records of all interactions</li>
                <li>• <strong>Protect Privacy:</strong> Keep case information confidential and secure</li>
              </ul>
            </Card>

            {/* No Warranty */}
            <Card className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 sm:col-span-2 lg:col-span-1">
              <div className="mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold text-base">No Warranty</span>
              </div>
              <div className="space-y-2 text-sm text-gray-900 dark:text-gray-200">
                <p>
                  This software is provided <strong>"AS IS"</strong> without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
                </p>
                <p className="font-semibold">
                  USE AT YOUR OWN RISK. We are not responsible for any damages, losses, or adverse outcomes resulting from use of this application.
                </p>
              </div>
            </Card>
          </div>

          {/* Legal Notices */}
          <div className="bg-muted/50 rounded-lg p-4 sm:p-6 space-y-3 border-2">
            <div className="text-xs sm:text-sm text-muted-foreground space-y-2 leading-relaxed">
              <p>
                <strong>Indemnification:</strong> By using this application, you agree to indemnify, defend, and hold harmless the creators, operators, contributors, and affiliates from any claims, damages, losses, liabilities, and expenses arising from your use of this application.
              </p>
              <p>
                <strong>Professional Conduct:</strong> If you are an attorney using this application, you remain solely responsible for compliance with all applicable rules of professional conduct, ethical obligations, and duties to your clients. This tool does not replace your professional judgment.
              </p>
              <p>
                <strong>Accuracy Disclaimer:</strong> While we strive for accuracy, we make no representations or warranties about the accuracy, reliability, completeness, or timeliness of any content. Legal information may be outdated, incomplete, or incorrect.
              </p>
            </div>
          </div>

          {/* Copyright & Agreement */}
          <div className="text-center space-y-3 pt-6 border-t-2">
            {/* Environment Variables Viewer Button */}
            <div className="flex justify-center mb-4">
              <EnvironmentVariablesViewer />
            </div>
            
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              © 2024-2025 The CPS Punisher / CPS Case Defense Analyzer. All Rights Reserved.
            </p>
            <p className="text-xs sm:text-sm font-bold text-foreground">
              Copyright Owner: DARREN GUAY
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-4xl mx-auto">
              <strong>By using this application, you acknowledge that you have read, understood, and agreed to this legal disclaimer and all terms of use.</strong> If you do not agree, you must immediately discontinue use of this application. Your continued use constitutes acceptance of these terms.
            </p>
            <p className="text-xs text-muted-foreground">
              Questions about this disclaimer? Consult with your own attorney.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Inline Disclaimer for AI-Generated Content
export function AIContentDisclaimer({ context = 'general' }: { context?: 'document' | 'analysis' | 'strategy' | 'general' }) {
  const messages = {
    document: 'AI-generated document must be reviewed by an attorney before use. This is a template, not legal advice.',
    analysis: 'AI analysis is for informational purposes only. Consult an attorney for legal advice specific to your case.',
    strategy: 'Defense strategies are educational suggestions only. Work with your attorney to develop your legal strategy.',
    general: 'This content is AI-generated and for informational purposes only. Not a substitute for legal advice.'
  };

  return (
    <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-900 dark:text-amber-100">Disclaimer</AlertTitle>
      <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
        {messages[context]}
      </AlertDescription>
    </Alert>
  );
}