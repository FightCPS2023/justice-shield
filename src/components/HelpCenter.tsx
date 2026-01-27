// Help Center - Comprehensive User Guide and Tooltips
import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { TooltipProvider } from "./ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  HelpCircle,
  FileText,
  AlertTriangle,
  Lightbulb,
  Shield,
  Calendar,
  CheckSquare,
  Upload,
  BookOpen,
  Video,
  MessageCircle,
} from "lucide-react";

export function HelpCenter() {
  const [open, setOpen] = useState(false);

  const quickStartGuide = [
    {
      step: 1,
      title: "Set Up Your Case",
      icon: FileText,
      description: "Enter your basic case information in the Dashboard",
      details: [
        "Case number (if you have one)",
        "County where your case is filed",
        "Date the case was opened",
        "Names of your caseworker and attorney (if assigned)",
      ],
    },
    {
      step: 2,
      title: "Upload Documents",
      icon: Upload,
      description: "Add all CPS-related documents for AI analysis",
      details: [
        "Drag and drop multiple files at once",
        "Supports PDFs, Word docs, images, and scanned documents",
        "Each document is automatically analyzed for violations",
        "Timeline events and case info are extracted automatically",
      ],
    },
    {
      step: 3,
      title: "Identify Violations",
      icon: AlertTriangle,
      description: "Review and check all violations that apply to your case",
      details: [
        "24 different violation types across 4 categories",
        "Read each description carefully",
        "Check all that apply - be thorough",
        "Document specific examples for each violation",
      ],
    },
    {
      step: 4,
      title: "Build Your Timeline",
      icon: Calendar,
      description: "Document every important event chronologically",
      details: [
        "Add dates of CPS visits, phone calls, court hearings",
        "Include interactions with caseworkers",
        "Note deadlines and when they were or weren't met",
        "Auto-populated from uploaded documents",
      ],
    },
    {
      step: 5,
      title: "Generate Defense Strategy",
      icon: Lightbulb,
      description: "Get AI-powered defense strategies based on your violations",
      details: [
        "Automatically created from identified violations",
        "Prioritized action steps",
        "Legal motions and arguments to file",
        "Evidence collection recommendations",
      ],
    },
    {
      step: 6,
      title: "Collect Evidence",
      icon: CheckSquare,
      description: "Use the Evidence Checklist to gather supporting materials",
      details: [
        "Documents and records",
        "Character references",
        "Photos and videos",
        "Witness information",
      ],
    },
  ];

  const faqItems = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "Do I need an attorney to use this tool?",
          a: "This tool is designed to help YOU build your defense, whether you have an attorney or not. However, we strongly recommend consulting with a qualified family law attorney. This tool can help you work more effectively with your attorney by organizing your case and identifying key issues.",
        },
        {
          q: "Is my information private and secure?",
          a: "Yes. Your case information is stored securely. We use encryption and follow best practices for data security. However, always be cautious about what information you share online. Keep backup copies of all important documents.",
        },
        {
          q: "How does the AI analysis work?",
          a: "When you upload a document, our AI system reads and analyzes it for: (1) Potential CPS violations, (2) Important timeline events, (3) Key case information like dates and names. The AI flags issues that you should review and potentially raise with your attorney or in court.",
        },
      ],
    },
    {
      category: "Using Features",
      questions: [
        {
          q: "What file types can I upload?",
          a: "You can upload PDF files, Word documents (.doc, .docx), text files (.txt), and images (JPG, PNG, GIF, BMP). We support both text-based PDFs and scanned PDFs with OCR. CamScanner PDFs work great!",
        },
        {
          q: "How many violations should I check?",
          a: "Check ALL violations that genuinely apply to your case. Don't exaggerate, but also don't minimize. CPS cases often involve multiple violations. The average case has 3-7 violations, but some have many more. Quality matters more than quantity - make sure you can document each violation you check.",
        },
        {
          q: "What's the difference between Free and Premium?",
          a: "Free tier lets you: upload 5 documents/month, see basic analysis for 2 violations, access core features. Premium unlocks: unlimited documents, full analysis of all violations, AI Legal Assistant, advanced research tools, document generator, and more. See the Pricing page for details.",
        },
        {
          q: "How do I use the timeline effectively?",
          a: "Add EVERY significant event with specific dates and details. Include: CPS visits, phone calls, court hearings, missed appointments, deadlines, when you complied with requests, when CPS violated procedures. The timeline often reveals patterns of violations and proves your cooperation.",
        },
      ],
    },
    {
      category: "Legal Strategy",
      questions: [
        {
          q: "What should I do first when CPS contacts me?",
          a: "(1) Stay calm and polite, (2) DO NOT let them in without a warrant, (3) DO NOT answer questions without an attorney, (4) DO NOT sign anything, (5) Document everything - write down who came, when, what they said, (6) Contact an attorney immediately, (7) Start using this tool to document and analyze your case.",
        },
        {
          q: "Can I represent myself in CPS court?",
          a: "While you technically can represent yourself (called 'pro se'), CPS cases are complex and the stakes are incredibly high. We STRONGLY recommend getting an attorney. This tool can help you whether you're pro se or working with an attorney, but it's not a substitute for professional legal representation.",
        },
        {
          q: "How do I use the Defense Strategies?",
          a: "The Defense Strategies give you specific legal actions to take. Review each strategy with your attorney. They include: motions to file, arguments to make, evidence to gather, and legal precedents to cite. Don't just read them - ACT on them with your attorney's guidance.",
        },
      ],
    },
    {
      category: "Evidence & Documentation",
      questions: [
        {
          q: "What makes good evidence?",
          a: "Good evidence is: (1) Documented - written, photographed, or recorded, (2) Dated and timestamped, (3) From credible sources, (4) Relevant to the allegations, (5) Organized and easy to understand. Character references from professionals (teachers, doctors, clergy) are particularly valuable.",
        },
        {
          q: "Should I record CPS interactions?",
          a: "Recording laws vary by state. Some states require all parties to consent (two-party consent states), others only require one party consent (you). Check your state law. When in doubt, take detailed written notes immediately after every interaction - include date, time, who was present, what was said.",
        },
        {
          q: "How important are photos?",
          a: "Photos are VERY important. They provide visual evidence that's hard to dispute. Take photos of: your home showing it's clean and safe, food in fridge/pantry, children's rooms, children looking healthy and happy, any alleged problems AFTER you fix them. Date stamp all photos if possible.",
        },
      ],
    },
  ];

  const featureGuides = [
    {
      title: "Documents Section",
      icon: FileText,
      tips: [
        "Upload documents as soon as you receive them - don't wait",
        "Use drag-and-drop for multiple files at once",
        "The AI analysis takes 10-30 seconds per document",
        "Review the analysis results and add any violations to your checklist",
        "Keep originals and backups of all documents",
      ],
    },
    {
      title: "Violations Checker",
      icon: AlertTriangle,
      tips: [
        "Read each violation description carefully before checking",
        "Document specific examples for violations you check",
        "Constitutional violations (1st, 4th, 14th Amendment) are powerful",
        "Procedural violations show CPS didn't follow the rules",
        "Evidence violations attack the credibility of CPS claims",
      ],
    },
    {
      title: "Defense Strategy",
      icon: Lightbulb,
      tips: [
        "Strategies are prioritized: High > Essential > Medium",
        "Each strategy includes specific action steps",
        "Print strategies to discuss with your attorney",
        "Update regularly as your case develops",
        "Focus on High priority items first",
      ],
    },
    {
      title: "Rights Guide",
      icon: Shield,
      tips: [
        "Read this BEFORE your first CPS interaction if possible",
        "You have MORE rights than CPS will tell you",
        "Knowing your rights prevents you from being intimidated",
        "Share the 'DO and DON'T' lists with family members",
        "Exercise your rights politely but firmly",
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="w-4 h-4" />
          Help Center
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Help Center - Complete Guide
          </DialogTitle>
          <DialogDescription>
            Everything you need to know about using The CPS Punisher to defend your case
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Quick Start Guide */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <h3 className="mb-4 flex items-center gap-2">
                <Video className="w-5 h-5" />
                Quick Start Guide
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Follow these 6 steps to build a strong defense for your CPS case:
              </p>
              <div className="space-y-4">
                {quickStartGuide.map((step) => (
                  <div
                    key={step.step}
                    className="flex gap-4 p-4 bg-background rounded-lg border"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <step.icon className="w-4 h-4 text-primary" />
                        <h4 className="font-medium">{step.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {step.description}
                      </p>
                      <ul className="text-sm space-y-1">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Feature-Specific Tips */}
            <Card className="p-6">
              <h3 className="mb-4">Feature-Specific Tips</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {featureGuides.map((guide) => (
                  <div
                    key={guide.title}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <guide.icon className="w-5 h-5 text-primary" />
                      <h4 className="font-medium">{guide.title}</h4>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {guide.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>

            {/* FAQ */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Frequently Asked Questions
              </h3>
              <Accordion type="single" collapsible className="space-y-2">
                {faqItems.map((category, catIdx) => (
                  <div key={catIdx} className="space-y-2">
                    <h4 className="font-medium text-sm text-primary mt-4 mb-2">
                      {category.category}
                    </h4>
                    {category.questions.map((item, qIdx) => (
                      <AccordionItem
                        key={`${catIdx}-${qIdx}`}
                        value={`${catIdx}-${qIdx}`}
                        className="border rounded-lg px-4"
                      >
                        <AccordionTrigger className="text-sm hover:no-underline">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </div>
                ))}
              </Accordion>
            </Card>

            {/* Important Reminders */}
            <Card className="p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <h3 className="mb-3 text-amber-900 dark:text-amber-100">
                🚨 Critical Reminders
              </h3>
              <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    <strong>Get an attorney:</strong> This tool helps you build
                    your defense, but it's not a substitute for professional
                    legal representation
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    <strong>Act quickly:</strong> CPS cases have strict
                    deadlines. Missing deadlines can hurt your case
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    <strong>Document everything:</strong> Write it down, take
                    photos, save emails. If it's not documented, it didn't
                    happen
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    <strong>Stay professional:</strong> Even when angry or
                    scared, remain calm and respectful in all CPS interactions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    <strong>Backup your data:</strong> Keep copies of all
                    documents in multiple locations (cloud, USB drive, trusted
                    friend)
                  </span>
                </li>
              </ul>
            </Card>

            {/* Contact & Support */}
            <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <h3 className="mb-3 text-blue-900 dark:text-blue-100">
                Need More Help?
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                If you have questions not answered here:
              </p>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>• Check the tooltip icons (?) throughout the app for context-specific help</li>
                <li>• Use the AI Legal Assistant (Premium) to ask specific questions about your case</li>
                <li>• Visit the Community Forum to connect with other parents</li>
                <li>• Review the Legal Resources Library for in-depth legal information</li>
              </ul>
            </Card>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => setOpen(false)}>Got It!</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
