import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { CPSPunisherLogo } from './CPSPunisherLogo';
import {
  Home,
  MessageSquare,
  Upload,
  AlertTriangle,
  Shield,
  FileText,
  Clock,
  BookOpen,
  CheckCircle,
  Brain,
  Calendar,
  Users,
  BarChart,
  Settings,
  HelpCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string | number;
  isPro?: boolean;
  isNew?: boolean;
}

interface NavigationSidebarRevampedProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onBackToMenu: () => void;
  violationCount?: number;
  documentCount?: number;
}

export function NavigationSidebarRevamped({
  activeSection,
  onNavigate,
  onBackToMenu,
  violationCount = 0,
  documentCount = 0
}: NavigationSidebarRevampedProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navigationItems: { category: string; items: NavItem[] }[] = [
    {
      category: 'Quick Access',
      items: [
        {
          id: 'menu',
          label: 'Main Menu',
          icon: Home,
          isNew: true
        },
        {
          id: 'situation',
          label: 'Describe Situation',
          icon: MessageSquare,
          isNew: true
        }
      ]
    },
    {
      category: 'Core Tools',
      items: [
        {
          id: 'documents',
          label: 'Upload Documents',
          icon: Upload,
          badge: documentCount || undefined
        },
        {
          id: 'violations',
          label: 'Violation Checker',
          icon: AlertTriangle,
          badge: violationCount || undefined
        },
        {
          id: 'defense',
          label: 'Defense Strategy',
          icon: Shield
        },
        {
          id: 'generator',
          label: 'Legal Documents',
          icon: FileText
        },
        {
          id: 'timeline',
          label: 'Case Timeline',
          icon: Clock
        }
      ]
    },
    {
      category: 'Knowledge',
      items: [
        {
          id: 'rights',
          label: 'Know Your Rights',
          icon: BookOpen
        },
        {
          id: 'evidence',
          label: 'Evidence Checklist',
          icon: CheckCircle
        },
        {
          id: 'ai-research',
          label: 'AI Legal Research',
          icon: Brain,
          isPro: true
        }
      ]
    },
    {
      category: 'Additional',
      items: [
        {
          id: 'calendar',
          label: 'Calendar & Deadlines',
          icon: Calendar
        },
        {
          id: 'community',
          label: 'Community Hub',
          icon: Users
        },
        {
          id: 'analytics',
          label: 'Case Analytics',
          icon: BarChart
        }
      ]
    },
    {
      category: 'Account',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings
        },
        {
          id: 'help',
          label: 'Help Center',
          icon: HelpCircle
        }
      ]
    }
  ];

  return (
    <div className="h-full flex flex-col bg-white border-r">
      {/* Logo Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600">
        <CPSPunisherLogo size="small" showText={true} variant="image" className="brightness-0 invert" />
      </div>

      {/* Main Menu Button */}
      <div className="p-3 border-b bg-blue-50">
        <Button
          onClick={onBackToMenu}
          variant={activeSection === 'menu' ? 'default' : 'outline'}
          className="w-full justify-start gap-3 h-12 text-base font-semibold"
        >
          <Home className="w-5 h-5" />
          <span>Main Menu</span>
          {activeSection === 'menu' && (
            <ChevronRight className="w-4 h-4 ml-auto" />
          )}
        </Button>
      </div>

      {/* Navigation Items */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-6">
          {navigationItems.map((category) => (
            <div key={category.category}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                {category.category}
              </h3>
              <div className="space-y-1">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <Button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      variant={isActive ? 'default' : 'ghost'}
                      className={`
                        w-full justify-start gap-3 h-11 text-sm
                        ${isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-100'}
                        ${hoveredItem === item.id && !isActive ? 'translate-x-1 transition-transform' : ''}
                      `}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-left font-medium">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-1">
                        {item.badge && (
                          <Badge
                            variant={isActive ? 'secondary' : 'default'}
                            className={`
                              text-xs h-5 min-w-[20px] justify-center
                              ${isActive ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}
                            `}
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {item.isNew && (
                          <Badge className="bg-green-600 text-white text-xs h-5">
                            New
                          </Badge>
                        )}
                        {item.isPro && (
                          <Badge className="bg-purple-600 text-white text-xs h-5">
                            <Sparkles className="w-3 h-3" />
                          </Badge>
                        )}
                        {isActive && (
                          <ChevronRight className="w-4 h-4 ml-1" />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t bg-gray-50">
        <div className="text-xs text-gray-600 text-center mb-2">
          Defending Your Rights
        </div>
        <div className="flex items-center justify-center">
          <CPSPunisherLogo size="tiny" showText={false} variant="image" />
        </div>
      </div>
    </div>
  );
}
