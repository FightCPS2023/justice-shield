import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { 
  Calendar, Clock, AlertCircle, CheckSquare, Plus, Edit2, Trash2,
  Save, X, Bell, FileText, User, Briefcase, Scale, Target,
  CheckCircle, Circle, Download, Sparkles
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface CourtHearing {
  id: string;
  date: string;
  time: string;
  type: string;
  judge?: string;
  location?: string;
  prepChecklist: ChecklistItem[];
  whatToWear: string;
  whatToBring: string[];
  expectedQuestions: string[];
  howToAnswer: string[];
  whoWillBeThere: string[];
  postHearingActions: string[];
  notes?: string;
  createdAt: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface CourtCountdownProps {
  caseId: string;
}

const HEARING_TYPES = [
  { value: 'detention', label: 'Detention Hearing (Emergency Removal)', color: 'red' },
  { value: 'adjudication', label: 'Adjudication Hearing (Did abuse/neglect occur?)', color: 'orange' },
  { value: 'disposition', label: 'Disposition Hearing (What happens next?)', color: 'yellow' },
  { value: 'review-6', label: '6-Month Review Hearing', color: 'blue' },
  { value: 'review-12', label: '12-Month Permanency Hearing', color: 'indigo' },
  { value: 'review-18', label: '18-Month Review', color: 'purple' },
  { value: 'termination', label: 'Termination of Parental Rights Trial', color: 'red' },
  { value: 'appeal', label: 'Appeal Hearing', color: 'gray' },
  { value: 'other', label: 'Other Hearing', color: 'gray' }
];

const DEFAULT_PREP_ITEMS = [
  'Review all case documents',
  'Meet with attorney 3+ days before hearing',
  'Prepare testimony and practice answers',
  'Gather all evidence and certificates',
  'Arrange childcare/transportation',
  'Plan professional outfit',
  'Get good night sleep before hearing',
  'Arrive 30 minutes early',
  'Turn off cell phone'
];

const WHAT_TO_BRING = [
  'All service completion certificates',
  'Drug test results',
  'Visitation logs',
  'Communication records',
  'Witness list and contact info',
  'Pen and notepad',
  'Copy of case plan',
  'Evidence photos/documents',
  'Character reference letters'
];

export function CourtCountdown({ caseId }: CourtCountdownProps) {
  const [hearings, setHearings] = useState<CourtHearing[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [formData, setFormData] = useState<Partial<CourtHearing>>({
    date: '',
    time: '09:00',
    type: 'review-6',
    judge: '',
    location: '',
    prepChecklist: DEFAULT_PREP_ITEMS.map((text, idx) => ({
      id: idx.toString(),
      text,
      completed: false
    })),
    whatToWear: 'Business professional - dress pants/skirt, button-up shirt, closed-toe shoes. NO jeans, tank tops, or sneakers.',
    whatToBring: [...WHAT_TO_BRING],
    expectedQuestions: [],
    howToAnswer: [],
    whoWillBeThere: ['Judge', 'CPS Caseworker', 'County Attorney', 'My Attorney', 'GAL'],
    postHearingActions: [],
    notes: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem(`court_countdown_${caseId}`);
    if (stored) {
      setHearings(JSON.parse(stored));
    }
  }, [caseId]);

  useEffect(() => {
    if (hearings.length > 0) {
      localStorage.setItem(`court_countdown_${caseId}`, JSON.stringify(hearings));
    }
  }, [hearings, caseId]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddHearing = () => {
    const newHearing: CourtHearing = {
      id: Date.now().toString(),
      date: formData.date || '',
      time: formData.time || '09:00',
      type: formData.type || 'review-6',
      judge: formData.judge,
      location: formData.location,
      prepChecklist: formData.prepChecklist || [],
      whatToWear: formData.whatToWear || '',
      whatToBring: formData.whatToBring || [],
      expectedQuestions: formData.expectedQuestions || [],
      howToAnswer: formData.howToAnswer || [],
      whoWillBeThere: formData.whoWillBeThere || [],
      postHearingActions: formData.postHearingActions || [],
      notes: formData.notes,
      createdAt: new Date().toISOString()
    };

    setHearings(prev => [...prev, newHearing].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));
    resetForm();
    setIsAdding(false);
  };

  const handleUpdateHearing = () => {
    if (!editingId) return;

    setHearings(prev => prev.map(hearing => 
      hearing.id === editingId 
        ? { ...hearing, ...formData }
        : hearing
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    
    resetForm();
    setEditingId(null);
  };

  const handleDeleteHearing = (id: string) => {
    if (confirm('Are you sure you want to delete this hearing?')) {
      setHearings(prev => prev.filter(hearing => hearing.id !== id));
    }
  };

  const handleEditHearing = (hearing: CourtHearing) => {
    setFormData(hearing);
    setEditingId(hearing.id);
    setIsAdding(true);
  };

  const toggleChecklistItem = (hearingId: string, itemId: string) => {
    setHearings(prev => prev.map(hearing => {
      if (hearing.id === hearingId) {
        return {
          ...hearing,
          prepChecklist: hearing.prepChecklist.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          )
        };
      }
      return hearing;
    }));
  };

  const resetForm = () => {
    setFormData({
      date: '',
      time: '09:00',
      type: 'review-6',
      judge: '',
      location: '',
      prepChecklist: DEFAULT_PREP_ITEMS.map((text, idx) => ({
        id: idx.toString(),
        text,
        completed: false
      })),
      whatToWear: 'Business professional - dress pants/skirt, button-up shirt, closed-toe shoes. NO jeans, tank tops, or sneakers.',
      whatToBring: [...WHAT_TO_BRING],
      expectedQuestions: [],
      howToAnswer: [],
      whoWillBeThere: ['Judge', 'CPS Caseworker', 'County Attorney', 'My Attorney', 'GAL'],
      postHearingActions: [],
      notes: ''
    });
  };

  const getCountdown = (date: string, time: string) => {
    const hearingDate = new Date(`${date}T${time}`);
    const diff = hearingDate.getTime() - currentTime.getTime();
    
    if (diff < 0) {
      return { days: 0, hours: 0, minutes: 0, isPast: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, isPast: false };
  };

  const getUrgencyColor = (days: number) => {
    if (days === 0) return 'red';
    if (days <= 3) return 'orange';
    if (days <= 7) return 'yellow';
    return 'green';
  };

  const upcomingHearings = hearings.filter(h => {
    const countdown = getCountdown(h.date, h.time);
    return !countdown.isPast;
  });

  const pastHearings = hearings.filter(h => {
    const countdown = getCountdown(h.date, h.time);
    return countdown.isPast;
  });

  const nextHearing = upcomingHearings[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-2 border-red-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Court Countdown & Prep</h2>
                <p className="text-sm text-gray-600">Never miss a hearing - prepare like a pro</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAdding(!isAdding)}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isAdding ? 'Cancel' : 'Add Hearing'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Next Hearing Countdown */}
      {nextHearing && (
        <Card className={`p-8 border-4 bg-gradient-to-br ${
          getUrgencyColor(getCountdown(nextHearing.date, nextHearing.time).days) === 'red' 
            ? 'from-red-100 to-red-50 border-red-400' 
            : getUrgencyColor(getCountdown(nextHearing.date, nextHearing.time).days) === 'orange'
            ? 'from-orange-100 to-orange-50 border-orange-400'
            : getUrgencyColor(getCountdown(nextHearing.date, nextHearing.time).days) === 'yellow'
            ? 'from-yellow-100 to-yellow-50 border-yellow-400'
            : 'from-green-100 to-green-50 border-green-400'
        }`}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Bell className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-bold text-gray-900">NEXT HEARING</h3>
            </div>
            
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {HEARING_TYPES.find(t => t.value === nextHearing.type)?.label || nextHearing.type}
            </div>
            
            <div className="text-2xl text-gray-700 mb-6">
              {new Date(nextHearing.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })} at {nextHearing.time}
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
              <div className="bg-white p-4 rounded-lg border-2 border-red-300">
                <div className="text-4xl font-bold text-red-700">
                  {getCountdown(nextHearing.date, nextHearing.time).days}
                </div>
                <div className="text-sm text-gray-600">Days</div>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-orange-300">
                <div className="text-4xl font-bold text-orange-700">
                  {getCountdown(nextHearing.date, nextHearing.time).hours}
                </div>
                <div className="text-sm text-gray-600">Hours</div>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-yellow-300">
                <div className="text-4xl font-bold text-yellow-700">
                  {getCountdown(nextHearing.date, nextHearing.time).minutes}
                </div>
                <div className="text-sm text-gray-600">Minutes</div>
              </div>
            </div>

            {nextHearing.location && (
              <div className="text-gray-700 mb-2">
                📍 {nextHearing.location}
              </div>
            )}
            {nextHearing.judge && (
              <div className="text-gray-700">
                ⚖️ Judge: {nextHearing.judge}
              </div>
            )}

            {getCountdown(nextHearing.date, nextHearing.time).days <= 3 && (
              <Alert className="mt-4 bg-red-100 border-red-400">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <AlertTitle className="text-red-900">URGENT: Hearing in {getCountdown(nextHearing.date, nextHearing.time).days} days!</AlertTitle>
                <AlertDescription className="text-red-800">
                  Make sure you've completed all preparation tasks below. This is CRITICAL!
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <Card className="p-6 border-2 border-red-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Hearing' : 'Add New Hearing'}
          </h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Hearing Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="border-red-300"
                />
              </div>
              <div>
                <Label>Time *</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="border-red-300"
                />
              </div>
              <div>
                <Label>Hearing Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="border-red-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HEARING_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Judge Name</Label>
                <Input
                  value={formData.judge || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, judge: e.target.value }))}
                  placeholder="Hon. Jane Smith"
                  className="border-red-300"
                />
              </div>
              <div>
                <Label>Courtroom Location</Label>
                <Input
                  value={formData.location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="County Courthouse, Room 302"
                  className="border-red-300"
                />
              </div>
            </div>

            <div>
              <Label>Additional Notes</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special instructions or reminders..."
                rows={2}
                className="border-red-300"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={editingId ? handleUpdateHearing : handleAddHearing}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                disabled={!formData.date}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update Hearing' : 'Add Hearing'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  resetForm();
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {hearings.length === 0 && !isAdding && (
        <Card className="p-12 text-center border-2 border-dashed border-red-200">
          <Calendar className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Court Hearings Scheduled</h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Add your upcoming court hearings to get countdown reminders and preparation checklists.
          </p>
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Hearing
          </Button>
        </Card>
      )}

      {/* Upcoming Hearings with Prep */}
      {upcomingHearings.map(hearing => {
        const countdown = getCountdown(hearing.date, hearing.time);
        const completedItems = hearing.prepChecklist.filter(item => item.completed).length;
        const totalItems = hearing.prepChecklist.length;
        const completionPercentage = (completedItems / totalItems) * 100;

        return (
          <Card key={hearing.id} className="p-6 border-2 border-orange-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">
                    {HEARING_TYPES.find(t => t.value === hearing.type)?.label || hearing.type}
                  </h3>
                  <Badge className="bg-orange-600">
                    {countdown.days} days, {countdown.hours} hrs
                  </Badge>
                </div>
                <div className="text-gray-600">
                  📅 {new Date(hearing.date).toLocaleDateString()} at {hearing.time}
                </div>
                {hearing.location && (
                  <div className="text-gray-600">📍 {hearing.location}</div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditHearing(hearing)}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteHearing(hearing.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Preparation Progress */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Preparation Progress</span>
                <span className="text-sm font-bold text-orange-700">
                  {completedItems}/{totalItems} ({completionPercentage.toFixed(0)}%)
                </span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
            </div>

            {/* Preparation Checklist */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-orange-600" />
                  Preparation Checklist
                </h4>
                <div className="space-y-2">
                  {hearing.prepChecklist.map(item => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                      onClick={() => toggleChecklistItem(hearing.id, item.id)}
                    >
                      {item.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={item.completed ? 'line-through text-gray-500' : ''}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold mb-2 text-blue-900">What to Wear</h4>
                  <p className="text-sm text-blue-800">{hearing.whatToWear}</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold mb-2 text-purple-900">Who Will Be There</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    {hearing.whoWillBeThere.map((person, idx) => (
                      <li key={idx}>• {person}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold mb-2 text-green-900">What to Bring</h4>
                <ul className="grid md:grid-cols-2 gap-1 text-sm text-green-800">
                  {hearing.whatToBring.map((item, idx) => (
                    <li key={idx}>✓ {item}</li>
                  ))}
                </ul>
              </div>

              {hearing.notes && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold mb-2 text-yellow-900">Notes</h4>
                  <p className="text-sm text-yellow-800">{hearing.notes}</p>
                </div>
              )}
            </div>
          </Card>
        );
      })}

      {/* Past Hearings */}
      {pastHearings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-500">Past Hearings</h3>
          {pastHearings.map(hearing => (
            <Card key={hearing.id} className="p-4 mb-2 bg-gray-50 border border-gray-200 opacity-60">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">
                    {HEARING_TYPES.find(t => t.value === hearing.type)?.label || hearing.type}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(hearing.date).toLocaleDateString()} at {hearing.time}
                  </div>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
