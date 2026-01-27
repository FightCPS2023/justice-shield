import React, { useState } from 'react';
import { X, Play, CheckCircle2, FileText, AlertTriangle, Scale, Brain, BookOpen, Sparkles, Youtube, Shield, Gavel, Users, FileSearch } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showVideoOption, setShowVideoOption] = useState(true);

  if (!isOpen) return null;

  const demoSteps = [
    {
      title: "Upload Your CPS Documents",
      description: "Simply drag and drop or upload any CPS documents - PDFs, photos, scanned docs, or text files. Our AI instantly extracts and analyzes the content.",
      features: [
        "Supports PDFs, Word docs, images, and scanned documents",
        "CamScanner and mobile scanner support with OCR",
        "Automatic text extraction and AI analysis",
        "Detects violations, timeline events, and key information"
      ],
      icon: FileText,
      color: "blue",
      demo: (
        <div className="bg-gradient-to-br from-blue-950 to-slate-900 rounded-lg p-6 border border-blue-800">
          <div className="border-2 border-dashed border-blue-500 rounded-lg p-8 text-center hover:border-blue-400 transition-all hover:scale-105 cursor-pointer">
            <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-bounce" style={{ animationDuration: '2s' }} />
            <div className="text-xl font-semibold text-blue-300 mb-2">Drag & Drop Files Here</div>
            <p className="text-sm text-blue-400">Supports: PDF, DOCX, TXT, Images (JPG, PNG)</p>
            <div className="flex gap-2 justify-center mt-4">
              <Badge variant="secondary" className="bg-blue-900/50 text-blue-300">
                <Sparkles className="w-3 h-3 mr-1" />
                OCR Enabled
              </Badge>
              <Badge variant="secondary" className="bg-blue-900/50 text-blue-300">
                CamScanner Ready
              </Badge>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-3 bg-green-950/30 border border-green-800 rounded-lg p-3 animate-in slide-in-from-bottom duration-500">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-semibold text-green-300">CPS_Report.pdf - Uploaded & Analyzed</div>
                <div className="text-green-400">✓ 3 violations detected • 12 timeline events extracted</div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-green-950/30 border border-green-800 rounded-lg p-3 animate-in slide-in-from-bottom duration-700">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-semibold text-green-300">Court_Order_Jan15.pdf - Uploaded & Analyzed</div>
                <div className="text-green-400">✓ 2 procedural violations • 8 deadlines identified</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Identify Violations Automatically",
      description: "Our AI scans your documents and identifies 24 different types of CPS violations - constitutional, procedural, evidence-related, rights denials, and service failures.",
      features: [
        "24 violation types across 5 major categories",
        "AI-powered detection with specific examples",
        "Color-coded risk levels (Critical, High, Medium, Low)",
        "Export-ready violation reports"
      ],
      icon: AlertTriangle,
      color: "red",
      demo: (
        <div className="bg-gradient-to-br from-red-950 to-slate-900 rounded-lg p-6 border border-red-800 space-y-3">
          <div className="bg-red-950/30 border border-red-700 rounded-lg p-4 hover:border-red-600 transition-all cursor-pointer hover:scale-102">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                <span className="font-semibold text-red-300">4th Amendment Violation</span>
              </div>
              <Badge className="bg-red-600 text-white animate-pulse">CRITICAL</Badge>
            </div>
            <p className="text-sm text-red-400 mb-2">Warrantless home entry without exigent circumstances or consent</p>
            <div className="text-xs text-red-500 bg-red-950/50 rounded p-2">
              Found in document: &quot;CPS worker entered the home without permission or warrant...&quot;
            </div>
          </div>
          
          <div className="bg-orange-950/30 border border-orange-700 rounded-lg p-4 hover:border-orange-600 transition-all cursor-pointer hover:scale-102">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <span className="font-semibold text-orange-300">Miranda Rights Violation</span>
              </div>
              <Badge className="bg-orange-600 text-white">HIGH</Badge>
            </div>
            <p className="text-sm text-orange-400 mb-2">Custodial interrogation without proper Miranda warnings</p>
            <div className="text-xs text-orange-500 bg-orange-950/50 rounded p-2">
              Found in document: &quot;Questioned at CPS office for 2 hours without attorney...&quot;
            </div>
          </div>

          <div className="bg-yellow-950/30 border border-yellow-700 rounded-lg p-4 hover:border-yellow-600 transition-all cursor-pointer hover:scale-102">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-yellow-300">Procedural Violation</span>
              </div>
              <Badge className="bg-yellow-600 text-white">MEDIUM</Badge>
            </div>
            <p className="text-sm text-yellow-400 mb-2">Required notice not provided within statutory timeframe</p>
            <div className="text-xs text-yellow-500 bg-yellow-950/50 rounded p-2">
              Found in document: &quot;Received removal notice 3 days after removal...&quot;
            </div>
          </div>

          <div className="mt-4 bg-slate-900/50 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">📊 Total Violations Detected: <span className="text-white font-bold">8</span></span>
              <Badge className="bg-red-600 text-white">3 Critical</Badge>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Build Your Defense Strategy",
      description: "Get AI-generated defense strategies tailored to YOUR specific violations. Each strategy includes legal arguments, case law citations, and specific actions to take.",
      features: [
        "Custom strategies based on your violations",
        "Supreme Court and case law citations",
        "Specific legal arguments and motions",
        "Step-by-step action plans"
      ],
      icon: Scale,
      color: "purple",
      demo: (
        <div className="bg-gradient-to-br from-purple-950 to-slate-900 rounded-lg p-6 border border-purple-800">
          <div className="bg-purple-950/30 border border-purple-700 rounded-lg p-4 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-5 h-5 text-purple-400" />
                <span className="font-semibold text-purple-300">Defense Strategy: 4th Amendment Challenge</span>
              </div>
              <p className="text-sm text-purple-400 mb-3">
                File a Motion to Suppress Evidence obtained during warrantless home entry
              </p>
            </div>

            <div className="bg-purple-950/50 rounded-lg p-3 space-y-2">
              <div className="text-xs font-semibold text-purple-300">📋 Legal Arguments:</div>
              <ul className="text-xs text-purple-400 space-y-1 ml-4">
                <li>• Cite <em>Payton v. New York</em> (1980) - Warrantless home entry unconstitutional</li>
                <li>• Reference <em>Kentucky v. King</em> (2011) - Exigent circumstances standard</li>
                <li>• Apply <em>Camara v. Municipal Court</em> (1967) - Administrative search warrant required</li>
              </ul>
            </div>

            <div className="bg-purple-950/50 rounded-lg p-3 space-y-2">
              <div className="text-xs font-semibold text-purple-300">✅ Action Steps:</div>
              <ul className="text-xs text-purple-400 space-y-1 ml-4">
                <li>1. Document the warrantless entry with timeline</li>
                <li>2. Request all notes/reports from that date</li>
                <li>3. File Motion to Suppress within 30 days</li>
                <li>4. Request evidentiary hearing</li>
              </ul>
            </div>

            <div className="bg-purple-950/50 rounded-lg p-3 space-y-2">
              <div className="text-xs font-semibold text-purple-300">🎯 Expected Outcomes:</div>
              <ul className="text-xs text-purple-400 space-y-1 ml-4">
                <li>• Evidence suppression strengthens defense</li>
                <li>• May lead to case dismissal or reunification</li>
                <li>• Establishes pattern of constitutional violations</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Access Legal Research Tools",
      description: "Research your rights with our comprehensive tools: Legal Q&A, CPS Policy Engine, Case Law Search, and an extensive Rights Guide.",
      features: [
        "Multi-source legal Q&A (Constitution, case law, statutes)",
        "State-specific CPS policies for all 50 states",
        "CourtListener case law search integration",
        "Comprehensive rights guide with citations"
      ],
      icon: BookOpen,
      color: "green",
      demo: (
        <div className="bg-gradient-to-br from-green-950 to-slate-900 rounded-lg p-6 border border-green-800 space-y-4">
          <div className="bg-green-950/30 border border-green-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-green-300">Legal Q&A Research</span>
            </div>
            <div className="bg-green-950/50 rounded p-3 mb-3">
              <div className="text-sm text-green-400 mb-2">❓ &quot;Can CPS remove my child without a court order?&quot;</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs">
                <Badge className="bg-blue-700 text-white shrink-0">Constitution</Badge>
                <span className="text-green-400">4th Amendment protects against unreasonable seizures...</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <Badge className="bg-purple-700 text-white shrink-0">Supreme Court</Badge>
                <span className="text-green-400"><em>Doe v. Kearney</em> - Emergency removal standards...</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <Badge className="bg-orange-700 text-white shrink-0">Case Law</Badge>
                <span className="text-green-400">Recent circuit court ruling on exigent circumstances...</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-950/30 border border-blue-700 rounded-lg p-3 text-center hover:scale-105 transition-transform cursor-pointer">
              <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-blue-300">CPS Manual</div>
              <div className="text-xs text-blue-400">50 States</div>
            </div>
            <div className="bg-purple-950/30 border border-purple-700 rounded-lg p-3 text-center hover:scale-105 transition-transform cursor-pointer">
              <Scale className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-purple-300">Case Law</div>
              <div className="text-xs text-purple-400">CourtListener</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Federal Civil Rights Litigation",
      description: "Access professional-grade federal litigation tools including Section 1983 lawsuits, Notice of Liability under Color of Law, federal court removal, and constitutional hearing briefs.",
      features: [
        "Section 1983 Lawsuit Generator with AI",
        "Notice of Liability under Color of Law documents",
        "Federal Court Removal documentation",
        "Constitutional Hearing Brief templates"
      ],
      icon: Gavel,
      color: "red",
      demo: (
        <div className="bg-gradient-to-br from-red-950 to-slate-900 rounded-lg p-6 border border-red-800 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-950/30 border border-red-700 rounded-lg p-4 text-center hover:scale-105 transition-transform cursor-pointer">
              <Gavel className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-red-300">§1983 Lawsuit</div>
              <div className="text-xs text-red-400">Civil Rights Action</div>
            </div>
            <div className="bg-orange-950/30 border border-orange-700 rounded-lg p-4 text-center hover:scale-105 transition-transform cursor-pointer">
              <Shield className="w-10 h-10 text-orange-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-orange-300">Notice of Liability</div>
              <div className="text-xs text-orange-400">Color of Law</div>
            </div>
            <div className="bg-purple-950/30 border border-purple-700 rounded-lg p-4 text-center hover:scale-105 transition-transform cursor-pointer">
              <Scale className="w-10 h-10 text-purple-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-purple-300">Federal Removal</div>
              <div className="text-xs text-purple-400">Court Transfer</div>
            </div>
            <div className="bg-blue-950/30 border border-blue-700 rounded-lg p-4 text-center hover:scale-105 transition-transform cursor-pointer">
              <FileText className="w-10 h-10 text-blue-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-blue-300">Hearing Brief</div>
              <div className="text-xs text-blue-400">Constitutional Args</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-950/50 to-orange-950/50 border border-red-700 rounded-lg p-4">
            <div className="text-sm font-semibold text-red-300 mb-2">✨ Professional Attorney-Grade Tools</div>
            <p className="text-xs text-red-400 leading-relaxed">
              Generate comprehensive federal civil rights litigation documents with AI assistance. Perfect for pro se litigants and attorneys alike.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Community Hub & Resources",
      description: "Connect with advocates, find attorneys, access the evidence checklist, and get online notarization for critical CPS documents - all in one place.",
      features: [
        "Advocate & Attorney Directory by state",
        "Evidence Collection Checklist (50+ items)",
        "Online Notarization Service (24/7 available)",
        "Community resources and support"
      ],
      icon: Users,
      color: "indigo",
      demo: (
        <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-lg p-6 border border-indigo-800 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-indigo-950/30 border border-indigo-700 rounded-lg p-3 text-center hover:scale-105 transition-transform cursor-pointer">
              <Users className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-indigo-300">Advocates</div>
              <div className="text-xs text-indigo-400">Find Help</div>
            </div>
            <div className="bg-purple-950/30 border border-purple-700 rounded-lg p-3 text-center hover:scale-105 transition-transform cursor-pointer">
              <Scale className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-purple-300">Attorneys</div>
              <div className="text-xs text-purple-400">Legal Experts</div>
            </div>
            <div className="bg-blue-950/30 border border-blue-700 rounded-lg p-3 text-center hover:scale-105 transition-transform cursor-pointer">
              <FileSearch className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-blue-300">Evidence</div>
              <div className="text-xs text-blue-400">50+ Items</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-950/30 to-blue-950/30 border border-green-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-green-600 text-white">NEW</Badge>
              <span className="text-sm font-semibold text-green-300">24/7 Online Notarization</span>
            </div>
            <p className="text-xs text-green-400 mb-3">
              Get critical CPS documents notarized instantly through Notarize.com, Proof.com, or NotaryCam
            </p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="bg-white/5 border-white/20 text-white text-xs">
                Available 24/7
              </Badge>
              <Badge variant="outline" className="bg-white/5 border-white/20 text-white text-xs">
                All 50 States
              </Badge>
              <Badge variant="outline" className="bg-white/5 border-white/20 text-white text-xs">
                Instant Approval
              </Badge>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Track Timeline & Build Your Case",
      description: "Organize all case events, deadlines, and documents in one place. Export professional reports for court or your attorney.",
      features: [
        "Automatic timeline extraction from documents",
        "Visual timeline with all events and dates",
        "Document management and organization",
        "Export to PDF for court or attorney review"
      ],
      icon: Brain,
      color: "indigo",
      demo: (
        <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-lg p-6 border border-indigo-800">
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-indigo-700">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-sm font-semibold text-indigo-300">Jan 15, 2024 - Initial CPS Visit</div>
                <div className="text-xs text-indigo-400">Warrantless home entry documented</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pb-3 border-b border-indigo-700">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <div>
                <div className="text-sm font-semibold text-indigo-300">Jan 17, 2024 - Child Removed</div>
                <div className="text-xs text-indigo-400">Emergency removal without court order</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pb-3 border-b border-indigo-700">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <div className="text-sm font-semibold text-indigo-300">Jan 20, 2024 - Notice Received</div>
                <div className="text-xs text-indigo-400">Received removal notice (3 days late)</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <div className="text-sm font-semibold text-indigo-300">Jan 25, 2024 - Court Hearing</div>
                <div className="text-xs text-indigo-400">Preliminary protective hearing scheduled</div>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-indigo-950/50 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-indigo-400">📊 Total Events: 12</span>
              <span className="text-indigo-400">📅 Upcoming Deadlines: 3</span>
              <Button size="sm" variant="outline" className="h-7 text-xs border-indigo-600 text-indigo-300 hover:bg-indigo-900/50">
                Export Timeline
              </Button>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = demoSteps[currentStep];
  const IconComponent = currentStepData.icon;

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' | 'progress') => {
    const colorMap: Record<string, Record<string, string>> = {
      blue: { bg: 'bg-blue-900/30', text: 'text-blue-400', border: 'border-blue-700', progress: 'bg-blue-500' },
      red: { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-700', progress: 'bg-red-500' },
      purple: { bg: 'bg-purple-900/30', text: 'text-purple-400', border: 'border-purple-700', progress: 'bg-purple-500' },
      green: { bg: 'bg-green-900/30', text: 'text-green-400', border: 'border-green-700', progress: 'bg-green-500' },
      indigo: { bg: 'bg-indigo-900/30', text: 'text-indigo-400', border: 'border-indigo-700', progress: 'bg-indigo-500' },
    };
    return colorMap[color]?.[type] || colorMap.blue[type];
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-slate-900 to-black border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getColorClasses(currentStepData.color, 'bg')} ${getColorClasses(currentStepData.color, 'border')} border`}>
              <IconComponent className={`w-6 h-6 ${getColorClasses(currentStepData.color, 'text')}`} />
            </div>
            <div>
              <div className="text-sm text-gray-400">Interactive Demo - Step {currentStep + 1} of {demoSteps.length}</div>
              <h2 className="text-2xl text-white">{currentStepData.title}</h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Video Option Banner (optional - shows at start) */}
        {showVideoOption && currentStep === 0 && (
          <div className="bg-gradient-to-r from-red-900/30 to-purple-900/30 border-b border-red-800/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Youtube className="w-6 h-6 text-red-400" />
                <div>
                  <div className="text-sm text-white">Prefer to watch a video walkthrough?</div>
                  <div className="text-xs text-gray-400">See The CPS Punisher in action (Coming Soon)</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-900/30"
                  disabled
                >
                  <Play className="w-4 h-4 mr-1" />
                  Watch Video (Coming Soon)
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowVideoOption(false)}
                  className="text-gray-400"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="bg-slate-800/50 px-6 py-3">
          <div className="flex gap-2">
            {demoSteps.map((step, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full flex-1 transition-all ${
                  index === currentStep
                    ? getColorClasses(step.color, 'progress')
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Description */}
          <div>
            <p className="text-lg text-gray-300 mb-4">{currentStepData.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentStepData.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-400">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Demo Visual */}
          <div className="border-2 border-slate-700 rounded-xl overflow-hidden">
            {currentStepData.demo}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="sticky bottom-0 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-700 p-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="border-slate-600 text-gray-300 hover:bg-slate-800 disabled:opacity-30"
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {demoSteps.map((step, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? `${getColorClasses(step.color, 'progress')} w-8`
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-slate-600'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {currentStep < demoSteps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(Math.min(demoSteps.length - 1, currentStep + 1))}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Get Started Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}