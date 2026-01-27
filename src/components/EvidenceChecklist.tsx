import { useState } from "react";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { FileCheck, Camera, FileText, Users, Home, Heart } from "lucide-react";
import { HelpTooltip, InfoBox } from "./ui/help-tooltip";

export function EvidenceChecklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const evidenceCategories = [
    {
      title: "Documentation & Records",
      icon: FileText,
      items: [
        "All CPS reports and correspondence",
        "Court documents and orders",
        "Case plan and service agreements",
        "Your notes from all CPS interactions (dates, times, what was said)",
        "Text messages and emails with CPS",
        "Any recordings of interactions (if legal in your state)",
        "Medical records showing child's health",
        "School records showing attendance and performance",
        "Therapy or counseling records",
        "Drug test results (if applicable)",
      ],
    },
    {
      title: "Character & Parenting Evidence",
      icon: Heart,
      items: [
        "Character reference letters from teachers, doctors, neighbors",
        "Employment records showing stability",
        "Certificates from completed parenting classes",
        "Proof of participation in recommended services",
        "Religious or community involvement documentation",
        "Volunteer work or positive activities",
        "Evidence of bond with your children (cards, drawings, photos)",
        "Witness statements supporting your parenting",
      ],
    },
    {
      title: "Home & Living Conditions",
      icon: Home,
      items: [
        "Photos of home showing clean, safe environment",
        "Lease or mortgage showing stable housing",
        "Utility bills showing services are on",
        "Photos of children's rooms and beds",
        "Photos of food in refrigerator/pantry",
        "Home safety measures (smoke detectors, locks, etc.)",
        "Documentation of any home improvements made",
      ],
    },
    {
      title: "Photos & Video Evidence",
      icon: Camera,
      items: [
        "Photos of children looking healthy and happy",
        "Photos from family activities and outings",
        "Photos showing child's belongings and living space",
        "Before/after photos if CPS claims were about home conditions",
        "Photos of any alleged injuries (with timestamps)",
        "Video of positive parent-child interactions",
        "Photos showing children in your care over time",
      ],
    },
    {
      title: "Witness Information",
      icon: Users,
      items: [
        "List of potential witnesses with contact information",
        "People who have observed you parenting",
        "People who can testify to false allegations",
        "Professionals who have worked with your family",
        "Family members who can support your case",
        "Neighbors who know your family",
        "Teachers, coaches, or mentors of your children",
      ],
    },
    {
      title: "Evidence Contradicting CPS Claims",
      icon: FileCheck,
      items: [
        "Documents showing CPS statements are false",
        "Timeline showing contradictions in their reports",
        "Receipts or records disproving allegations",
        "Alibi evidence (if accused of something you didn't do)",
        "Expert reports contradicting CPS conclusions",
        "Evidence of bias by investigator",
        "Proof of services you were denied",
        "Documentation of procedural violations",
      ],
    },
  ];

  const totalItems = evidenceCategories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  const handleCheck = (itemId: string, checked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [itemId]: checked }));
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          Evidence Collection Checklist
          <HelpTooltip 
            content="Strong evidence is crucial for defending your case. This checklist helps you systematically gather documentation, character references, photos, and witness information that can prove your side of the story and refute false allegations." 
            side="right"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Gather and organize evidence to support your defense. Check off items as you collect them.
        </p>
      </div>

      <InfoBox title="Why Evidence Collection is Critical" variant="primary">
        <p className="mb-3">The strength of your case depends on the evidence you can present:</p>
        <ul className="space-y-2 list-disc list-inside">
          <li><strong>Burden of Proof:</strong> CPS must prove their case, but strong counter-evidence strengthens your position</li>
          <li><strong>Credibility:</strong> Documentation beats verbal claims every time</li>
          <li><strong>Timeline Protection:</strong> Collect evidence NOW - memories fade and documents get lost</li>
          <li><strong>Multiple Sources:</strong> Different types of evidence (documents, photos, witnesses) reinforce each other</li>
        </ul>
        <p className="mt-3 text-xs italic">💡 Pro Tip: Even if you think something isn't important, collect it anyway. You can decide what to use later with your attorney.</p>
      </InfoBox>

      <Card className="p-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm items-center">
            <span>Collection Progress</span>
            <span>
              {checkedCount} of {totalItems} items ({Math.round(progress)}%)
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {progress < 25 && "Just getting started - keep collecting evidence!"}
            {progress >= 25 && progress < 50 && "Good progress! Continue building your evidence base."}
            {progress >= 50 && progress < 75 && "Great work! You're building a strong case."}
            {progress >= 75 && progress < 100 && "Excellent! You have substantial evidence collected."}
            {progress === 100 && "🎉 Complete! You've gathered all recommended evidence types."}
          </p>
        </div>
      </Card>

      <div className="space-y-6">
        {evidenceCategories.map((category) => {
          const Icon = category.icon;
          const categoryItems = category.items.length;
          const categoryChecked = category.items.filter(
            (_, idx) => checkedItems[`${category.title}-${idx}`]
          ).length;

          return (
            <Card key={category.title} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary" />
                  <span>{category.title}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {categoryChecked}/{categoryItems}
                </span>
              </div>

              <div className="space-y-3">
                {category.items.map((item, index) => {
                  const itemId = `${category.title}-${index}`;
                  return (
                    <div key={itemId} className="flex items-start space-x-3 p-2 rounded hover:bg-muted/50">
                      <Checkbox
                        id={itemId}
                        checked={checkedItems[itemId] || false}
                        onCheckedChange={(checked) => handleCheck(itemId, checked as boolean)}
                        className="mt-0.5"
                      />
                      <label htmlFor={itemId} className="text-sm cursor-pointer flex-1">
                        {item}
                      </label>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-900 dark:text-blue-100">Tips for Evidence Collection</span>
          </div>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Make copies of everything and keep originals safe</li>
            <li>• Organize documents chronologically</li>
            <li>• Date and label all photos and videos</li>
            <li>• Get witness statements in writing when possible</li>
            <li>• Store backup copies in a secure location (cloud storage, trusted friend)</li>
            <li>• Don't wait - collect evidence as soon as possible</li>
            <li>• Share all evidence with your attorney</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
