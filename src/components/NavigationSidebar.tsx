// Enhanced Navigation Sidebar with Categorized Sections
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Scale,
  FileText,
  AlertTriangle,
  Lightbulb,
  Shield,
  CheckSquare,
  Calendar,
  FileEdit,
  Mic,
  Crown,
  FileCheck,
  Book,
  Library,
  Brain,
  Users,
  Database,
  Network,
  Sparkles,
  TrendingUp,
  WifiOff,
  BellRing,
  Menu,
  ChevronDown,
  ChevronRight,
  Search,
  MapPin,
} from "lucide-react";
import { Input } from "./ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  badge?: string | number;
  premium?: boolean;
  description?: string;
}

interface NavigationCategory {
  id: string;
  label: string;
  icon: any;
  items: NavigationItem[];
  defaultOpen?: boolean;
}

interface NavigationSidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  violationCount: number;
  documentCount: number;
  isMobile?: boolean;
}

export function NavigationSidebar({
  activeTab,
  onNavigate,
  violationCount,
  documentCount,
  isMobile = false,
}: NavigationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<string[]>([
    "core",
    "analysis",
  ]);

  const categories: NavigationCategory[] = [
    {
      id: "core",
      label: "Core Features",
      icon: Scale,
      defaultOpen: true,
      items: [
        {
          id: "overview",
          label: "Dashboard",
          icon: Scale,
          description: "Case overview and quick actions",
        },
        {
          id: "documents",
          label: "Documents",
          icon: FileText,
          badge: documentCount || undefined,
          description: "Upload and manage case documents",
        },
        {
          id: "timeline",
          label: "Timeline",
          icon: Calendar,
          description: "Track important case events",
        },
        {
          id: "violations",
          label: "Violations",
          icon: AlertTriangle,
          badge: violationCount || undefined,
          description: "Identify legal and procedural violations",
        },
      ],
    },
    {
      id: "analysis",
      label: "AI Analysis & Strategy",
      icon: Brain,
      defaultOpen: true,
      items: [
        {
          id: "defense",
          label: "Defense Strategy",
          icon: Lightbulb,
          description: "Generate AI-powered defense strategies",
        },
        {
          id: "aiassistant",
          label: "AI Legal Assistant",
          icon: Brain,
          premium: true,
          description: "Chat with AI legal expert",
        },
        {
          id: "airesearch",
          label: "AI Legal Research",
          icon: Sparkles,
          premium: true,
          description: "Advanced legal research and case analysis",
        },
        {
          id: "research-pro",
          label: "Legal Research Pro",
          icon: Brain,
          badge: "NEW",
          premium: true,
          description: "Westlaw-grade AI research with brief analyzer",
        },
        {
          id: "enhanced",
          label: "Enhanced AI Analysis",
          icon: Brain,
          description: "Deep document analysis",
        },
      ],
    },
    {
      id: "documents_tools",
      label: "Document Tools",
      icon: FileEdit,
      items: [
        {
          id: "casebinder",
          label: "Virtual Case Binder",
          icon: FileText,
          premium: true,
          description: "Organize all case materials",
        },
        {
          id: "generator",
          label: "Document Generator",
          icon: FileEdit,
          description: "Create legal documents and motions",
        },
        {
          id: "notarization",
          label: "Online Notarization",
          icon: FileCheck,
          badge: "NEW",
          description: "Get documents notarized 24/7 online",
        },
        {
          id: "report",
          label: "Violation Report",
          icon: FileCheck,
          premium: true,
          description: "Comprehensive violation analysis report",
        },
      ],
    },
    {
      id: "legal_resources",
      label: "Legal Resources",
      icon: Library,
      items: [
        {
          id: "rights",
          label: "Rights Guide",
          icon: Shield,
          description: "Know your parental rights",
        },
        {
          id: "quickrights",
          label: "Quick Rights Checker",
          icon: Shield,
          description: "Fast rights violation check",
        },
        {
          id: "cpspolicy",
          label: "CPS Policy Engine",
          icon: Book,
          description: "State-specific CPS regulations",
        },
        {
          id: "library",
          label: "Legal Library",
          icon: Library,
          description: "Case law and legal resources",
        },
      ],
    },
    {
      id: "research",
      label: "Legal Research",
      icon: Search,
      items: [
        {
          id: "courtlistener",
          label: "Court Opinions",
          icon: FileText,
          description: "Search court cases and opinions",
        },
        {
          id: "citations",
          label: "Citation Network",
          icon: Network,
          description: "Analyze case law citations",
        },
        {
          id: "alerts",
          label: "Legal Alerts",
          icon: BellRing,
          description: "Track relevant case law updates",
        },
        {
          id: "semantic",
          label: "Semantic Search",
          icon: Search,
          description: "Advanced legal search engine",
        },
      ],
    },
    {
      id: "tools",
      label: "Additional Tools",
      icon: TrendingUp,
      items: [
        {
          id: "evidence",
          label: "Evidence Checklist",
          icon: CheckSquare,
          description: "Track evidence collection",
        },
        {
          id: "podcast",
          label: "Case Podcast",
          icon: Mic,
          description: "Audio summaries of your case",
        },
        {
          id: "multistate",
          label: "Multi-State Law",
          icon: MapPin,
          description: "Compare state CPS laws",
        },
        {
          id: "analytics",
          label: "Advanced Analytics",
          icon: TrendingUp,
          description: "Case metrics and insights",
        },
      ],
    },
    {
      id: "attorney",
      label: "Attorney Suite",
      icon: Crown,
      items: [
        {
          id: "attorney",
          label: "Attorney Dashboard",
          icon: Crown,
          premium: true,
          description: "Professional litigation tools",
        },
        {
          id: "paralegal",
          label: "AI Paralegal",
          icon: Users,
          premium: true,
          description: "Automated legal research assistant",
        },
        {
          id: "bulkdata",
          label: "Bulk Data Manager",
          icon: Database,
          premium: true,
          description: "Process multiple cases at once",
        },
      ],
    },
    {
      id: "community",
      label: "Community & Support",
      icon: Users,
      items: [
        {
          id: "forum",
          label: "Community Forum",
          icon: Users,
          description: "Connect with other parents",
        },
        {
          id: "offline",
          label: "Offline Mode",
          icon: WifiOff,
          description: "Work without internet",
        },
      ],
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filterItems = (items: NavigationItem[]) => {
    if (!searchQuery) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const hasMatchingItems = (items: NavigationItem[]) => {
    return filterItems(items).length > 0;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search navigation features"
          />
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-1" aria-label="Main navigation">
          {categories.map((category) => {
            const filteredItems = filterItems(category.items);
            const isOpen = openCategories.includes(category.id);

            if (!hasMatchingItems(category.items) && searchQuery) {
              return null;
            }

            return (
              <Collapsible
                key={category.id}
                open={isOpen}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <category.icon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 space-y-1 pl-2">
                  {filteredItems.map((item) => (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={activeTab === item.id ? "secondary" : "ghost"}
                          className={`w-full justify-start text-sm h-auto py-2 px-3 ${
                            activeTab === item.id
                              ? "bg-primary/10 text-primary font-medium"
                              : ""
                          }`}
                          onClick={() => onNavigate(item.id)}
                        >
                          <item.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          {item.badge && (
                            <Badge variant="destructive" className="ml-2 text-xs px-1.5 py-0">
                              {item.badge}
                            </Badge>
                          )}
                          {item.premium && (
                            <Crown className="w-3 h-3 ml-2 text-amber-500 flex-shrink-0" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      {item.description && (
                        <TooltipContent side="right" className="max-w-xs">
                          <p>{item.description}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );

  // Mobile sheet navigation
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="lg:hidden">
            <Menu className="w-4 h-4 mr-2" />
            Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Navigation
            </SheetTitle>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop sidebar
  return (
    <div className="hidden lg:block w-64 border-r bg-card h-full">
      <SidebarContent />
    </div>
  );
}