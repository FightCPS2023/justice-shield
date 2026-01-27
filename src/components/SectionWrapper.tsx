import { ReactNode } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CPSPunisherLogo } from './CPSPunisherLogo';
import { HelpBot } from './HelpBot';
import {
  ArrowLeft,
  HelpCircle,
  AlertTriangle,
  Info,
  Sparkles,
  Home
} from 'lucide-react';

interface Instruction {
  step: number;
  text: string;
}

interface SectionWrapperProps {
  // Required
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  onBack: () => void;
  
  // Optional
  onBackToMenu?: () => void;
  instructions?: Instruction[];
  disclaimer?: string;
  showAIBadge?: boolean;
  isPro?: boolean;
  headerColor?: string;
  iconBgColor?: string;
  additionalHelp?: ReactNode;
}

export function SectionWrapper({
  title,
  description,
  icon,
  children,
  onBack,
  onBackToMenu,
  instructions,
  disclaimer,
  showAIBadge = false,
  isPro = false,
  headerColor = 'from-blue-600 to-purple-600',
  iconBgColor = 'bg-blue-600',
  additionalHelp
}: SectionWrapperProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sticky Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              {onBackToMenu && (
                <>
                  <div className="h-6 w-px bg-gray-300" />
                  <Button variant="ghost" size="sm" onClick={onBackToMenu} className="gap-2">
                    <Home className="w-4 h-4" />
                    Main Menu
                  </Button>
                </>
              )}
              <div className="h-6 w-px bg-gray-300" />
              <CPSPunisherLogo size="small" showText={true} variant="image" />
            </div>
            <div className="flex items-center gap-2">
              {showAIBadge && (
                <Badge className="bg-blue-600 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Powered
                </Badge>
              )}
              {isPro && (
                <Badge className="bg-purple-600 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Pro Feature
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${iconBgColor} rounded-full mb-4 shadow-lg`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Instructions Card (if provided) */}
        {instructions && instructions.length > 0 && (
          <Card className="mb-6 p-6 border-blue-200 bg-blue-50">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-3">How to Use This Tool</h3>
                <ol className="space-y-2">
                  {instructions.map((instruction) => (
                    <li key={instruction.step} className="flex items-start gap-3 text-sm text-blue-800">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                        {instruction.step}
                      </span>
                      <span className="flex-1 pt-0.5">{instruction.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Card>
        )}

        {/* Additional Help (if provided) */}
        {additionalHelp && (
          <Card className="mb-6 p-6 border-purple-200 bg-purple-50">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                {additionalHelp}
              </div>
            </div>
          </Card>
        )}

        {/* Main Content Area */}
        <div className="mb-6">
          {children}
        </div>

        {/* Legal Disclaimer (if provided) */}
        {disclaimer && (
          <Alert className="mb-6 border-red-300 bg-red-50">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <AlertTitle className="text-red-900 font-semibold">Legal Disclaimer</AlertTitle>
            <AlertDescription className="text-red-800 text-sm">
              {disclaimer}
            </AlertDescription>
          </Alert>
        )}

        {/* Default Legal Notice (always show) */}
        <Card className="p-4 border-amber-300 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              <strong>Legal Notice:</strong> This platform provides legal information and tools,
              not legal advice. We are not attorneys. Always consult with a licensed attorney
              before taking legal action in your CPS case.
            </p>
          </div>
        </Card>
      </div>

      {/* Help Bot (always available) */}
      <div className="fixed bottom-4 right-4 z-50">
        <HelpBot />
      </div>
    </div>
  );
}
