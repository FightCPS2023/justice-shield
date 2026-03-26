import React from "react";
import { FileText, Upload, Brain, BookOpen, ShieldCheck, Users, AlertTriangle } from "lucide-react";

const quickStartSteps = [
  {
    icon: FileText,
    title: "Create your case",
    description: "Go to My Cases and add your CPS case details. This unlocks all AI tools and saves everything automatically.",
  },
  {
    icon: Upload,
    title: "Upload documents",
    description: "Upload court filings, CPS reports, and evidence. The analyzer runs in the background and queues large batches safely.",
  },
  {
    icon: Brain,
    title: "Review AI analysis",
    description: "Open Documents to see findings, constitutional violations, fraud/perjury flags, and recommended actions.",
  },
  {
    icon: BookOpen,
    title: "Use the Law Library",
    description: "Pick your state to access statutes, timelines, and case law. Save to Notepad for court prep.",
  },
  {
    icon: ShieldCheck,
    title: "Build your defense",
    description: "Use Defense Strategy, Smart Docs, and Case Memory to generate motions and keep facts consistent.",
  },
  {
    icon: Users,
    title: "Get help when needed",
    description: "Use the Advocate Directory or Admin Board (admins only) to connect with support.",
  }
];

const troubleshooting = [
  "If upload fails, re-login and retry. Incognito requires a fresh login token.",
  "DOCX/RTF files are now supported. For legacy .doc files, convert to PDF or .docx.",
  "If analysis is delayed, check the Analysis Queue and allow a few minutes for large batches.",
  "Use Case Memory to store verified facts so AI answers stay consistent and stronger."
];

function HowToTab() {
  return (
    <div className="space-y-8 animate-fadeIn" data-testid="howto-tab">
      <div className="text-center" data-testid="howto-header">
        <h1 className="text-3xl font-bold mb-2">How to Use THE CPS PUNISHER</h1>
        <p className="text-gray-400">Step-by-step guide to defend your family with confidence.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6" data-testid="howto-quickstart-grid">
        {quickStartSteps.map((step, index) => (
          <div
            key={step.title}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 flex gap-4"
            data-testid={`howto-step-${index}`}
          >
            <div className="w-12 h-12 rounded-xl bg-red-600/20 flex items-center justify-center">
              <step.icon className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold" data-testid={`howto-step-title-${index}`}>{step.title}</h3>
              <p className="text-sm text-gray-400" data-testid={`howto-step-desc-${index}`}>{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6" data-testid="howto-workflow">
        <h2 className="text-xl font-semibold mb-3">Daily Workflow</h2>
        <ul className="space-y-2 text-gray-300">
          <li data-testid="howto-workflow-1">1. Open your case → Upload new documents or evidence.</li>
          <li data-testid="howto-workflow-2">2. Review AI analysis → Save key findings to Case Memory.</li>
          <li data-testid="howto-workflow-3">3. Update violations and timeline → keep your case record clean.</li>
          <li data-testid="howto-workflow-4">4. Generate motions, objections, and strategy when deadlines approach.</li>
        </ul>
      </div>

      <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-6" data-testid="howto-troubleshooting">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-semibold">Troubleshooting Tips</h2>
        </div>
        <ul className="space-y-2 text-gray-300">
          {troubleshooting.map((tip, index) => (
            <li key={tip} data-testid={`howto-troubleshooting-${index}`}>• {tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default HowToTab;
