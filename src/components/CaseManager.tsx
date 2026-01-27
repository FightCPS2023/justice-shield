import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, X, Calendar, Users, Scale, FileText, Briefcase } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';

export interface Child {
  id: string;
  name: string;
  age: string;
  dateOfBirth: string;
}

export interface KeyDate {
  id: string;
  date: string;
  description: string;
}

export interface CriminalCharge {
  id: string;
  charge: string;
  statute: string;
  degreeLevel: string;
  status: string;
  dateCharged: string;
  notes: string;
}

export interface CriminalCaseDetails {
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

export interface CaseData {
  id: string;
  caseName: string;
  docketNumber: string;
  county: string;
  status: 'Open' | 'In Progress' | 'Closed';
  caseWorkerName: string;
  caseWorkerAgency: string;
  judgeName: string;
  courtLocation: string;
  dateOpened: string;
  children: Child[];
  keyDates: KeyDate[];
  notes: string;
  criminalCase?: CriminalCaseDetails;
  createdAt: string;
  updatedAt: string;
}

interface CaseManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseData: CaseData) => void;
  existingCase?: CaseData;
  mode: 'create' | 'edit';
}

export function CaseManager({ isOpen, onClose, onSave, existingCase, mode }: CaseManagerProps) {
  const [caseName, setCaseName] = useState('');
  const [docketNumber, setDocketNumber] = useState('');
  const [county, setCounty] = useState('');
  const [status, setStatus] = useState<'Open' | 'In Progress' | 'Closed'>('Open');
  const [caseWorkerName, setCaseWorkerName] = useState('');
  const [caseWorkerAgency, setCaseWorkerAgency] = useState('');
  const [judgeName, setJudgeName] = useState('');
  const [courtLocation, setCourtLocation] = useState('');
  const [dateOpened, setDateOpened] = useState('');
  const [children, setChildren] = useState<Child[]>([]);
  const [keyDates, setKeyDates] = useState<KeyDate[]>([]);
  const [notes, setNotes] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);

  // Update form when existingCase changes (for edit mode)
  useEffect(() => {
    if (existingCase && isOpen) {
      setCaseName(existingCase.caseName);
      setDocketNumber(existingCase.docketNumber);
      setCounty(existingCase.county);
      setStatus(existingCase.status);
      setCaseWorkerName(existingCase.caseWorkerName);
      setCaseWorkerAgency(existingCase.caseWorkerAgency);
      setJudgeName(existingCase.judgeName);
      setCourtLocation(existingCase.courtLocation);
      setDateOpened(existingCase.dateOpened);
      setChildren(existingCase.children);
      setKeyDates(existingCase.keyDates);
      setNotes(existingCase.notes);
    } else if (!existingCase && isOpen) {
      // Reset for create mode
      setCaseName('');
      setDocketNumber('');
      setCounty('');
      setStatus('Open');
      setCaseWorkerName('');
      setCaseWorkerAgency('');
      setJudgeName('');
      setCourtLocation('');
      setDateOpened('');
      setChildren([]);
      setKeyDates([]);
      setNotes('');
      setCurrentStep(1);
      setErrors([]);
    }
  }, [existingCase, isOpen]);

  const addChild = () => {
    setChildren([...children, { id: Date.now().toString(), name: '', age: '', dateOfBirth: '' }]);
  };

  const removeChild = (id: string) => {
    setChildren(children.filter(c => c.id !== id));
  };

  const updateChild = (id: string, field: keyof Child, value: string) => {
    setChildren(children.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addKeyDate = () => {
    // Don't add a new key date if there's already an empty one
    const hasEmptyKeyDate = keyDates.some(d => !d.date || !d.description.trim());
    if (hasEmptyKeyDate) {
      toast.warning('Please fill out the current date fields before adding another');
      return; // Don't add another empty field
    }
    setKeyDates([...keyDates, { id: Date.now().toString(), date: '', description: '' }]);
  };

  const removeKeyDate = (id: string) => {
    setKeyDates(keyDates.filter(d => d.id !== id));
  };

  const updateKeyDate = (id: string, field: keyof KeyDate, value: string) => {
    setKeyDates(keyDates.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: string[] = [];

    if (step === 1) {
      if (!caseName.trim()) newErrors.push('Case name is required');
      if (!docketNumber.trim()) newErrors.push('Docket number is required');
      if (!county.trim()) newErrors.push('County is required');
      if (!dateOpened) newErrors.push('Date opened is required');
    }

    if (step === 2) {
      if (!caseWorkerName.trim()) newErrors.push('Case worker name is required');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors([]);
  };

  const handleSave = () => {
    if (!validateStep(currentStep)) return;

    const caseData: CaseData = {
      id: existingCase?.id || `case_${Date.now()}`,
      caseName,
      docketNumber,
      county,
      status,
      caseWorkerName,
      caseWorkerAgency,
      judgeName,
      courtLocation,
      dateOpened,
      children: children.filter(c => c.name.trim()),
      keyDates: keyDates.filter(d => d.date && d.description.trim()),
      notes,
      createdAt: existingCase?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(caseData);
    handleClose();
    toast.success(mode === 'create' ? 'Case created successfully' : 'Case updated successfully');
  };

  const handleClose = () => {
    // Reset form
    setCaseName('');
    setDocketNumber('');
    setCounty('');
    setStatus('Open');
    setCaseWorkerName('');
    setCaseWorkerAgency('');
    setJudgeName('');
    setCourtLocation('');
    setDateOpened('');
    setChildren([]);
    setKeyDates([]);
    setNotes('');
    setCurrentStep(1);
    setErrors([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            {mode === 'create' ? 'Create New Case' : 'Edit Case'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {currentStep === 1 && 'Enter basic case information'}
            {currentStep === 2 && 'Add case worker and court details'}
            {currentStep === 3 && 'Add children and important dates'}
            {currentStep === 4 && 'Review and add notes'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
                  currentStep >= step
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-1 mx-1 sm:mx-2 ${
                    currentStep > step ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {errors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="text-xs sm:text-sm">
              <ul className="list-disc list-inside">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="caseName">Case Name / Title *</Label>
              <Input
                id="caseName"
                placeholder="e.g., Smith Family Case"
                value={caseName}
                onChange={(e) => setCaseName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="docketNumber">Docket Number / Case Number *</Label>
              <Input
                id="docketNumber"
                placeholder="e.g., JV-2024-12345"
                value={docketNumber}
                onChange={(e) => setDocketNumber(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="county">County / Jurisdiction *</Label>
                <Input
                  id="county"
                  placeholder="e.g., Los Angeles County"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="status">Case Status</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="dateOpened">Date Case Opened *</Label>
              <Input
                id="dateOpened"
                type="date"
                value={dateOpened}
                onChange={(e) => setDateOpened(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2: Case Worker & Court Info */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Case Worker Information</h3>
            </div>

            <div>
              <Label htmlFor="caseWorkerName">Case Worker Name *</Label>
              <Input
                id="caseWorkerName"
                placeholder="e.g., John Doe"
                value={caseWorkerName}
                onChange={(e) => setCaseWorkerName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="caseWorkerAgency">Agency / Department</Label>
              <Input
                id="caseWorkerAgency"
                placeholder="e.g., Department of Children and Family Services"
                value={caseWorkerAgency}
                onChange={(e) => setCaseWorkerAgency(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 mb-2 mt-6">
              <Scale className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Court Information</h3>
            </div>

            <div>
              <Label htmlFor="judgeName">Judge Name</Label>
              <Input
                id="judgeName"
                placeholder="e.g., Hon. Jane Smith"
                value={judgeName}
                onChange={(e) => setJudgeName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="courtLocation">Court Location</Label>
              <Input
                id="courtLocation"
                placeholder="e.g., Superior Court of California, County of Los Angeles"
                value={courtLocation}
                onChange={(e) => setCourtLocation(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Children & Key Dates */}
        {currentStep === 3 && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <h3 className="text-sm sm:text-base font-semibold">Children Involved</h3>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addChild} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Child
                </Button>
              </div>

              {children.length === 0 ? (
                <Card className="p-3 sm:p-4 text-center text-muted-foreground text-xs sm:text-sm">
                  No children added yet. Click "Add Child" to add.
                </Card>
              ) : (
                <div className="space-y-3">
                  {children.map((child) => (
                    <Card key={child.id} className="p-2 sm:p-3">
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <Input
                            placeholder="Child's name"
                            value={child.name}
                            onChange={(e) => updateChild(child.id, 'name', e.target.value)}
                            className="text-sm"
                          />
                          <Input
                            placeholder="Age"
                            value={child.age}
                            onChange={(e) => updateChild(child.id, 'age', e.target.value)}
                            className="text-sm"
                          />
                          <Input
                            type="date"
                            placeholder="Date of Birth"
                            value={child.dateOfBirth}
                            onChange={(e) => updateChild(child.id, 'dateOfBirth', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeChild(child.id)}
                          className="self-end sm:self-auto"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <h3 className="text-sm sm:text-base font-semibold">Important Dates</h3>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addKeyDate} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Date
                </Button>
              </div>

              {keyDates.length === 0 ? (
                <Card className="p-3 sm:p-4 text-center text-muted-foreground text-xs sm:text-sm">
                  No key dates added yet. Click "Add Date" to add hearings, deadlines, etc.
                </Card>
              ) : (
                <div className="space-y-3">
                  {keyDates.map((keyDate) => (
                    <Card key={keyDate.id} className="p-2 sm:p-3">
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-[150px_1fr] md:grid-cols-[200px_1fr] gap-2">
                          <Input
                            type="date"
                            value={keyDate.date}
                            onChange={(e) => updateKeyDate(keyDate.id, 'date', e.target.value)}
                            className="text-sm"
                          />
                          <Input
                            placeholder="Description (e.g., Hearing, Deadline)"
                            value={keyDate.description}
                            onChange={(e) => updateKeyDate(keyDate.id, 'description', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeKeyDate(keyDate.id)}
                          className="self-end sm:self-auto"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Notes & Review */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Case Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes, context, or important information about this case..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
              />
            </div>

            <Card className="p-4 bg-muted/50">
              <h3 className="font-semibold mb-3">Case Summary</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Case Name:</strong> {caseName || 'Not provided'}</div>
                <div><strong>Docket Number:</strong> {docketNumber || 'Not provided'}</div>
                <div><strong>County:</strong> {county || 'Not provided'}</div>
                <div><strong>Status:</strong> {status}</div>
                <div><strong>Date Opened:</strong> {dateOpened || 'Not provided'}</div>
                <div><strong>Case Worker:</strong> {caseWorkerName || 'Not provided'}</div>
                <div><strong>Children:</strong> {children.filter(c => c.name.trim()).length} added</div>
                <div><strong>Key Dates:</strong> {keyDates.filter(d => d.date && d.description.trim()).length} added</div>
              </div>
            </Card>
          </div>
        )}

        <DialogFooter className="gap-2">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          {currentStep < 4 ? (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={handleSave}>
              {mode === 'create' ? 'Create Case' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}