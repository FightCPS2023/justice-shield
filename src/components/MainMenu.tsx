import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CPSPunisherLogo } from './CPSPunisherLogo';
import {
  FileText,
  Upload,
  Scale,
  Shield,
  Calendar,
  BookOpen,
  MessageSquare,
  Users,
  BarChart,
  Settings,
  HelpCircle,
  ArrowRight,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain
} from 'lucide-react';

interface MainMenuProps {
  onNavigate: (section: string) => void;
  userName?: string;
  activeCaseName?: string;
  subscriptionTier?: string;
}

interface MenuSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  isNew?: boolean;
  isPro?: boolean;
  category: 'start' | 'core' | 'advanced' | 'tools' | 'help';
}

export function MainMenu({ onNavigate, userName, activeCaseName, subscriptionTier }: MainMenuProps) {
  const menuSections: MenuSection[] = [
    // START HERE
    {
      id: 'situation',
      title: 'Describe Your Situation',
      description: 'Tell us what happened - write, type, or record your story',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      isNew: true,
      category: 'start'
    },
    {
      id: 'documents',
      title: 'Upload Documents',
      description: 'Upload CPS documents for AI analysis and violation detection',
      icon: <Upload className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      category: 'start'
    },

    // CORE FEATURES
    {
      id: 'violations',
      title: 'Violation Checker',
      description: 'Detect constitutional and procedural violations in your case',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      category: 'core'
    },
    {
      id: 'defense',
      title: 'Defense Strategy',
      description: 'AI-powered legal defense strategies for your specific case',
      icon: <Shield className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      category: 'core'
    },
    {
      id: 'generator',
      title: 'Legal Documents',
      description: 'Generate court-ready legal documents and motions',
      icon: <FileText className="w-6 h-6" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      category: 'core'
    },
    {
      id: 'timeline',
      title: 'Case Timeline',
      description: 'Build and manage your case timeline with key events',
      icon: <Clock className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      category: 'core'
    },

    // ADVANCED TOOLS
    {
      id: 'rights',
      title: 'Know Your Rights',
      description: 'Learn your constitutional rights in CPS cases',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      category: 'advanced'
    },
    {
      id: 'evidence',
      title: 'Evidence Checklist',
      description: 'Track and organize evidence to support your case',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      category: 'advanced'
    },
    {
      id: 'ai-research',
      title: 'AI Legal Research',
      description: 'Search 40M+ court cases and legal precedents',
      icon: <Brain className="w-6 h-6" />,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      isPro: true,
      category: 'advanced'
    },

    // TOOLS
    {
      id: 'calendar',
      title: 'Case Calendar',
      description: 'Track court dates, deadlines, and important events',
      icon: <Calendar className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      category: 'tools'
    },
    {
      id: 'community',
      title: 'Community Hub',
      description: 'Connect with advocates, attorneys, and other parents',
      icon: <Users className="w-6 h-6" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      category: 'tools'
    },
    {
      id: 'analytics',
      title: 'Case Analytics',
      description: 'View insights and statistics about your case',
      icon: <BarChart className="w-6 h-6" />,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      category: 'tools'
    },

    // SETTINGS & HELP
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage your account, subscription, and preferences',
      icon: <Settings className="w-6 h-6" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      category: 'help'
    },
    {
      id: 'help',
      title: 'Help Center',
      description: 'Get help, tutorials, and answers to common questions',
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      category: 'help'
    }
  ];

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'start':
        return 'Start Here';
      case 'core':
        return 'Core Features';
      case 'advanced':
        return 'Advanced Tools';
      case 'tools':
        return 'Additional Tools';
      case 'help':
        return 'Settings & Help';
      default:
        return '';
    }
  };

  const categories = ['start', 'core', 'advanced', 'tools', 'help'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CPSPunisherLogo size="large" showText={true} variant="image" />
            </div>
            <div className="text-right">
              {userName && (
                <p className="font-semibold text-gray-900">Welcome back, {userName}!</p>
              )}
              {activeCaseName && (
                <p className="text-sm text-gray-600">Active Case: {activeCaseName}</p>
              )}
              {subscriptionTier && (
                <Badge className="mt-1 bg-blue-600 text-white">
                  {subscriptionTier} Plan
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Menu Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            What would you like to do today?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose a tool below to work on your case. Each section includes instructions,
            disclaimers, and help to guide you.
          </p>
        </div>

        {/* Quick Stats */}
        {activeCaseName && (
          <Card className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Currently Working On</h3>
                <p className="text-2xl font-bold">{activeCaseName}</p>
              </div>
              <Zap className="w-12 h-12 opacity-80" />
            </div>
          </Card>
        )}

        {/* Menu Sections by Category */}
        {categories.map((category) => {
          const sectionsInCategory = menuSections.filter((s) => s.category === category);
          if (sectionsInCategory.length === 0) return null;

          return (
            <div key={category} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                {getCategoryTitle(category)}
                {category === 'start' && (
                  <Badge className="bg-blue-600 text-white">Recommended</Badge>
                )}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectionsInCategory.map((section) => (
                  <Card
                    key={section.id}
                    className={`p-6 hover:shadow-xl transition-all cursor-pointer border-2 ${section.borderColor} ${section.bgColor} group`}
                    onClick={() => onNavigate(section.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${section.bgColor} ${section.color} group-hover:scale-110 transition-transform`}>
                        {section.icon}
                      </div>
                      <div className="flex gap-1">
                        {section.isNew && (
                          <Badge className="bg-green-600 text-white text-xs">New</Badge>
                        )}
                        {section.isPro && (
                          <Badge className="bg-purple-600 text-white text-xs">Pro</Badge>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{section.description}</p>

                    <Button
                      variant="ghost"
                      className={`w-full justify-between ${section.color} hover:${section.bgColor} group-hover:translate-x-1 transition-transform`}
                    >
                      Open
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {/* Footer Legal Notice */}
        <Card className="mt-8 p-4 border-amber-300 bg-amber-50">
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
    </div>
  );
}
