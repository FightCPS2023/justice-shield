import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { 
  Phone, Mail, MessageSquare, User as UserIcon, Calendar, Clock,
  Plus, Download, Trash2, Edit2, Save, X, AlertTriangle, Flag,
  Search, Filter, FileText, Users, Building, Shield
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Communication {
  id: string;
  date: string;
  time: string;
  type: 'phone' | 'email' | 'text' | 'in-person';
  person: string;
  personRole: string;
  direction: 'incoming' | 'outgoing';
  summary: string;
  exactQuotes?: string;
  threatening?: boolean;
  coercive?: boolean;
  requestMade?: string;
  responseGiven?: string;
  witnesses?: string;
  followUpNeeded?: string;
  tags?: string[];
  createdAt: string;
}

interface CommunicationLogProps {
  caseId: string;
}

const PERSON_ROLES = [
  { value: 'caseworker', label: 'CPS Caseworker', icon: Shield },
  { value: 'supervisor', label: 'CPS Supervisor', icon: UserIcon },
  { value: 'attorney-mine', label: 'My Attorney', icon: UserIcon },
  { value: 'attorney-gal', label: 'GAL (Guardian ad Litem)', icon: UserIcon },
  { value: 'attorney-county', label: 'County/State Attorney', icon: Building },
  { value: 'casa', label: 'CASA Volunteer', icon: Users },
  { value: 'foster-parent', label: 'Foster Parent', icon: UserIcon },
  { value: 'service-provider', label: 'Service Provider', icon: Building },
  { value: 'therapist', label: 'Therapist/Counselor', icon: UserIcon },
  { value: 'court', label: 'Court Personnel', icon: Building },
  { value: 'other', label: 'Other', icon: UserIcon }
];

const COMMON_TAGS = [
  'Visitation', 'Case Plan', 'Court Date', 'Services', 'Reunification',
  'Foster Care', 'Medical', 'School', 'Drug Test', 'Home Visit',
  'Threat', 'Coercion', 'Lie', 'Violation', 'Emergency'
];

export function CommunicationLog({ caseId }: CommunicationLogProps) {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const [formData, setFormData] = useState<Partial<Communication>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    type: 'phone',
    person: '',
    personRole: 'caseworker',
    direction: 'incoming',
    summary: '',
    exactQuotes: '',
    threatening: false,
    coercive: false,
    requestMade: '',
    responseGiven: '',
    witnesses: '',
    followUpNeeded: '',
    tags: []
  });

  useEffect(() => {
    const stored = localStorage.getItem(`communication_log_${caseId}`);
    if (stored) {
      setCommunications(JSON.parse(stored));
    }
  }, [caseId]);

  useEffect(() => {
    if (communications.length > 0) {
      localStorage.setItem(`communication_log_${caseId}`, JSON.stringify(communications));
    }
  }, [communications, caseId]);

  const handleAddCommunication = () => {
    const newCommunication: Communication = {
      id: Date.now().toString(),
      date: formData.date || new Date().toISOString().split('T')[0],
      time: formData.time || '10:00',
      type: formData.type || 'phone',
      person: formData.person || '',
      personRole: formData.personRole || 'caseworker',
      direction: formData.direction || 'incoming',
      summary: formData.summary || '',
      exactQuotes: formData.exactQuotes,
      threatening: formData.threatening || false,
      coercive: formData.coercive || false,
      requestMade: formData.requestMade,
      responseGiven: formData.responseGiven,
      witnesses: formData.witnesses,
      followUpNeeded: formData.followUpNeeded,
      tags: formData.tags || [],
      createdAt: new Date().toISOString()
    };

    setCommunications(prev => [newCommunication, ...prev]);
    resetForm();
    setIsAdding(false);
  };

  const handleUpdateCommunication = () => {
    if (!editingId) return;

    setCommunications(prev => prev.map(comm => 
      comm.id === editingId 
        ? { ...comm, ...formData }
        : comm
    ));
    resetForm();
    setEditingId(null);
  };

  const handleDeleteCommunication = (id: string) => {
    if (confirm('Are you sure you want to delete this communication record?')) {
      setCommunications(prev => prev.filter(comm => comm.id !== id));
    }
  };

  const handleEditCommunication = (comm: Communication) => {
    setFormData(comm);
    setEditingId(comm.id);
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      type: 'phone',
      person: '',
      personRole: 'caseworker',
      direction: 'incoming',
      summary: '',
      exactQuotes: '',
      threatening: false,
      coercive: false,
      requestMade: '',
      responseGiven: '',
      witnesses: '',
      followUpNeeded: '',
      tags: []
    });
  };

  const exportToDiscovery = () => {
    const content = communications.map(comm => 
      `DATE: ${new Date(comm.date).toLocaleDateString()} at ${comm.time}
TYPE: ${comm.type.toUpperCase()} (${comm.direction})
PERSON: ${comm.person} (${comm.personRole})
${comm.threatening ? '⚠️ THREATENING COMMUNICATION' : ''}
${comm.coercive ? '⚠️ COERCIVE COMMUNICATION' : ''}

SUMMARY:
${comm.summary}

${comm.exactQuotes ? `EXACT QUOTES:\n"${comm.exactQuotes}"\n` : ''}
${comm.requestMade ? `REQUEST MADE:\n${comm.requestMade}\n` : ''}
${comm.responseGiven ? `MY RESPONSE:\n${comm.responseGiven}\n` : ''}
${comm.witnesses ? `WITNESSES: ${comm.witnesses}\n` : ''}
${comm.followUpNeeded ? `FOLLOW-UP NEEDED: ${comm.followUpNeeded}\n` : ''}
${comm.tags && comm.tags.length > 0 ? `TAGS: ${comm.tags.join(', ')}\n` : ''}
${'='.repeat(70)}`
    ).join('\n\n');

    const blob = new Blob([`COMMUNICATION LOG - DISCOVERY EXHIBIT\n\nCase ID: ${caseId}\nGenerated: ${new Date().toLocaleString()}\nTotal Communications: ${communications.length}\n\n${'='.repeat(70)}\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Communication_Log_${caseId}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const getTypeIcon = (type: Communication['type']) => {
    switch (type) {
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'text':
        return <MessageSquare className="w-4 h-4" />;
      case 'in-person':
        return <Users className="w-4 h-4" />;
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag]
    }));
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = searchTerm === '' || 
      comm.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.exactQuotes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || comm.personRole === filterRole;
    const matchesType = filterType === 'all' || comm.type === filterType;

    return matchesSearch && matchesRole && matchesType;
  });

  const totalComms = filteredCommunications.length;
  const threateningComms = filteredCommunications.filter(c => c.threatening).length;
  const coerciveComms = filteredCommunications.filter(c => c.coercive).length;
  const caseworkerComms = filteredCommunications.filter(c => c.personRole === 'caseworker').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 border-2 border-cyan-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Communication Log</h2>
                <p className="text-sm text-gray-600">Track all communications with CPS and case stakeholders</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAdding(!isAdding)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isAdding ? 'Cancel' : 'Log Communication'}
            </Button>
            {communications.length > 0 && (
              <Button
                onClick={exportToDiscovery}
                variant="outline"
                className="border-cyan-300 hover:bg-cyan-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export for Discovery
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Statistics */}
      {communications.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-2 border-blue-200 bg-blue-50">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700">{totalComms}</div>
              <div className="text-sm text-blue-600">Total Communications</div>
            </div>
          </Card>
          <Card className="p-4 border-2 border-red-200 bg-red-50">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-700">{threateningComms}</div>
              <div className="text-sm text-red-600">Threatening</div>
            </div>
          </Card>
          <Card className="p-4 border-2 border-orange-200 bg-orange-50">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-700">{coerciveComms}</div>
              <div className="text-sm text-orange-600">Coercive</div>
            </div>
          </Card>
          <Card className="p-4 border-2 border-purple-200 bg-purple-50">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-700">{caseworkerComms}</div>
              <div className="text-sm text-purple-600">From Caseworker</div>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      {communications.length > 0 && (
        <Card className="p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search communications..."
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Filter by Person</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All People</SelectItem>
                  {PERSON_ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Filter by Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="phone">Phone Calls</SelectItem>
                  <SelectItem value="email">Emails</SelectItem>
                  <SelectItem value="text">Text Messages</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <Card className="p-6 border-2 border-cyan-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Communication Record' : 'Log New Communication'}
          </h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="border-cyan-300"
                />
              </div>
              <div>
                <Label>Time *</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="border-cyan-300"
                />
              </div>
              <div>
                <Label>Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Communication['type']) => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="border-cyan-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">📞 Phone Call</SelectItem>
                    <SelectItem value="email">📧 Email</SelectItem>
                    <SelectItem value="text">💬 Text Message</SelectItem>
                    <SelectItem value="in-person">👥 In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Direction *</Label>
                <Select
                  value={formData.direction}
                  onValueChange={(value: Communication['direction']) => 
                    setFormData(prev => ({ ...prev, direction: value }))
                  }
                >
                  <SelectTrigger className="border-cyan-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incoming">⬇️ Incoming (They contacted me)</SelectItem>
                    <SelectItem value="outgoing">⬆️ Outgoing (I contacted them)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Person *</Label>
                <Input
                  value={formData.person}
                  onChange={(e) => setFormData(prev => ({ ...prev, person: e.target.value }))}
                  placeholder="Full name of person"
                  className="border-cyan-300"
                />
              </div>
              <div>
                <Label>Person's Role *</Label>
                <Select
                  value={formData.personRole}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, personRole: value }))}
                >
                  <SelectTrigger className="border-cyan-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERSON_ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Summary of Communication *</Label>
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Describe what was discussed..."
                rows={3}
                className="border-cyan-300"
              />
            </div>

            <div>
              <Label>Exact Quotes (CRITICAL FOR COURT!)</Label>
              <Textarea
                value={formData.exactQuotes}
                onChange={(e) => setFormData(prev => ({ ...prev, exactQuotes: e.target.value }))}
                placeholder="If you don't do X, we'll remove your kids / You'll never see your children again / etc."
                rows={2}
                className="border-cyan-300"
              />
              <p className="text-xs text-gray-500 mt-1">Write down EXACT words spoken - especially threats or lies</p>
            </div>

            <div className="flex gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="threatening"
                  checked={formData.threatening}
                  onChange={(e) => setFormData(prev => ({ ...prev, threatening: e.target.checked }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="threatening" className="cursor-pointer">
                  <AlertTriangle className="w-4 h-4 inline mr-1 text-red-600" />
                  Threatening
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="coercive"
                  checked={formData.coercive}
                  onChange={(e) => setFormData(prev => ({ ...prev, coercive: e.target.checked }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="coercive" className="cursor-pointer">
                  <Flag className="w-4 h-4 inline mr-1 text-orange-600" />
                  Coercive
                </Label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Request/Demand Made</Label>
                <Textarea
                  value={formData.requestMade}
                  onChange={(e) => setFormData(prev => ({ ...prev, requestMade: e.target.value }))}
                  placeholder="What did they ask you to do?"
                  rows={2}
                  className="border-cyan-300"
                />
              </div>
              <div>
                <Label>Your Response</Label>
                <Textarea
                  value={formData.responseGiven}
                  onChange={(e) => setFormData(prev => ({ ...prev, responseGiven: e.target.value }))}
                  placeholder="What did you say/do in response?"
                  rows={2}
                  className="border-cyan-300"
                />
              </div>
            </div>

            <div>
              <Label>Witnesses</Label>
              <Input
                value={formData.witnesses}
                onChange={(e) => setFormData(prev => ({ ...prev, witnesses: e.target.value }))}
                placeholder="Anyone who heard/saw this communication?"
                className="border-cyan-300"
              />
            </div>

            <div>
              <Label>Follow-Up Needed</Label>
              <Input
                value={formData.followUpNeeded}
                onChange={(e) => setFormData(prev => ({ ...prev, followUpNeeded: e.target.value }))}
                placeholder="What action do you need to take?"
                className="border-cyan-300"
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COMMON_TAGS.map(tag => (
                  <Badge
                    key={tag}
                    variant={formData.tags?.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-cyan-100"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={editingId ? handleUpdateCommunication : handleAddCommunication}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                disabled={!formData.date || !formData.person || !formData.summary}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update Communication' : 'Save Communication'}
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
      {communications.length === 0 && !isAdding && (
        <Card className="p-12 text-center border-2 border-dashed border-cyan-200">
          <MessageSquare className="w-16 h-16 text-cyan-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Communications Logged Yet</h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Start documenting ALL communications with CPS workers, attorneys, and service providers. This is crucial evidence for court!
          </p>
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Your First Communication
          </Button>
        </Card>
      )}

      {/* Communications List */}
      {filteredCommunications.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Communication History ({filteredCommunications.length})</h3>

          {filteredCommunications.map(comm => (
            <Card 
              key={comm.id} 
              className={`p-5 border-2 ${
                comm.threatening || comm.coercive 
                  ? 'border-red-300 bg-red-50/30' 
                  : 'border-cyan-200 bg-cyan-50/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    comm.direction === 'incoming' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {getTypeIcon(comm.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-lg">{comm.person}</span>
                      <Badge variant="outline" className="text-xs">
                        {PERSON_ROLES.find(r => r.value === comm.personRole)?.label}
                      </Badge>
                      {comm.threatening && (
                        <Badge className="bg-red-600 text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Threatening
                        </Badge>
                      )}
                      {comm.coercive && (
                        <Badge className="bg-orange-600 text-xs">
                          <Flag className="w-3 h-3 mr-1" />
                          Coercive
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(comm.date).toLocaleDateString()}</span>
                      <Clock className="w-3 h-3 ml-2" />
                      <span>{comm.time}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {comm.type === 'phone' && '📞 Phone'}
                        {comm.type === 'email' && '📧 Email'}
                        {comm.type === 'text' && '💬 Text'}
                        {comm.type === 'in-person' && '👥 In-Person'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {comm.direction === 'incoming' ? '⬇️ Incoming' : '⬆️ Outgoing'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditCommunication(comm)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCommunication(comm.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Summary:</div>
                  <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                    {comm.summary}
                  </div>
                </div>

                {comm.exactQuotes && (
                  <Alert className="bg-yellow-50 border-yellow-300">
                    <FileText className="w-4 h-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-900">Exact Quotes (Evidence)</AlertTitle>
                    <AlertDescription className="text-yellow-800 italic">"{comm.exactQuotes}"</AlertDescription>
                  </Alert>
                )}

                {comm.requestMade && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Request Made:</div>
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
                      {comm.requestMade}
                    </div>
                  </div>
                )}

                {comm.responseGiven && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">My Response:</div>
                    <div className="text-sm text-gray-600 bg-green-50 p-3 rounded border border-green-200">
                      {comm.responseGiven}
                    </div>
                  </div>
                )}

                {comm.witnesses && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Witnesses:</span> {comm.witnesses}
                  </div>
                )}

                {comm.followUpNeeded && (
                  <Alert className="bg-orange-50 border-orange-300">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <AlertTitle className="text-orange-900 text-sm">Follow-Up Needed</AlertTitle>
                    <AlertDescription className="text-orange-800 text-sm">{comm.followUpNeeded}</AlertDescription>
                  </Alert>
                )}

                {comm.tags && comm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {comm.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-400 pt-3 mt-3 border-t">
                Logged: {new Date(comm.createdAt).toLocaleString()}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}