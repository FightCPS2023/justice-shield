import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  FolderOpen, 
  Upload, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  Calendar,
  MapPin,
  User,
  Briefcase,
  AlertCircle,
  Sparkles,
  Shield,
  Scale,
  Target,
  MessageSquare
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import type { CaseData } from './CaseManager';

interface OnboardingFlowProps {
  onComplete: (caseData: CaseData, uploadedDocs?: File[]) => void;
  userType: 'parent' | 'attorney';
}

export function OnboardingFlow({ onComplete, userType }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0); // Changed from 1 to 0
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  
  // Step 0: Story/Situation Description
  const [userStory, setUserStory] = useState('');
  const [storyAnalysis, setStoryAnalysis] = useState<any>(null);

  // Step 1: Case Creation Data
  const [caseData, setCaseData] = useState<Partial<CaseData>>({
    caseName: '',
    caseNumber: '',
    county: '',
    state: 'MS',
    dateOpened: '',
    childrenNames: '',
    caseworkerName: '',
    caseworkerPhone: '',
    caseworkerEmail: '',
    attorneyName: '',
    attorneyPhone: '',
    attorneyEmail: '',
    courtName: '',
    judgeName: '',
    nextCourtDate: '',
    caseStatus: 'active',
    caseType: 'dependency',
    initialAllegations: '',
    currentGoal: 'reunification',
    notes: ''
  });

  // Step 2: Document Upload Data
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const totalSteps = 4; // Changed from 3 to 4 (added step 0)
  const progress = ((currentStep + 1) / totalSteps) * 100; // Adjusted calculation

  // Handle case data changes
  const handleInputChange = (field: keyof CaseData, value: string) => {
    setCaseData(prev => ({ ...prev, [field]: value }));
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...filesArray]);
    }
  };

  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Simulate AI analysis
  const analyzeDocuments = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock analysis results
    const mockResults = {
      violationsFound: Math.floor(Math.random() * 5) + 3,
      keyIssues: [
        'Potential 4th Amendment violation - warrantless entry documented',
        'Inadequate notice of rights provided',
        'Missing required documentation in case file',
      ],
      strengthScore: Math.floor(Math.random() * 30) + 60,
      recommendedActions: [
        'File motion to suppress evidence from warrantless search',
        'Request complete case file under FOIA',
        'Document all interactions moving forward',
      ],
      documentsAnalyzed: uploadedFiles.length
    };
    
    setAnalysisResults(mockResults);
    setIsAnalyzing(false);
  };

  // Validate current step
  const canProceed = () => {
    if (currentStep === 0) {
      return userStory.trim().length > 0;
    }
    if (currentStep === 1) {
      return caseData.caseName && caseData.caseNumber && caseData.county;
    }
    if (currentStep === 2) {
      return uploadedFiles.length > 0;
    }
    return true;
  };

  // Handle next step
  const handleNext = async () => {
    if (currentStep === 2) {
      // Analyze documents before showing results
      await analyzeDocuments();
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Complete onboarding
      const completeCaseData: CaseData = {
        id: `case-${Date.now()}`,
        caseName: caseData.caseName || 'My Case',
        caseNumber: caseData.caseNumber || '',
        county: caseData.county || '',
        state: caseData.state || 'MS',
        dateOpened: caseData.dateOpened || new Date().toISOString().split('T')[0],
        childrenNames: caseData.childrenNames || '',
        caseworkerName: caseData.caseworkerName || '',
        caseworkerPhone: caseData.caseworkerPhone || '',
        caseworkerEmail: caseData.caseworkerEmail || '',
        attorneyName: caseData.attorneyName || '',
        attorneyPhone: caseData.attorneyPhone || '',
        attorneyEmail: caseData.attorneyEmail || '',
        courtName: caseData.courtName || '',
        judgeName: caseData.judgeName || '',
        nextCourtDate: caseData.nextCourtDate || '',
        caseStatus: caseData.caseStatus || 'active',
        caseType: caseData.caseType || 'dependency',
        initialAllegations: caseData.initialAllegations || '',
        currentGoal: caseData.currentGoal || 'reunification',
        notes: caseData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      onComplete(completeCaseData, uploadedFiles);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">
            <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              Welcome to The CPS Punisher
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Let's get your case set up in 4 simple steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step indicators */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className={`flex flex-col items-center gap-1 ${currentStep >= 0 ? 'text-red-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 0 ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                {currentStep > 0 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
              </div>
              <span className="text-xs font-semibold text-center">Tell Story</span>
            </div>
            
            <div className={`flex flex-col items-center gap-1 ${currentStep >= 1 ? 'text-red-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
              </div>
              <span className="text-xs font-semibold text-center">Case Info</span>
            </div>
            
            <div className={`flex flex-col items-center gap-1 ${currentStep >= 2 ? 'text-red-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                {currentStep > 2 ? <CheckCircle2 className="w-5 h-5" /> : '3'}
              </div>
              <span className="text-xs font-semibold text-center">Upload Docs</span>
            </div>
            
            <div className={`flex flex-col items-center gap-1 ${currentStep >= 3 ? 'text-red-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                {currentStep > 3 ? <CheckCircle2 className="w-5 h-5" /> : '4'}
              </div>
              <span className="text-xs font-semibold text-center">Results</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 0 && (
                <>
                  <FolderOpen className="w-6 h-6 text-red-600" />
                  Describe Your Situation
                </>
              )}
              {currentStep === 1 && (
                <>
                  <FolderOpen className="w-6 h-6 text-red-600" />
                  Create Your Case
                </>
              )}
              {currentStep === 2 && (
                <>
                  <Upload className="w-6 h-6 text-blue-600" />
                  Upload Documents
                </>
              )}
              {currentStep === 3 && (
                <>
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  AI Analysis Results
                </>
              )}
            </CardTitle>
            <CardDescription>
              {currentStep === 0 && "Describe the situation or story leading to your case"}
              {currentStep === 1 && "Enter your case information to get started"}
              {currentStep === 2 && "Upload any documents you have related to your case"}
              {currentStep === 3 && "Review your AI-powered case analysis"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* STEP 0: DESCRIBE SITUATION */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <Alert className="border-purple-600 bg-purple-50 dark:bg-purple-950/30">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <AlertTitle className="text-purple-900 dark:text-purple-300">Tell Us Your Story</AlertTitle>
                  <AlertDescription className="text-purple-800 dark:text-purple-400">
                    Type or paste your situation below. Our AI will analyze it to identify potential violations and help build your defense strategy. Include as much detail as you can remember.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="userStory" className="flex items-center gap-2 text-base font-semibold">
                    <MessageSquare className="w-4 h-4" />
                    Your Situation <span className="text-red-600">*</span>
                  </Label>
                  <Textarea
                    id="userStory"
                    placeholder={`Example:\n\nOn January 15th, CPS showed up at my door without warning at 7am. They demanded to come inside and search my home without a warrant or my consent. The caseworker, Jane Smith, claimed there was an anonymous report of neglect but wouldn't give me any details.\n\nThey took my children, ages 5 and 8, from their beds while they were crying and begging to stay. I was never read my rights, never given any paperwork, and they refused to tell me where they were taking them.\n\nI've been trying to get information for 3 days now and no one will return my calls. I don't have an attorney assigned yet and don't know what to do next...\n\n(Continue with as much detail as you remember)`}
                    rows={12}
                    value={userStory}
                    onChange={(e) => setUserStory(e.target.value)}
                    className="text-base resize-none"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{userStory.length} characters</span>
                    <span>{userStory.trim().length > 0 ? '✓ Ready to continue' : 'Please describe your situation'}</span>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    💡 Helpful Tips - Include These Details:
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                    <li>• <strong>Dates and times</strong> when things happened</li>
                    <li>• <strong>Names</strong> of CPS workers and officials involved</li>
                    <li>• <strong>What was said</strong> during interactions (exact words if you remember)</li>
                    <li>• <strong>What happened</strong> step-by-step in chronological order</li>
                    <li>• <strong>Whether you consented</strong> to searches, interviews, or removals</li>
                    <li>• <strong>If your rights were read</strong> or if you were given paperwork</li>
                    <li>• <strong>Any witnesses</strong> who were present</li>
                    <li>• <strong>Current status</strong> - where are your children now, what are you being asked to do</li>
                  </ul>
                </div>
              </div>
            )}

            {/* STEP 1: CREATE CASE */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertTitle>Required Information</AlertTitle>
                  <AlertDescription>
                    Please provide at least the case name, case number, and county to continue.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Case Name */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="caseName" className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Case Name <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="caseName"
                      placeholder="e.g., Smith Family Case"
                      value={caseData.caseName}
                      onChange={(e) => handleInputChange('caseName', e.target.value)}
                      className="text-base"
                    />
                  </div>

                  {/* Case Number */}
                  <div className="space-y-2">
                    <Label htmlFor="caseNumber" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Case Number <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="caseNumber"
                      placeholder="e.g., 2024-CV-001234"
                      value={caseData.caseNumber}
                      onChange={(e) => handleInputChange('caseNumber', e.target.value)}
                    />
                  </div>

                  {/* County */}
                  <div className="space-y-2">
                    <Label htmlFor="county" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      County <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="county"
                      placeholder="e.g., Hinds County"
                      value={caseData.county}
                      onChange={(e) => handleInputChange('county', e.target.value)}
                    />
                  </div>

                  {/* Date Opened */}
                  <div className="space-y-2">
                    <Label htmlFor="dateOpened" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date Case Opened
                    </Label>
                    <Input
                      id="dateOpened"
                      type="date"
                      value={caseData.dateOpened}
                      onChange={(e) => handleInputChange('dateOpened', e.target.value)}
                    />
                  </div>

                  {/* Children Names */}
                  <div className="space-y-2">
                    <Label htmlFor="childrenNames" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Children's Names
                    </Label>
                    <Input
                      id="childrenNames"
                      placeholder="e.g., John, Jane"
                      value={caseData.childrenNames}
                      onChange={(e) => handleInputChange('childrenNames', e.target.value)}
                    />
                  </div>

                  {/* Caseworker Name */}
                  <div className="space-y-2">
                    <Label htmlFor="caseworkerName">Caseworker Name</Label>
                    <Input
                      id="caseworkerName"
                      placeholder="CPS caseworker assigned"
                      value={caseData.caseworkerName}
                      onChange={(e) => handleInputChange('caseworkerName', e.target.value)}
                    />
                  </div>

                  {/* Caseworker Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="caseworkerPhone">Caseworker Phone</Label>
                    <Input
                      id="caseworkerPhone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={caseData.caseworkerPhone}
                      onChange={(e) => handleInputChange('caseworkerPhone', e.target.value)}
                    />
                  </div>

                  {/* Initial Allegations */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="initialAllegations">Initial Allegations</Label>
                    <Textarea
                      id="initialAllegations"
                      placeholder="Describe the allegations made by CPS..."
                      rows={4}
                      value={caseData.initialAllegations}
                      onChange={(e) => handleInputChange('initialAllegations', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: UPLOAD DOCUMENTS */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <Alert>
                  <Sparkles className="w-4 h-4" />
                  <AlertTitle>AI-Powered Analysis</AlertTitle>
                  <AlertDescription>
                    Upload your CPS documents and we'll analyze them for violations, inconsistencies, and defense strategies.
                  </AlertDescription>
                </Alert>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-red-400 transition-colors">
                  <input
                    type="file"
                    id="fileUpload"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-lg font-semibold mb-2">Click to upload documents</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      PDF, Word, Images (Max 10MB each)
                    </p>
                  </label>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                      Uploaded Documents ({uploadedFiles.length})
                    </h3>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {(file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-300">
                    📄 Suggested Documents to Upload:
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                    <li>• CPS investigation reports</li>
                    <li>• Court orders and petitions</li>
                    <li>• Safety plans or service agreements</li>
                    <li>• Communication logs with CPS</li>
                    <li>• Medical or school records</li>
                    <li>• Photos or evidence documentation</li>
                  </ul>
                </div>
              </div>
            )}

            {/* STEP 3: RESULTS */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Analyzing Your Documents...</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Our AI is reviewing your case for violations and defense strategies
                    </p>
                  </div>
                ) : analysisResults && (
                  <>
                    <Alert className="border-green-600 bg-green-50 dark:bg-green-950/30">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <AlertTitle className="text-green-900 dark:text-green-300">Analysis Complete!</AlertTitle>
                      <AlertDescription className="text-green-800 dark:text-green-400">
                        We've analyzed {analysisResults.documentsAnalyzed} document(s) and found important issues.
                      </AlertDescription>
                    </Alert>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-3xl font-black text-red-600 mb-1">
                              {analysisResults.violationsFound}
                            </div>
                            <div className="text-sm font-semibold text-red-800 dark:text-red-400">
                              Violations Found
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-3xl font-black text-purple-600 mb-1">
                              {analysisResults.strengthScore}%
                            </div>
                            <div className="text-sm font-semibold text-purple-800 dark:text-purple-400">
                              Defense Strength
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-3xl font-black text-blue-600 mb-1">
                              {analysisResults.recommendedActions.length}
                            </div>
                            <div className="text-sm font-semibold text-blue-800 dark:text-blue-400">
                              Action Items
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Key Issues */}
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-600" />
                        Key Issues Identified
                      </h3>
                      <div className="space-y-2">
                        {analysisResults.keyIssues.map((issue: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{issue}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Actions */}
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        Recommended Next Steps
                      </h3>
                      <div className="space-y-2">
                        {analysisResults.recommendedActions.map((action: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{action}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <Alert className="border-purple-600 bg-purple-50 dark:bg-purple-950/30">
                      <Scale className="w-4 h-4 text-purple-600" />
                      <AlertTitle className="text-purple-900 dark:text-purple-300">Ready to Build Your Defense?</AlertTitle>
                      <AlertDescription className="text-purple-800 dark:text-purple-400">
                        Click "Enter Application" below to access all features and start building your case strategy.
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isAnalyzing}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isAnalyzing}
            className="gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
          >
            {currentStep === 3 ? (
              <>
                Enter Application
                <CheckCircle2 className="w-4 h-4" />
              </>
            ) : (
              <>
                {currentStep === 2 ? 'Analyze Documents' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}