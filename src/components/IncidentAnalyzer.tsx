import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  AlertTriangle,
  Scale,
  FileText,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Gavel,
  Shield,
  TrendingUp,
  TrendingDown,
  ExternalLink,
} from 'lucide-react';
import { HelpTooltip } from './ui/help-tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { toast } from 'sonner@2.0.3';

interface Incident {
  id: string;
  date: string;
  title: string;
  description: string;
  rightsViolated: string[];
  statutes: string[];
  minimumOutcome: string;
  maximumOutcome: string;
  recommendedActions: string[];
  recommendedDocuments: Array<{
    name: string;
    description: string;
  }>;
}

interface IncidentAnalyzerProps {
  onAddToTimeline?: (event: { date: string; title: string; description: string }) => void;
  onNavigateToDocuments?: () => void;
}

export function IncidentAnalyzer({ onAddToTimeline, onNavigateToDocuments }: IncidentAnalyzerProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedIncidents, setExpandedIncidents] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    date: '',
    title: '',
    description: '',
    violationType: '',
  });

  const violationTypes = [
    {
      value: 'warrantless_search',
      label: 'Warrantless Home Search/Entry',
      rights: [
        'Fourth Amendment - Protection against unreasonable searches',
        'Right to privacy in your home',
        'Right to refuse entry without warrant/exigent circumstances',
      ],
      statutes: [
        '42 U.S.C. § 1983 - Civil Rights Violation',
        'Fourth Amendment, U.S. Constitution',
        'Exigent Circumstances Doctrine (limited exceptions)',
        'State Child Welfare Act - Investigative Procedures',
      ],
      minimumOutcome: 'Evidence obtained during illegal search is suppressible in court. Case worker may face disciplinary action. Agency required to implement procedural corrections.',
      maximumOutcome: 'Complete case dismissal. Evidence suppression. Federal civil rights lawsuit under § 1983 for damages including emotional distress, lost wages, attorney fees. Qualified immunity may be overcome if violation was clearly established. Potential punitive damages. Policy changes mandated.',
      actions: [
        'File Motion to Suppress all evidence obtained from illegal search',
        'File § 1983 lawsuit in federal court for Fourth Amendment violation',
        'Request immediate return of children if removal based on illegally obtained evidence',
        'File administrative complaint against case worker',
        'Request sanctions against CPS for constitutional violation',
        'Document all property damage from forced entry',
      ],
      documents: [
        {
          name: 'Motion to Suppress Evidence',
          description: 'Formal request to the court to exclude evidence obtained during an illegal search.',
        },
        {
          name: '§ 1983 Lawsuit Complaint',
          description: 'Legal document initiating a federal civil rights lawsuit against CPS for Fourth Amendment violation.',
        },
        {
          name: 'Administrative Complaint Form',
          description: 'Form to file a complaint against a CPS worker for constitutional violations.',
        },
      ],
    },
    {
      value: 'no_miranda',
      label: 'Interrogation Without Miranda Warnings',
      rights: [
        'Fifth Amendment - Right against self-incrimination',
        'Sixth Amendment - Right to counsel',
        'Miranda v. Arizona protections',
      ],
      statutes: [
        'Miranda v. Arizona, 384 U.S. 436 (1966)',
        'Fifth Amendment, U.S. Constitution',
        'Sixth Amendment, U.S. Constitution',
        '42 U.S.C. § 1983 - Civil Rights Violation',
      ],
      minimumOutcome: 'Statements made during custodial interrogation without Miranda warnings are inadmissible. Agency must provide remedial training.',
      maximumOutcome: 'Complete suppression of all statements and derivative evidence. Case dismissal if prosecution cannot proceed without suppressed statements. Civil rights lawsuit for coerced statements. Attorney fees. Procedural safeguards mandated for all future investigations.',
      actions: [
        'File Motion to Suppress all statements made without Miranda warnings',
        'File Motion to Suppress all "fruit of the poisonous tree" evidence',
        'Request evidentiary hearing on voluntariness of statements',
        'File § 1983 claim for Fifth Amendment violation',
        'Request adverse inference instruction at trial',
        'Document psychological coercion or pressure tactics used',
      ],
      documents: [
        {
          name: 'Motion to Suppress Statements',
          description: 'Formal request to the court to exclude statements made without Miranda warnings.',
        },
        {
          name: '§ 1983 Lawsuit Complaint',
          description: 'Legal document initiating a federal civil rights lawsuit against CPS for Fifth Amendment violation.',
        },
        {
          name: 'Evidentiary Hearing Request',
          description: 'Form to request an evidentiary hearing on the voluntariness of statements.',
        },
      ],
    },
    {
      value: 'no_due_process',
      label: 'Failure to Provide Due Process Notice',
      rights: [
        'Fourteenth Amendment - Due Process Clause',
        'Right to timely notice of allegations',
        'Right to opportunity to respond',
        'Right to hearing before deprivation of parental rights',
      ],
      statutes: [
        'Fourteenth Amendment, U.S. Constitution',
        '42 U.S.C. § 1983 - Civil Rights Violation',
        'Mathews v. Eldridge, 424 U.S. 319 (1976)',
        'State Administrative Procedures Act',
        'Federal Child Abuse Prevention and Treatment Act (CAPTA)',
      ],
      minimumOutcome: 'Court must provide immediate hearing opportunity. Extension of deadlines to allow adequate response time. Case may be stayed pending proper notice.',
      maximumOutcome: 'Complete case dismissal for due process violation. All proceedings declared void. Children returned immediately. Civil rights lawsuit for deprivation of fundamental liberty interest in family integrity. Damages for emotional distress. Injunctive relief requiring procedural reforms.',
      actions: [
        'File Emergency Motion to Dismiss for Due Process Violation',
        'Request immediate hearing date if none provided',
        'File § 1983 lawsuit for procedural due process violation',
        'Request continuance to allow adequate preparation time',
        'File Motion to Set Aside all prior orders obtained without proper notice',
        'Document exact dates when notice was/wasn\'t provided',
      ],
      documents: [
        {
          name: 'Emergency Motion to Dismiss',
          description: 'Formal request to the court to dismiss the case for due process violation.',
        },
        {
          name: '§ 1983 Lawsuit Complaint',
          description: 'Legal document initiating a federal civil rights lawsuit against CPS for procedural due process violation.',
        },
        {
          name: 'Continuance Request',
          description: 'Form to request a continuance to allow adequate preparation time.',
        },
      ],
    },
    {
      value: 'deny_counsel',
      label: 'Denial of Right to Attorney',
      rights: [
        'Sixth Amendment - Right to counsel',
        'Fourteenth Amendment - Due Process',
        'Right to effective assistance of counsel',
        'Right to consult attorney before interviews',
      ],
      statutes: [
        'Sixth Amendment, U.S. Constitution',
        'In re Gault, 387 U.S. 1 (1967)',
        '42 U.S.C. § 1983 - Civil Rights Violation',
        'State Rules of Professional Conduct',
        'ABA Standards for Counsel in Dependency Cases',
      ],
      minimumOutcome: 'Immediate appointment of counsel if indigent. Stay of all proceedings until representation secured. Suppression of statements made without counsel present.',
      maximumOutcome: 'Reversal of all proceedings conducted without counsel. Case dismissal. Civil rights lawsuit for denial of counsel. Damages including attorney fees. Mandamus relief compelling appointment of counsel in all future cases. Bar complaint against opposing counsel if interference.',
      actions: [
        'File Emergency Motion for Continuance to Obtain Counsel',
        'File Motion to Suppress all statements made without attorney present',
        'Request appointment of counsel if indigent',
        'File § 1983 lawsuit for Sixth Amendment violation',
        'File Motion to Set Aside all orders entered while unrepresented',
        'File bar complaint if CPS attorney interfered with right to counsel',
      ],
      documents: [
        {
          name: 'Emergency Motion for Continuance',
          description: 'Formal request to the court to continue the case to obtain counsel.',
        },
        {
          name: '§ 1983 Lawsuit Complaint',
          description: 'Legal document initiating a federal civil rights lawsuit against CPS for Sixth Amendment violation.',
        },
        {
          name: 'Bar Complaint Form',
          description: 'Form to file a bar complaint against a CPS attorney for interfering with the right to counsel.',
        },
      ],
    },
    {
      value: 'child_interview',
      label: 'Illegal Child Interview (School/Without Parent)',
      rights: [
        'Parental right to direct upbringing of children',
        'Fourteenth Amendment - Substantive Due Process',
        'Right to be present during child questioning',
        'Fourth Amendment protection against seizure of child',
      ],
      statutes: [
        'Fourteenth Amendment, U.S. Constitution',
        'Troxel v. Granville, 530 U.S. 57 (2000)',
        'Meyer v. Nebraska, 262 U.S. 390 (1923)',
        '42 U.S.C. § 1983 - Civil Rights Violation',
        'State Education Code - School Access',
        'Family Educational Rights and Privacy Act (FERPA)',
      ],
      minimumOutcome: 'Child\'s statements suppressed if obtained in violation of parental rights. School disciplined for allowing unauthorized access. Policy changes required.',
      maximumOutcome: 'Complete suppression of child interview and all derivative evidence. Case dismissal if dependent on child statements. § 1983 lawsuit against CPS and school district for violating fundamental parental rights. Damages. Injunctive relief. School policy reforms mandated.',
      actions: [
        'File Motion to Suppress all statements from child interview',
        'File § 1983 lawsuit against CPS and school district',
        'Send demand letter to school citing FERPA and state law violations',
        'File complaint with State Department of Education',
        'Request order prohibiting future unauthorized contact with children',
        'File for protective order limiting CPS access to children',
      ],
      documents: [
        {
          name: 'Motion to Suppress Child Statements',
          description: 'Formal request to the court to exclude statements from a child interview.',
        },
        {
          name: '§ 1983 Lawsuit Complaint',
          description: 'Legal document initiating a federal civil rights lawsuit against CPS and school district for violating fundamental parental rights.',
        },
        {
          name: 'Demand Letter to School',
          description: 'Formal letter to the school citing FERPA and state law violations.',
        },
      ],
    },
    {
      value: 'false_allegations',
      label: 'False Allegations/Evidence Fabrication',
      rights: [
        'Fourteenth Amendment - Due Process',
        'Right to fair proceedings',
        'Right to confront evidence',
        'Freedom from malicious prosecution',
      ],
      statutes: [
        'Brady v. Maryland, 373 U.S. 83 (1963) - Disclosure of exculpatory evidence',
        'Napue v. Illinois, 360 U.S. 264 (1959) - False testimony',
        '42 U.S.C. § 1983 - Civil Rights Violation',
        'State Perjury Statutes',
        'State Child Welfare Act - Reporting Requirements',
      ],
      minimumOutcome: 'Case worker removed from case. Evidence excluded. Adverse inference instruction. Possible criminal investigation of case worker.',
      maximumOutcome: 'Immediate case dismissal. Criminal prosecution of case worker for perjury/false reporting. § 1983 lawsuit for malicious prosecution and fabrication of evidence (qualified immunity often overcome). Compensatory and punitive damages. Attorney fees. CPS agency-wide training mandated. Case worker termination.',
      actions: [
        'File Motion to Dismiss based on prosecutorial misconduct',
        'File criminal complaint against case worker for false reporting',
        'File § 1983 lawsuit for fabrication of evidence',
        'Subpoena all case worker notes, emails, and recordings',
        'Hire forensic expert to analyze evidence manipulation',
        'File bar complaint if attorney knowingly used false evidence',
        'Request sanctions under Rule 11 or state equivalent',
      ],
      documents: [
        {
          name: 'Motion to Dismiss',
          description: 'Formal request to the court to dismiss the case based on prosecutorial misconduct.',
        },
        {
          name: 'Criminal Complaint Form',
          description: 'Form to file a criminal complaint against a CPS worker for false reporting.',
        },
        {
          name: '§ 1983 Lawsuit Complaint',
          description: 'Legal document initiating a federal civil rights lawsuit against CPS for fabrication of evidence.',
        },
      ],
    },
    {
      value: 'missed_deadlines',
      label: 'CPS Missed Statutory Deadlines',
      rights: [
        'Right to speedy resolution',
        'Statutory right to services within timeframes',
        'Children\'s right to permanency',
        'Due process right to timely proceedings',
      ],
      statutes: [
        'Adoption and Safe Families Act (ASFA) - 15/22 month timeline',
        'Indian Child Welfare Act (ICWA) - Specific deadlines',
        'State Child Welfare Act - Service plan deadlines',
        'Court-ordered deadlines',
        'Federal Adoption Assistance Act',
      ],
      minimumOutcome: 'Court must enforce deadlines. Extension of reunification services. CPS held in contempt for non-compliance. Case plan revised.',
      maximumOutcome: 'Case dismissal for failure to prosecute within statutory timeframes. Immediate return of children. § 1983 lawsuit for denial of services. Damages for extended separation. Court-ordered training and oversight of CPS. Contempt sanctions including fines.',
      actions: [
        'File Motion to Dismiss for Failure to Comply with Statutory Deadlines',
        'File Motion for Contempt against CPS agency',
        'Request extension of reunification services due to CPS delays',
        'File writ of mandate compelling CPS to provide required services',
        'Document every missed deadline with exact dates',
        'Request adverse inference that CPS case is without merit',
      ],
      documents: [
        {
          name: 'Motion to Dismiss',
          description: 'Formal request to the court to dismiss the case for failure to comply with statutory deadlines.',
        },
        {
          name: 'Motion for Contempt',
          description: 'Formal request to the court to hold CPS in contempt for non-compliance.',
        },
        {
          name: 'Writ of Mandate',
          description: 'Formal request to the court to compel CPS to provide required services.',
        },
      ],
    },
    {
      value: 'no_least_restrictive',
      label: 'Failure to Use Least Restrictive Means',
      rights: [
        'Right to family integrity',
        'Fourteenth Amendment - Substantive Due Process',
        'Statutory requirement for reasonable efforts',
        'Right to least intrusive intervention',
      ],
      statutes: [
        'Adoption and Safe Families Act - Reasonable Efforts Requirement',
        '42 U.S.C. § 671(a)(15) - Reasonable efforts',
        'State Child Welfare Act - Least restrictive alternative',
        'Fourteenth Amendment, U.S. Constitution',
        '42 U.S.C. § 1983 - Civil Rights Violation',
      ],
      minimumOutcome: 'Court must find reasonable efforts not made. Children returned with services in place. CPS ordered to provide in-home services.',
      maximumOutcome: 'Immediate return of children. Case dismissal. § 1983 lawsuit for unnecessary family separation. Damages for emotional harm. Injunctive relief requiring reasonable efforts findings in all future cases. Policy reforms mandated.',
      actions: [
        'File Motion to Return Children - Reasonable Efforts Not Made',
        'Challenge removal as not least restrictive means available',
        'File § 1983 lawsuit for substantive due process violation',
        'Request court finding of "no reasonable efforts"',
        'Present evidence of available alternatives (relatives, services)',
        'Request expedited reunification with in-home services',
      ],
      documents: [
        {
          name: 'Motion to Return Children',
          description: 'Formal request to the court to return children due to reasonable efforts not being made.',
        },
        {
          name: '§ 1983 Lawsuit Complaint',
          description: 'Legal document initiating a federal civil rights lawsuit against CPS for substantive due process violation.',
        },
        {
          name: 'Evidence of Alternatives',
          description: 'Documentation of available alternatives (relatives, services) to demonstrate least restrictive means.',
        },
      ],
    },
    {
      value: 'retaliation',
      label: 'Retaliation for Asserting Rights',
      rights: [
        'First Amendment - Right to petition government',
        'Right to legal counsel without penalty',
        'Freedom from retaliation for asserting constitutional rights',
      ],
      statutes: [
        'First Amendment, U.S. Constitution',
        '42 U.S.C. § 1983 - Civil Rights Violation',
        'Retaliation doctrine under civil rights law',
        'State whistleblower protection laws',
      ],
      minimumOutcome: 'Evidence of retaliatory motive can be used against CPS. Adverse inference instruction. Case worker reassignment.',
      maximumOutcome: 'Case dismissal as pretextual. § 1983 retaliation lawsuit (high success rate). Punitive damages. Attorney fees. Injunctive relief. Case worker termination. Agency-wide policy reforms. Criminal investigation if obstruction of justice.',
      actions: [
        'Document all retaliatory actions with dates and context',
        'File § 1983 lawsuit for First Amendment retaliation',
        'File Motion to Dismiss showing retaliatory motive',
        'Request discovery of all case worker communications about you',
        'File bar complaint if attorney engaged in retaliatory conduct',
        'Request protective order against further retaliation',
      ],
      documents: [
        {
          name: 'Document of Retaliatory Actions',
          description: 'Detailed documentation of all retaliatory actions with dates and context.',
        },
        {
          name: '§ 1983 Lawsuit Complaint',
          description: 'Legal document initiating a federal civil rights lawsuit against CPS for First Amendment retaliation.',
        },
        {
          name: 'Bar Complaint Form',
          description: 'Form to file a bar complaint against an attorney for retaliatory conduct.',
        },
      ],
    },
    {
      value: 'no_icwa',
      label: 'ICWA Violations (Indian Child Welfare Act)',
      rights: [
        'Tribal sovereignty rights',
        'Heightened burden of proof requirements',
        'Right to culturally appropriate services',
        'Right to qualified expert witnesses',
      ],
      statutes: [
        'Indian Child Welfare Act, 25 U.S.C. § 1901 et seq.',
        'ICWA active efforts requirement (higher than reasonable efforts)',
        'ICWA burden of proof (beyond reasonable doubt for termination)',
        'Tribal court jurisdiction',
        'Notice requirements to tribe',
      ],
      minimumOutcome: 'All proceedings invalidated. Case must start over with ICWA compliance. Tribe has right to intervene or transfer case.',
      maximumOutcome: 'Complete case dismissal. Immediate return of children to parent or tribe. Transfer to tribal court. § 1983 lawsuit for ICWA violations. Damages. Congressional oversight of agency. Federal monitoring of compliance. Criminal penalties for willful ICWA violations.',
      actions: [
        'File Motion to Dismiss for ICWA Non-Compliance',
        'Request immediate notice to tribe and BIA',
        'File Motion to Transfer to Tribal Court',
        'Challenge burden of proof - must be beyond reasonable doubt',
        'Challenge expert witnesses as not ICWA-qualified',
        'Request active efforts finding (higher than reasonable efforts)',
        'File § 1983 lawsuit for ICWA violations',
      ],
      documents: [
        {
          name: 'Motion to Dismiss',
          description: 'Formal request to the court to dismiss the case for ICWA non-compliance.',
        },
        {
          name: 'Motion to Transfer to Tribal Court',
          description: 'Formal request to the court to transfer the case to tribal court.',
        },
        {
          name: '§ 1983 Lawsuit Complaint',
          description: 'Legal document initiating a federal civil rights lawsuit against CPS for ICWA violations.',
        },
      ],
    },
  ];

  const analyzeIncident = () => {
    if (!formData.date || !formData.title || !formData.description || !formData.violationType) {
      toast.error('Please fill out all fields including selecting a violation type');
      return;
    }

    const violationType = violationTypes.find(v => v.value === formData.violationType);
    if (!violationType) return;

    const newIncident: Incident = {
      id: Date.now().toString(),
      date: formData.date,
      title: formData.title,
      description: formData.description,
      rightsViolated: violationType.rights,
      statutes: violationType.statutes,
      minimumOutcome: violationType.minimumOutcome,
      maximumOutcome: violationType.maximumOutcome,
      recommendedActions: violationType.actions,
      recommendedDocuments: violationType.documents,
    };

    setIncidents([...incidents, newIncident]);
    setExpandedIncidents(new Set([...expandedIncidents, newIncident.id]));
    
    // Reset form
    setFormData({
      date: '',
      title: '',
      description: '',
      violationType: '',
    });
    setShowForm(false);

    toast.success('Incident analyzed! Scroll down to see legal outcomes and remedies.');
  };

  const deleteIncident = (id: string) => {
    setIncidents(incidents.filter(i => i.id !== id));
    toast.success('Incident removed');
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIncidents);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIncidents(newExpanded);
  };

  const addToTimeline = (incident: Incident) => {
    if (onAddToTimeline) {
      onAddToTimeline({
        date: incident.date,
        title: incident.title,
        description: incident.description,
      });
      toast.success('Added to case timeline!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gavel className="w-5 h-5 text-red-600" />
          <h2 className="text-xl font-bold">Incident Rights Violation Analyzer</h2>
          <HelpTooltip
            content="Analyze specific incidents from your case to identify exact rights violated, applicable statutes, and minimum/maximum legal outcomes available. Each analysis includes actionable steps to remedy the violation."
            side="right"
          />
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Analyze Incident
          </Button>
        )}
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              How This Works
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
              For each violation incident in your case, this tool will identify:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li><strong>Constitutional & Statutory Rights Violated</strong> - Exact legal rights breached</li>
              <li><strong>Applicable Laws & Codes</strong> - Federal/state statutes, case law, constitutional amendments</li>
              <li><strong>Minimum Outcome</strong> - What the court MUST do at minimum to remedy the violation</li>
              <li><strong>Maximum Outcome</strong> - Best case scenario including dismissal, damages, sanctions</li>
              <li><strong>Recommended Actions</strong> - Specific motions and legal steps to take</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Form */}
      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Describe the Incident</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="incidentDate">Date of Incident *</Label>
              <Input
                id="incidentDate"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="incidentTitle">Incident Title *</Label>
              <Input
                id="incidentTitle"
                placeholder="e.g., CPS entered home without warrant"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="violationType">Type of Violation *</Label>
              <select
                id="violationType"
                className="w-full p-2 border rounded-md"
                value={formData.violationType}
                onChange={(e) => setFormData({ ...formData, violationType: e.target.value })}
              >
                <option value="">-- Select Violation Type --</option>
                {violationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="incidentDescription">Detailed Description *</Label>
              <Textarea
                id="incidentDescription"
                placeholder="Describe exactly what happened, who was involved, what was said, what actions were taken, witnesses present, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={analyzeIncident}>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Analyze Incident
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Incidents List */}
      {incidents.length === 0 && !showForm && (
        <Card className="p-8 text-center">
          <Gavel className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold mb-2">No Incidents Analyzed Yet</h3>
          <p className="text-muted-foreground mb-4">
            Click "Analyze Incident" to examine a specific violation from your case and see legal outcomes
          </p>
        </Card>
      )}

      <div className="space-y-4">
        {incidents.map((incident) => (
          <Card key={incident.id} className="overflow-hidden">
            <div className="p-4 bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="destructive">Rights Violation</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(incident.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">{incident.title}</h3>
                  <p className="text-sm mt-2 text-muted-foreground">{incident.description}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  {onAddToTimeline && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToTimeline(incident)}
                    >
                      Add to Timeline
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteIncident(incident.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>

            <Collapsible
              open={expandedIncidents.has(incident.id)}
              onOpenChange={() => toggleExpanded(incident.id)}
            >
              <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <span className="font-semibold flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  View Legal Analysis & Outcomes
                </span>
                {expandedIncidents.has(incident.id) ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </CollapsibleTrigger>

              <CollapsibleContent className="p-4 pt-0 space-y-4">
                {/* Rights Violated */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold">Rights Violated</h4>
                  </div>
                  <ul className="space-y-1 ml-7">
                    {incident.rightsViolated.map((right, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-red-600 mt-1">•</span>
                        <span>{right}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Applicable Statutes */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold">Applicable Statutes & Legal Authority</h4>
                  </div>
                  <ul className="space-y-1 ml-7">
                    {incident.statutes.map((statute, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="font-mono text-xs bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded">
                          {statute}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Minimum Outcome */}
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                      Minimum Outcome (What Court MUST Do)
                    </h4>
                  </div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {incident.minimumOutcome}
                  </p>
                </div>

                {/* Maximum Outcome */}
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900 dark:text-green-100">
                      Maximum Outcome (Best Case Scenario)
                    </h4>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {incident.maximumOutcome}
                  </p>
                </div>

                {/* Recommended Actions */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold">Recommended Legal Actions</h4>
                  </div>
                  <ul className="space-y-2 ml-7">
                    {incident.recommendedActions.map((action, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-purple-600 font-bold mt-1">{idx + 1}.</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Documents */}
                <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100">Documents You Can Generate</h4>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {incident.recommendedDocuments.map((doc, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2 text-purple-800 dark:text-purple-200">
                        <span className="text-purple-600 font-bold mt-1">✓</span>
                        <span><strong>{doc.name}</strong> - {doc.description}</span>
                      </li>
                    ))}
                  </ul>
                  {onNavigateToDocuments && (
                    <Button 
                      onClick={onNavigateToDocuments}
                      className="w-full"
                      variant="default"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Go to Document Generator
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                  <p className="text-xs text-purple-700 dark:text-purple-300 mt-2 text-center">
                    Click to generate these documents with your case details auto-filled
                  </p>
                </div>

                {/* Legal Disclaimer */}
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-200">
                  <strong>⚖️ Legal Disclaimer:</strong> This analysis is for informational purposes only and does not constitute legal advice. Outcomes vary based on jurisdiction, specific facts, and judicial discretion. Always consult with a licensed attorney before taking legal action.
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
}