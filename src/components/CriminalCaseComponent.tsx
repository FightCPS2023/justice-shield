import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { 
  Scale, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Info,
  Gavel,
  Shield,
  Users,
  Clock,
  Building2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus
} from "lucide-react";
import { HelpTooltip, InfoBox } from "./ui/help-tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";

interface CriminalCharge {
  id: string;
  charge: string;
  statute: string;
  degreeLevel: string;
  status: string;
  dateCharged: string;
  notes: string;
}

interface CriminalCaseDetails {
  hasCharges: boolean;
  caseNumber: string;
  court: string;
  prosecutor: string;
  defenseAttorney: string;
  nextCourtDate: string;
  charges: CriminalCharge[];
  bondStatus: string;
  bondAmount: string;
  relationToCPS: string;
  parallelInvestigation: boolean;
  sharedEvidence: string;
  strategicConsiderations: string;
}

interface CriminalCaseComponentProps {
  criminalCase: CriminalCaseDetails;
  onUpdate: (criminalCase: CriminalCaseDetails) => void;
}

export function CriminalCaseComponent({ criminalCase, onUpdate }: CriminalCaseComponentProps) {
  const [isExpanded, setIsExpanded] = useState(criminalCase.hasCharges);
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [newCharge, setNewCharge] = useState<Omit<CriminalCharge, 'id'>>({
    charge: "",
    statute: "",
    degreeLevel: "",
    status: "Pending",
    dateCharged: "",
    notes: ""
  });

  const handleToggleCriminalCase = (enabled: boolean) => {
    onUpdate({ ...criminalCase, hasCharges: enabled });
    setIsExpanded(enabled);
  };

  const handleFieldUpdate = (field: keyof CriminalCaseDetails, value: any) => {
    onUpdate({ ...criminalCase, [field]: value });
  };

  const handleAddCharge = () => {
    if (newCharge.charge && newCharge.statute) {
      const charge: CriminalCharge = {
        ...newCharge,
        id: Date.now().toString()
      };
      onUpdate({
        ...criminalCase,
        charges: [...criminalCase.charges, charge]
      });
      setNewCharge({
        charge: "",
        statute: "",
        degreeLevel: "",
        status: "Pending",
        dateCharged: "",
        notes: ""
      });
      setShowChargeForm(false);
    }
  };

  const handleRemoveCharge = (id: string) => {
    onUpdate({
      ...criminalCase,
      charges: criminalCase.charges.filter(c => c.id !== id)
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'dismissed':
      case 'acquitted':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'convicted':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'plea deal':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDegreeColor = (degree: string) => {
    if (degree.toLowerCase().includes('felony')) {
      return 'bg-red-100 text-red-800 border-red-300';
    } else if (degree.toLowerCase().includes('misdemeanor')) {
      return 'bg-orange-100 text-orange-800 border-orange-300';
    }
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="space-y-4">
      {/* Toggle Criminal Case */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              <Gavel className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">Criminal Case Component</h3>
                <HelpTooltip 
                  content="Enable this if you're facing criminal charges related to your CPS case. This allows for integrated strategic analysis of both cases together." 
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Do you have criminal charges related to this CPS case? (e.g., child abuse, neglect, drug charges, domestic violence)
              </p>
              <div className="flex gap-3">
                <Button
                  variant={criminalCase.hasCharges ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleCriminalCase(true)}
                  className={criminalCase.hasCharges ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Yes - I Have Criminal Charges
                </Button>
                <Button
                  variant={!criminalCase.hasCharges ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleCriminalCase(false)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  No Criminal Charges
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Criminal Case Details */}
        {criminalCase.hasCharges && (
          <div className="mt-6 space-y-6">
            <InfoBox title="Why This Matters" variant="warning">
              <p className="mb-3">Criminal and CPS cases often interact in critical ways:</p>
              <ul className="space-y-2 list-disc list-inside text-sm">
                <li><strong>Shared Evidence:</strong> Evidence in one case can affect the other</li>
                <li><strong>Fifth Amendment:</strong> Criminal case may impact what you can say in CPS proceedings</li>
                <li><strong>Double Jeopardy:</strong> Same evidence used in both cases</li>
                <li><strong>Plea Deals:</strong> Criminal plea may be used against you in CPS case</li>
                <li><strong>Strategic Timing:</strong> Order of proceedings matters for your defense</li>
              </ul>
            </InfoBox>

            {/* Basic Criminal Case Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crimCaseNumber">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Criminal Case Number
                </Label>
                <Input
                  id="crimCaseNumber"
                  value={criminalCase.caseNumber}
                  onChange={(e) => handleFieldUpdate('caseNumber', e.target.value)}
                  placeholder="e.g., CR-2024-12345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crimCourt">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Criminal Court
                </Label>
                <Input
                  id="crimCourt"
                  value={criminalCase.court}
                  onChange={(e) => handleFieldUpdate('court', e.target.value)}
                  placeholder="e.g., Superior Court, County XYZ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prosecutor">
                  <Users className="w-4 h-4 inline mr-1" />
                  Prosecutor/DA
                </Label>
                <Input
                  id="prosecutor"
                  value={criminalCase.prosecutor}
                  onChange={(e) => handleFieldUpdate('prosecutor', e.target.value)}
                  placeholder="Prosecutor or District Attorney name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defenseAttorney">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Defense Attorney
                </Label>
                <Input
                  id="defenseAttorney"
                  value={criminalCase.defenseAttorney}
                  onChange={(e) => handleFieldUpdate('defenseAttorney', e.target.value)}
                  placeholder="Your criminal defense attorney"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextCourtDate">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Next Criminal Court Date
                </Label>
                <Input
                  id="nextCourtDate"
                  type="date"
                  value={criminalCase.nextCourtDate}
                  onChange={(e) => handleFieldUpdate('nextCourtDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bondStatus">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Bond Status
                </Label>
                <Select
                  value={criminalCase.bondStatus}
                  onValueChange={(value) => handleFieldUpdate('bondStatus', value)}
                >
                  <SelectTrigger id="bondStatus">
                    <SelectValue placeholder="Select bond status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Released on Recognizance">Released on Recognizance (ROR)</SelectItem>
                    <SelectItem value="Bond Posted">Bond Posted</SelectItem>
                    <SelectItem value="Bond Pending">Bond Pending</SelectItem>
                    <SelectItem value="Denied Bond">Denied Bond</SelectItem>
                    <SelectItem value="Incarcerated">Currently Incarcerated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {criminalCase.bondStatus && criminalCase.bondStatus !== "Released on Recognizance" && (
              <div className="space-y-2">
                <Label htmlFor="bondAmount">Bond Amount</Label>
                <Input
                  id="bondAmount"
                  value={criminalCase.bondAmount}
                  onChange={(e) => handleFieldUpdate('bondAmount', e.target.value)}
                  placeholder="e.g., $10,000"
                />
              </div>
            )}

            {/* Criminal Charges Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-red-600" />
                  <h4 className="font-semibold">Criminal Charges</h4>
                  <Badge variant="outline">{criminalCase.charges.length}</Badge>
                </div>
                <Button
                  onClick={() => setShowChargeForm(!showChargeForm)}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Charge
                </Button>
              </div>

              {/* Add Charge Form */}
              {showChargeForm && (
                <Card className="p-4 mb-4 bg-muted/50">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newCharge">Charge Description</Label>
                        <Input
                          id="newCharge"
                          value={newCharge.charge}
                          onChange={(e) => setNewCharge({ ...newCharge, charge: e.target.value })}
                          placeholder="e.g., Child Endangerment, Possession"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newStatute">Statute/Code</Label>
                        <Input
                          id="newStatute"
                          value={newCharge.statute}
                          onChange={(e) => setNewCharge({ ...newCharge, statute: e.target.value })}
                          placeholder="e.g., PC 273a(a)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newDegree">Degree/Level</Label>
                        <Select
                          value={newCharge.degreeLevel}
                          onValueChange={(value) => setNewCharge({ ...newCharge, degreeLevel: value })}
                        >
                          <SelectTrigger id="newDegree">
                            <SelectValue placeholder="Select degree" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Felony - First Degree">Felony - First Degree</SelectItem>
                            <SelectItem value="Felony - Second Degree">Felony - Second Degree</SelectItem>
                            <SelectItem value="Felony - Third Degree">Felony - Third Degree</SelectItem>
                            <SelectItem value="Misdemeanor - Class A">Misdemeanor - Class A</SelectItem>
                            <SelectItem value="Misdemeanor - Class B">Misdemeanor - Class B</SelectItem>
                            <SelectItem value="Misdemeanor - Class C">Misdemeanor - Class C</SelectItem>
                            <SelectItem value="Infraction">Infraction</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newStatus">Status</Label>
                        <Select
                          value={newCharge.status}
                          onValueChange={(value) => setNewCharge({ ...newCharge, status: value })}
                        >
                          <SelectTrigger id="newStatus">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Arraignment Scheduled">Arraignment Scheduled</SelectItem>
                            <SelectItem value="Preliminary Hearing">Preliminary Hearing</SelectItem>
                            <SelectItem value="Trial Scheduled">Trial Scheduled</SelectItem>
                            <SelectItem value="Plea Deal Offered">Plea Deal Offered</SelectItem>
                            <SelectItem value="Dismissed">Dismissed</SelectItem>
                            <SelectItem value="Acquitted">Acquitted</SelectItem>
                            <SelectItem value="Convicted">Convicted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newChargeDate">Date Charged</Label>
                        <Input
                          id="newChargeDate"
                          type="date"
                          value={newCharge.dateCharged}
                          onChange={(e) => setNewCharge({ ...newCharge, dateCharged: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newChargeNotes">Notes</Label>
                      <Textarea
                        id="newChargeNotes"
                        value={newCharge.notes}
                        onChange={(e) => setNewCharge({ ...newCharge, notes: e.target.value })}
                        placeholder="Important details about this charge..."
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleAddCharge} size="sm">
                        Add Charge
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowChargeForm(false);
                          setNewCharge({
                            charge: "",
                            statute: "",
                            degreeLevel: "",
                            status: "Pending",
                            dateCharged: "",
                            notes: ""
                          });
                        }} 
                        size="sm" 
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Charges List */}
              <div className="space-y-3">
                {criminalCase.charges.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Scale className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No charges added yet. Click "Add Charge" to begin.</p>
                  </div>
                ) : (
                  criminalCase.charges.map((charge) => (
                    <Card key={charge.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-2 flex-wrap">
                            <h5 className="font-semibold">{charge.charge}</h5>
                            {charge.degreeLevel && (
                              <Badge className={getDegreeColor(charge.degreeLevel)} variant="outline">
                                {charge.degreeLevel}
                              </Badge>
                            )}
                            <Badge className={getStatusColor(charge.status)} variant="outline">
                              {charge.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Statute:</span>{' '}
                              <span className="font-medium">{charge.statute}</span>
                            </div>
                            {charge.dateCharged && (
                              <div>
                                <span className="text-muted-foreground">Date Charged:</span>{' '}
                                <span className="font-medium">
                                  {new Date(charge.dateCharged).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {charge.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{charge.notes}</p>
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCharge(charge.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Integration with CPS Case */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold">CPS & Criminal Case Integration</h4>
                <HelpTooltip content="Document how your criminal and CPS cases interact strategically" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationToCPS">How Does the Criminal Case Relate to CPS?</Label>
                <Textarea
                  id="relationToCPS"
                  value={criminalCase.relationToCPS}
                  onChange={(e) => handleFieldUpdate('relationToCPS', e.target.value)}
                  placeholder="Explain the connection between your criminal charges and CPS case. Are they investigating the same incident? Is CPS using criminal allegations?"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <input
                  type="checkbox"
                  id="parallelInvestigation"
                  checked={criminalCase.parallelInvestigation}
                  onChange={(e) => handleFieldUpdate('parallelInvestigation', e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="parallelInvestigation" className="cursor-pointer flex-1">
                  <div className="font-medium">Parallel Investigation</div>
                  <div className="text-sm text-muted-foreground">
                    CPS and law enforcement are investigating the same incident/allegations
                  </div>
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sharedEvidence">Shared Evidence Between Cases</Label>
                <Textarea
                  id="sharedEvidence"
                  value={criminalCase.sharedEvidence}
                  onChange={(e) => handleFieldUpdate('sharedEvidence', e.target.value)}
                  placeholder="List evidence being used in both cases (interviews, medical records, photos, forensic evidence, etc.). This is critical for Fifth Amendment strategy."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="strategicConsiderations">Strategic Considerations</Label>
                <Textarea
                  id="strategicConsiderations"
                  value={criminalCase.strategicConsiderations}
                  onChange={(e) => handleFieldUpdate('strategicConsiderations', e.target.value)}
                  placeholder="Strategic notes: Should you testify in CPS case? Invoke Fifth Amendment? Timing of plea deals? Coordination between attorneys?"
                  rows={4}
                />
              </div>

              {/* Strategic Warning Box */}
              <InfoBox title="⚠️ CRITICAL: Fifth Amendment Considerations" variant="danger">
                <p className="mb-3 font-semibold">DO NOT ignore Fifth Amendment implications!</p>
                <ul className="space-y-2 list-disc list-inside text-sm">
                  <li><strong>Anything you say in CPS court CAN be used in criminal court</strong></li>
                  <li><strong>Testimony waivers:</strong> You may waive Fifth Amendment rights by testifying</li>
                  <li><strong>Coordinate attorneys:</strong> Your CPS and criminal attorneys MUST communicate</li>
                  <li><strong>Strategic silence:</strong> Sometimes NOT testifying in CPS case protects criminal case</li>
                  <li><strong>Plea deal impact:</strong> Criminal plea admissions can destroy CPS defense</li>
                </ul>
                <p className="mt-3 text-xs italic">
                  💡 ALWAYS consult with BOTH your CPS attorney and criminal defense attorney before testifying or making statements in either proceeding.
                </p>
              </InfoBox>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
