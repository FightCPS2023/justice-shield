import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { 
  Calendar, Clock, MapPin, User, Heart, AlertTriangle, 
  Plus, Download, Trash2, Edit2, Save, X, Camera,
  FileText, CheckCircle, XCircle, Smile, Frown, Meh
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Visit {
  id: string;
  date: string;
  time: string;
  duration: number; // in minutes
  location: string;
  supervisor?: string;
  childEmotionalState: 'happy' | 'neutral' | 'sad' | 'distressed';
  whatHappened: string;
  childQuotes?: string;
  supervisorIssues?: string;
  photos?: string[];
  visitAllowed: boolean;
  reasonDenied?: string;
  notes?: string;
  createdAt: string;
}

interface VisitationLogProps {
  caseId: string;
}

export function VisitationLog({ caseId }: VisitationLogProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState<Partial<Visit>>({
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 60,
    location: '',
    supervisor: '',
    childEmotionalState: 'happy',
    whatHappened: '',
    childQuotes: '',
    supervisorIssues: '',
    visitAllowed: true,
    reasonDenied: '',
    notes: ''
  });

  // Load visits from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`visitation_log_${caseId}`);
    if (stored) {
      setVisits(JSON.parse(stored));
    }
  }, [caseId]);

  // Save visits to localStorage
  useEffect(() => {
    if (visits.length > 0) {
      localStorage.setItem(`visitation_log_${caseId}`, JSON.stringify(visits));
    }
  }, [visits, caseId]);

  const handleAddVisit = () => {
    const newVisit: Visit = {
      id: Date.now().toString(),
      date: formData.date || new Date().toISOString().split('T')[0],
      time: formData.time || '10:00',
      duration: formData.duration || 60,
      location: formData.location || '',
      supervisor: formData.supervisor,
      childEmotionalState: formData.childEmotionalState || 'happy',
      whatHappened: formData.whatHappened || '',
      childQuotes: formData.childQuotes,
      supervisorIssues: formData.supervisorIssues,
      visitAllowed: formData.visitAllowed ?? true,
      reasonDenied: formData.reasonDenied,
      notes: formData.notes,
      createdAt: new Date().toISOString()
    };

    setVisits(prev => [newVisit, ...prev]);
    resetForm();
    setIsAdding(false);
  };

  const handleUpdateVisit = () => {
    if (!editingId) return;

    setVisits(prev => prev.map(visit => 
      visit.id === editingId 
        ? { ...visit, ...formData }
        : visit
    ));
    resetForm();
    setEditingId(null);
  };

  const handleDeleteVisit = (id: string) => {
    if (confirm('Are you sure you want to delete this visit record?')) {
      setVisits(prev => prev.filter(visit => visit.id !== id));
    }
  };

  const handleEditVisit = (visit: Visit) => {
    setFormData(visit);
    setEditingId(visit.id);
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      duration: 60,
      location: '',
      supervisor: '',
      childEmotionalState: 'happy',
      whatHappened: '',
      childQuotes: '',
      supervisorIssues: '',
      visitAllowed: true,
      reasonDenied: '',
      notes: ''
    });
  };

  const exportToPDF = () => {
    const content = visits.map(visit => 
      `Date: ${new Date(visit.date).toLocaleDateString()} at ${visit.time}
Duration: ${visit.duration} minutes
Location: ${visit.location}
Visit Allowed: ${visit.visitAllowed ? 'Yes' : 'No'}
${visit.reasonDenied ? `Reason Denied: ${visit.reasonDenied}` : ''}
Child's Emotional State: ${visit.childEmotionalState}
What Happened: ${visit.whatHappened}
${visit.childQuotes ? `Child Said: "${visit.childQuotes}"` : ''}
${visit.supervisorIssues ? `Supervisor Issues: ${visit.supervisorIssues}` : ''}
${visit.notes ? `Notes: ${visit.notes}` : ''}
-------------------`
    ).join('\n\n');

    const blob = new Blob([`VISITATION LOG - COURT EXHIBIT\n\nCase ID: ${caseId}\nGenerated: ${new Date().toLocaleString()}\nTotal Visits: ${visits.length}\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Visitation_Log_${caseId}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const getEmotionIcon = (emotion: Visit['childEmotionalState']) => {
    switch (emotion) {
      case 'happy':
        return <Smile className="w-5 h-5 text-green-600" />;
      case 'neutral':
        return <Meh className="w-5 h-5 text-blue-600" />;
      case 'sad':
        return <Frown className="w-5 h-5 text-orange-600" />;
      case 'distressed':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  const getEmotionColor = (emotion: Visit['childEmotionalState']) => {
    switch (emotion) {
      case 'happy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'neutral':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'sad':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'distressed':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const filteredVisits = filterMonth === 'all' 
    ? visits 
    : visits.filter(visit => visit.date.startsWith(filterMonth));

  const totalVisits = filteredVisits.length;
  const allowedVisits = filteredVisits.filter(v => v.visitAllowed).length;
  const deniedVisits = filteredVisits.filter(v => !v.visitAllowed).length;
  const totalHours = filteredVisits.reduce((sum, v) => sum + v.duration, 0) / 60;
  const supervisorIssuesCount = filteredVisits.filter(v => v.supervisorIssues).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-pink-50 via-rose-50 to-red-50 border-2 border-pink-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Visitation Log</h2>
                <p className="text-sm text-gray-600">Document every visit to prove parent-child bond</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAdding(!isAdding)}
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isAdding ? 'Cancel' : 'Log Visit'}
            </Button>
            {visits.length > 0 && (
              <Button
                onClick={exportToPDF}
                variant="outline"
                className="border-pink-300 hover:bg-pink-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export for Court
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Statistics */}
      {visits.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 border-2 border-green-200 bg-green-50">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">{totalVisits}</div>
              <div className="text-sm text-green-600">Total Visits</div>
            </div>
          </Card>
          <Card className="p-4 border-2 border-blue-200 bg-blue-50">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700">{allowedVisits}</div>
              <div className="text-sm text-blue-600">Allowed</div>
            </div>
          </Card>
          <Card className="p-4 border-2 border-red-200 bg-red-50">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-700">{deniedVisits}</div>
              <div className="text-sm text-red-600">Denied</div>
            </div>
          </Card>
          <Card className="p-4 border-2 border-purple-200 bg-purple-50">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-700">{totalHours.toFixed(1)}</div>
              <div className="text-sm text-purple-600">Total Hours</div>
            </div>
          </Card>
          <Card className="p-4 border-2 border-orange-200 bg-orange-50">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-700">{supervisorIssuesCount}</div>
              <div className="text-sm text-orange-600">Supervisor Issues</div>
            </div>
          </Card>
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <Card className="p-6 border-2 border-pink-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Visit Record' : 'Log New Visit'}
          </h3>
          <div className="space-y-4">
            {/* Visit Allowed Toggle */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Label className="font-medium">Was the visit allowed?</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.visitAllowed ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, visitAllowed: true }))}
                  className={formData.visitAllowed ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={!formData.visitAllowed ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, visitAllowed: false }))}
                  className={!formData.visitAllowed ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  No
                </Button>
              </div>
            </div>

            {!formData.visitAllowed && (
              <div>
                <Label>Reason Visit Was Denied *</Label>
                <Textarea
                  value={formData.reasonDenied || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, reasonDenied: e.target.value }))}
                  placeholder="Who denied the visit and why? Include exact quotes if possible..."
                  rows={3}
                  className="border-red-300 focus:border-red-500"
                />
              </div>
            )}

            {formData.visitAllowed && (
              <>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Visit Date *</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="border-pink-300 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <Label>Visit Time *</Label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      className="border-pink-300 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <Label>Duration (minutes) *</Label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      placeholder="60"
                      min="1"
                      className="border-pink-300 focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Location *</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="CPS office, park, foster home..."
                      className="border-pink-300 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <Label>Supervisor (if applicable)</Label>
                    <Input
                      value={formData.supervisor}
                      onChange={(e) => setFormData(prev => ({ ...prev, supervisor: e.target.value }))}
                      placeholder="Name of person supervising visit"
                      className="border-pink-300 focus:border-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <Label>Child's Emotional State *</Label>
                  <Select
                    value={formData.childEmotionalState}
                    onValueChange={(value: Visit['childEmotionalState']) => 
                      setFormData(prev => ({ ...prev, childEmotionalState: value }))
                    }
                  >
                    <SelectTrigger className="border-pink-300 focus:border-pink-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="happy">😊 Happy - Excited to see you, playful</SelectItem>
                      <SelectItem value="neutral">😐 Neutral - Calm, normal interaction</SelectItem>
                      <SelectItem value="sad">😢 Sad - Tearful, withdrawn</SelectItem>
                      <SelectItem value="distressed">😰 Distressed - Crying, doesn't want visit to end</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>What Happened During Visit *</Label>
                  <Textarea
                    value={formData.whatHappened}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatHappened: e.target.value }))}
                    placeholder="Describe activities, child's behavior, any special moments..."
                    rows={4}
                    className="border-pink-300 focus:border-pink-500"
                  />
                </div>

                <div>
                  <Label>What Child Said (Quotes)</Label>
                  <Textarea
                    value={formData.childQuotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, childQuotes: e.target.value }))}
                    placeholder="I miss you mommy / When can I come home? / I don't like it there"
                    rows={2}
                    className="border-pink-300 focus:border-pink-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Document exact words - extremely important for court!</p>
                </div>

                <div>
                  <Label>Supervisor Behavior/Violations</Label>
                  <Textarea
                    value={formData.supervisorIssues}
                    onChange={(e) => setFormData(prev => ({ ...prev, supervisorIssues: e.target.value }))}
                    placeholder="Did supervisor interfere, make comments, cut visit short, refuse to allow physical contact, etc.?"
                    rows={3}
                    className="border-pink-300 focus:border-pink-500"
                  />
                </div>

                <div>
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any other observations, child's appearance, injuries noticed, etc."
                    rows={2}
                    className="border-pink-300 focus:border-pink-500"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={editingId ? handleUpdateVisit : handleAddVisit}
                className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                disabled={!formData.date || (!formData.visitAllowed && !formData.reasonDenied) || (formData.visitAllowed && !formData.whatHappened)}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update Visit' : 'Save Visit'}
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
      {visits.length === 0 && !isAdding && (
        <Card className="p-12 text-center border-2 border-dashed border-pink-200">
          <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Visits Logged Yet</h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Start documenting your visits with your children. This log will prove your ongoing parent-child bond and consistent visitation for court.
          </p>
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Your First Visit
          </Button>
        </Card>
      )}

      {/* Visits List */}
      {visits.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Visit History ({filteredVisits.length})</h3>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {Array.from(new Set(visits.map(v => v.date.substring(0, 7)))).sort().reverse().map(month => (
                  <SelectItem key={month} value={month}>
                    {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredVisits.map(visit => (
            <Card key={visit.id} className={`p-5 border-2 ${visit.visitAllowed ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {visit.visitAllowed ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-lg">
                        {new Date(visit.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <Badge className="bg-pink-600">{visit.time}</Badge>
                      <Badge variant="outline">{visit.duration} min</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1 flex-wrap">
                      <MapPin className="w-3 h-3" />
                      <span>{visit.location}</span>
                      {visit.supervisor && (
                        <>
                          <span>•</span>
                          <User className="w-3 h-3" />
                          <span>{visit.supervisor}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditVisit(visit)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteVisit(visit.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {!visit.visitAllowed ? (
                <Alert className="bg-red-100 border-red-300 mb-3">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertTitle>Visit Denied</AlertTitle>
                  <AlertDescription>{visit.reasonDenied}</AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium">Child's Emotional State:</span>
                    <Badge className={`${getEmotionColor(visit.childEmotionalState)} border flex items-center gap-1`}>
                      {getEmotionIcon(visit.childEmotionalState)}
                      <span className="capitalize">{visit.childEmotionalState}</span>
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">What Happened:</div>
                      <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                        {visit.whatHappened}
                      </div>
                    </div>

                    {visit.childQuotes && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Child Said (Direct Quotes):
                        </div>
                        <div className="text-sm text-blue-900 bg-blue-50 p-3 rounded border border-blue-200 italic">
                          "{visit.childQuotes}"
                        </div>
                      </div>
                    )}

                    {visit.supervisorIssues && (
                      <Alert className="bg-orange-50 border-orange-300">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <AlertTitle className="text-orange-900">Supervisor Issues</AlertTitle>
                        <AlertDescription className="text-orange-800">{visit.supervisorIssues}</AlertDescription>
                      </Alert>
                    )}

                    {visit.notes && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Additional Notes:</div>
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                          {visit.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="text-xs text-gray-400 pt-2 border-t">
                Logged: {new Date(visit.createdAt).toLocaleString()}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}