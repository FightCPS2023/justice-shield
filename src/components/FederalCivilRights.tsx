import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
  Scale,
  Shield,
  AlertTriangle,
  FileText,
  Download,
  Copy,
  Gavel,
  Users,
  Plus,
  X,
  DollarSign,
  CheckCircle2,
  Info,
  Building2,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { federalTemplates, type FederalTemplateData } from '../utils/federalTemplates';
import { federalCourtTemplates, type RemovalData } from '../utils/federalCourtTemplates';

interface Defendant {
  name: string;
  title: string;
  agency: string;
  address: string;
  actions: string[];
}

interface ConstitutionalViolation {
  amendment: string;
  description: string;
  caselaw: string[];
}

interface FederalCivilRightsProps {
  parentInfo: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    childrenNames: string;
  };
  caseDetails: {
    caseNumber: string;
    county: string;
    dateOpened: string;
    caseworker: string;
  };
  violations: { [key: string]: boolean };
}

export function FederalCivilRights({ parentInfo, caseDetails, violations }: FederalCivilRightsProps) {
  const [defendants, setDefendants] = useState<Defendant[]>([
    {
      name: caseDetails.caseworker || '',
      title: 'CPS Caseworker',
      agency: 'Department of Child and Family Services',
      address: '',
      actions: [],
    },
  ]);

  const [violationsList, setViolationsList] = useState<ConstitutionalViolation[]>([
    {
      amendment: 'Fourth Amendment',
      description: 'Warrantless search and seizure',
      caselaw: ['Payton v. New York, 445 U.S. 573 (1980)', 'Calabretta v. Floyd, 189 F.3d 808 (9th Cir. 1999)'],
    },
  ]);

  const [federalInfo, setFederalInfo] = useState({
    dateOfIncident: '',
    dateOfRemoval: '',
    economicDamages: '',
    punitiveRequested: true,
    stateCourt: '',
    stateJudge: '',
    facts: [] as string[],
  });

  const [newFact, setNewFact] = useState('');
  const [generatedDocument, setGeneratedDocument] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('');

  // Add defendant
  const addDefendant = () => {
    setDefendants([
      ...defendants,
      { name: '', title: '', agency: '', address: '', actions: [] },
    ]);
  };

  // Remove defendant
  const removeDefendant = (index: number) => {
    setDefendants(defendants.filter((_, i) => i !== index));
  };

  // Update defendant
  const updateDefendant = (index: number, field: keyof Defendant, value: string | string[]) => {
    const updated = [...defendants];
    updated[index] = { ...updated[index], [field]: value };
    setDefendants(updated);
  };

  // Add fact
  const addFact = () => {
    if (newFact.trim()) {
      setFederalInfo({ ...federalInfo, facts: [...federalInfo.facts, newFact.trim()] });
      setNewFact('');
    }
  };

  // Build template data
  const buildFederalData = (): FederalTemplateData => {
    return {
      plaintiffName: parentInfo.fullName,
      plaintiffAddress: parentInfo.address,
      plaintiffCity: parentInfo.city,
      plaintiffState: parentInfo.state,
      plaintiffZip: parentInfo.zip,
      plaintiffPhone: parentInfo.phone,
      plaintiffEmail: parentInfo.email,
      childrenNames: parentInfo.childrenNames,
      defendants: defendants.filter(d => d.name),
      stateCaseNumber: caseDetails.caseNumber,
      county: caseDetails.county,
      state: parentInfo.state,
      dateOfIncident: federalInfo.dateOfIncident,
      dateOfRemoval: federalInfo.dateOfRemoval,
      constitutionalViolations: violationsList,
      damages: {
        economic: federalInfo.economicDamages ? parseFloat(federalInfo.economicDamages) : undefined,
        nonEconomic: 'Emotional distress, loss of parent-child relationship, reputational harm',
        punitive: federalInfo.punitiveRequested,
      },
      facts: federalInfo.facts,
    };
  };

  // Build removal data
  const buildRemovalData = (): RemovalData => {
    const baseData = buildFederalData();
    return {
      ...baseData,
      stateCourt: federalInfo.stateCourt,
      stateJudge: federalInfo.stateJudge,
      removalBasis: 'both',
      federalClaims: [
        'Fourth Amendment violations (warrantless search and seizure)',
        'Fourteenth Amendment violations (deprivation of fundamental parental rights)',
        'Procedural due process violations',
        'Substantive due process violations',
      ],
    };
  };

  // Generate document
  const generateDocument = (type: string) => {
    let content = '';
    const data = buildFederalData();

    try {
      switch (type) {
        case '1983-complaint':
          content = federalTemplates.section1983Complaint(data);
          break;
        case 'notice-liability':
          content = federalTemplates.noticeOfLiability(data);
          break;
        case 'notice-removal':
          content = federalCourtTemplates.noticeOfRemoval(buildRemovalData());
          break;
        case 'federal-injunction':
          content = federalCourtTemplates.federalInjunction(data);
          break;
        case 'constitutional-brief':
          content = federalCourtTemplates.constitutionalBrief(data);
          break;
        default:
          content = 'Please select a document type.';
      }

      setGeneratedDocument(content);
      setSelectedDocType(type);
      toast.success('⚖️ Federal court document generated!');
    } catch (error) {
      toast.error('Error generating document. Please check all required fields.');
    }
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDocument);
    toast.success('📋 Copied to clipboard!');
  };

  // Download document
  const downloadDocument = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedDocument], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `federal-${selectedDocType}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('📥 Document downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* Warning Alert */}
      <Alert className="border-red-300 bg-red-50 dark:bg-red-900/20">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <AlertTitle className="text-red-800 dark:text-red-200">
          ⚠️ SERIOUS FEDERAL LITIGATION - READ CAREFULLY
        </AlertTitle>
        <AlertDescription className="text-red-700 dark:text-red-300 text-xs space-y-2">
          <p>
            <strong>Section 1983 lawsuits are federal civil rights actions</strong> that hold government officials personally liable for constitutional violations. This is SERIOUS litigation that can result in:
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li><strong>Personal liability</strong> - Officials sued in individual capacity</li>
            <li><strong>Monetary damages</strong> - Compensatory and punitive damages</li>
            <li><strong>Criminal referrals</strong> - DOJ investigation under 18 U.S.C. § 242</li>
            <li><strong>Careers destroyed</strong> - Professional reputation and employment</li>
          </ul>
          <p>
            <strong>RECOMMENDATION:</strong> Federal court litigation is complex. Strongly consider hiring a civil rights attorney experienced in § 1983 litigation. Many work on contingency (no upfront fees).
          </p>
        </AlertDescription>
      </Alert>

      {/* Information Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-sm">42 U.S.C. § 1983</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Civil rights lawsuit for constitutional violations under color of law. Personal liability for officials.
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-sm">Notice of Liability</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Warn CPS workers of personal liability. Document notice for defeating qualified immunity defense.
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-600" />
              <CardTitle className="text-sm">Federal Court</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Remove case to federal court for constitutional issues. Federal judges protect civil rights.
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="defendants" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="defendants">Defendants</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="facts">Facts</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
        </TabsList>

        {/* Defendants Tab */}
        <TabsContent value="defendants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Name Defendants (Individual & Official Capacity)
              </CardTitle>
              <CardDescription>
                Name all CPS workers, supervisors, and agency officials who violated your rights. They will be sued personally.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {defendants.map((defendant, index) => (
                <Card key={index} className="p-4 border-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Defendant {index + 1}</Badge>
                      {defendants.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDefendant(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Full Name *</Label>
                        <Input
                          value={defendant.name}
                          onChange={(e) => updateDefendant(index, 'name', e.target.value)}
                          placeholder="Jane Smith"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Job Title *</Label>
                        <Input
                          value={defendant.title}
                          onChange={(e) => updateDefendant(index, 'title', e.target.value)}
                          placeholder="CPS Investigator"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Agency/Department *</Label>
                        <Input
                          value={defendant.agency}
                          onChange={(e) => updateDefendant(index, 'agency', e.target.value)}
                          placeholder="Dept. of Child & Family Services"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Work Address (if known)</Label>
                        <Input
                          value={defendant.address}
                          onChange={(e) => updateDefendant(index, 'address', e.target.value)}
                          placeholder="123 Main St, City, State"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Specific Actions (comma-separated) *</Label>
                      <Textarea
                        value={defendant.actions.join(', ')}
                        onChange={(e) =>
                          updateDefendant(
                            index,
                            'actions',
                            e.target.value.split(',').map((a) => a.trim()).filter(Boolean)
                          )
                        }
                        placeholder="Conducted warrantless search, Removed children without exigent circumstances, Fabricated evidence"
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              ))}

              <Button onClick={addDefendant} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Another Defendant
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Constitutional Violations
              </CardTitle>
              <CardDescription>
                Detail the constitutional rights that were violated. Include specific amendments and case law.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                <Info className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-xs text-blue-800 dark:text-blue-200">
                  <strong>Pre-populated violations:</strong> Fourth Amendment (warrantless search), Fourteenth Amendment (fundamental parental rights, due process). Add more if applicable.
                </AlertDescription>
              </Alert>

              {violationsList.map((violation, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge>{violation.amendment}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{violation.description}</p>
                    <div className="text-xs">
                      <strong>Case Law:</strong>
                      <ul className="list-disc ml-5 mt-1">
                        {violation.caselaw.map((cite, i) => (
                          <li key={i}>{cite}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facts Tab */}
        <TabsContent value="facts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Key Facts & Dates
              </CardTitle>
              <CardDescription>
                Provide specific dates and factual details. Federal court requires specificity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Date of Incident (First Contact) *</Label>
                  <Input
                    type="date"
                    value={federalInfo.dateOfIncident}
                    onChange={(e) =>
                      setFederalInfo({ ...federalInfo, dateOfIncident: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label className="text-xs">Date of Removal (if applicable)</Label>
                  <Input
                    type="date"
                    value={federalInfo.dateOfRemoval}
                    onChange={(e) =>
                      setFederalInfo({ ...federalInfo, dateOfRemoval: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label className="text-xs">State Court Name (for removal)</Label>
                  <Input
                    value={federalInfo.stateCourt}
                    onChange={(e) =>
                      setFederalInfo({ ...federalInfo, stateCourt: e.target.value })
                    }
                    placeholder="District Court"
                  />
                </div>

                <div>
                  <Label className="text-xs">State Court Judge Name</Label>
                  <Input
                    value={federalInfo.stateJudge}
                    onChange={(e) =>
                      setFederalInfo({ ...federalInfo, stateJudge: e.target.value })
                    }
                    placeholder="Hon. John Smith"
                  />
                </div>

                <div>
                  <Label className="text-xs flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Economic Damages (if calculable)
                  </Label>
                  <Input
                    type="number"
                    value={federalInfo.economicDamages}
                    onChange={(e) =>
                      setFederalInfo({ ...federalInfo, economicDamages: e.target.value })
                    }
                    placeholder="5000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Lost wages, attorney fees paid, therapy costs, etc.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Add Specific Facts (one at a time)</Label>
                <div className="flex gap-2">
                  <Input
                    value={newFact}
                    onChange={(e) => setNewFact(e.target.value)}
                    placeholder="On 3/15/24, CPS worker entered without warrant and threatened..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') addFact();
                    }}
                  />
                  <Button onClick={addFact} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {federalInfo.facts.length > 0 && (
                  <Card className="p-3 mt-2">
                    <div className="text-xs space-y-1">
                      <strong>Facts Added ({federalInfo.facts.length}):</strong>
                      {federalInfo.facts.map((fact, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{fact}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="w-5 h-5" />
                Generate Federal Court Documents
              </CardTitle>
              <CardDescription>
                Select document type. All documents are court-ready with proper federal format.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => generateDocument('1983-complaint')}
                variant="outline"
                className="w-full justify-start h-auto p-4"
                disabled={!parentInfo.fullName || defendants.filter((d) => d.name).length === 0}
              >
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    <span>Section 1983 Civil Rights Complaint</span>
                    <Badge variant="destructive" className="text-xs">
                      FEDERAL LAWSUIT
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Full federal complaint with jurisdiction, causes of action, damages, jury demand.
                    File in U.S. District Court.
                  </p>
                </div>
              </Button>

              <Button
                onClick={() => generateDocument('notice-liability')}
                variant="outline"
                className="w-full justify-start h-auto p-4"
                disabled={!parentInfo.fullName || defendants.filter((d) => d.name).length === 0}
              >
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span>Notice of Liability Under Color of Law</span>
                    <Badge variant="outline" className="text-xs">
                      Recommended First
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Warn CPS workers of personal liability (42 U.S.C. § 1983, 18 U.S.C. § 242).
                    Serve before lawsuit.
                  </p>
                </div>
              </Button>

              <Button
                onClick={() => generateDocument('notice-removal')}
                variant="outline"
                className="w-full justify-start h-auto p-4"
                disabled={!federalInfo.stateCourt}
              >
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>Notice of Removal to Federal Court</span>
                    <Badge variant="secondary" className="text-xs">
                      28 U.S.C. § 1441
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Remove state CPS case to federal court for constitutional issues. File within 30 days.
                  </p>
                </div>
              </Button>

              <Button
                onClick={() => generateDocument('federal-injunction')}
                variant="outline"
                className="w-full justify-start h-auto p-4"
                disabled={!parentInfo.fullName}
              >
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Motion for Preliminary Injunction (Federal)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Emergency injunction to return children pending federal case resolution.
                  </p>
                </div>
              </Button>

              <Button
                onClick={() => generateDocument('constitutional-brief')}
                variant="outline"
                className="w-full justify-start h-auto p-4"
                disabled={!parentInfo.fullName}
              >
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Constitutional Brief (Federal Court)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Detailed brief with constitutional arguments, case law, table of authorities.
                  </p>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Generated Document Display */}
          {generatedDocument && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Generated Federal Document
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={copyToClipboard} variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button onClick={downloadDocument} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={generatedDocument}
                  readOnly
                  className="font-mono text-xs h-[600px]"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}