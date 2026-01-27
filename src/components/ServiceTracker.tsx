import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { 
  CheckCircle, Circle, Clock, Plus, Download, Trash2, Edit2, Save, X,
  AlertCircle, Upload, FileCheck, Calendar, Bell, Target, TrendingUp,
  Award, BookOpen, Brain, Heart, Home, Briefcase, Shield
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Service {
  id: string;
  name: string;
  category: string;
  status: 'not-started' | 'in-progress' | 'completed';
  courtOrdered: boolean;
  orderDate?: string;
  dueDate?: string;
  completionDate?: string;
  provider?: string;
  location?: string;
  numberOfSessions?: number;
  completedSessions?: number;
  certificate?: string;
  notes?: string;
  barriers?: string;
  createdAt: string;
}

interface ServiceTrackerProps {
  caseId: string;
}

const SERVICE_CATEGORIES = [
  { value: 'parenting', label: 'Parenting Classes', icon: Heart },
  { value: 'substance', label: 'Substance Abuse Treatment', icon: Shield },
  { value: 'mental-health', label: 'Mental Health / Therapy', icon: Brain },
  { value: 'domestic-violence', label: 'Domestic Violence Classes', icon: AlertCircle },
  { value: 'anger-management', label: 'Anger Management', icon: Target },
  { value: 'drug-testing', label: 'Drug Testing', icon: FileCheck },
  { value: 'housing', label: 'Housing / Stability', icon: Home },
  { value: 'employment', label: 'Employment Verification', icon: Briefcase },
  { value: 'education', label: 'Education / GED', icon: BookOpen },
  { value: 'other', label: 'Other Service', icon: Award }
];

export function ServiceTracker({ caseId }: ServiceTrackerProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    category: 'parenting',
    status: 'not-started',
    courtOrdered: true,
    orderDate: '',
    dueDate: '',
    completionDate: '',
    provider: '',
    location: '',
    numberOfSessions: 0,
    completedSessions: 0,
    notes: '',
    barriers: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem(`service_tracker_${caseId}`);
    if (stored) {
      setServices(JSON.parse(stored));
    }
  }, [caseId]);

  useEffect(() => {
    if (services.length > 0) {
      localStorage.setItem(`service_tracker_${caseId}`, JSON.stringify(services));
    }
  }, [services, caseId]);

  const handleAddService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: formData.name || '',
      category: formData.category || 'other',
      status: formData.status || 'not-started',
      courtOrdered: formData.courtOrdered ?? true,
      orderDate: formData.orderDate,
      dueDate: formData.dueDate,
      completionDate: formData.completionDate,
      provider: formData.provider,
      location: formData.location,
      numberOfSessions: formData.numberOfSessions,
      completedSessions: formData.completedSessions,
      notes: formData.notes,
      barriers: formData.barriers,
      createdAt: new Date().toISOString()
    };

    setServices(prev => [newService, ...prev]);
    resetForm();
    setIsAdding(false);
  };

  const handleUpdateService = () => {
    if (!editingId) return;

    setServices(prev => prev.map(service => 
      service.id === editingId 
        ? { ...service, ...formData }
        : service
    ));
    resetForm();
    setEditingId(null);
  };

  const handleDeleteService = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      setServices(prev => prev.filter(service => service.id !== id));
    }
  };

  const handleEditService = (service: Service) => {
    setFormData(service);
    setEditingId(service.id);
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'parenting',
      status: 'not-started',
      courtOrdered: true,
      orderDate: '',
      dueDate: '',
      completionDate: '',
      provider: '',
      location: '',
      numberOfSessions: 0,
      completedSessions: 0,
      notes: '',
      barriers: ''
    });
  };

  const exportComplianceReport = () => {
    const completed = services.filter(s => s.status === 'completed').length;
    const inProgress = services.filter(s => s.status === 'in-progress').length;
    const notStarted = services.filter(s => s.status === 'not-started').length;
    const completionPercentage = services.length > 0 ? ((completed / services.length) * 100).toFixed(1) : 0;

    const content = `CASE PLAN COMPLIANCE REPORT

Case ID: ${caseId}
Generated: ${new Date().toLocaleString()}
Total Services: ${services.length}

SUMMARY:
✓ Completed: ${completed}
⏳ In Progress: ${inProgress}
○ Not Started: ${notStarted}
Completion Rate: ${completionPercentage}%

${services.map(service => `
=====================================
SERVICE: ${service.name}
Category: ${service.category.toUpperCase()}
Status: ${service.status.toUpperCase()}
Court Ordered: ${service.courtOrdered ? 'YES' : 'NO'}
${service.orderDate ? `Ordered: ${new Date(service.orderDate).toLocaleDateString()}` : ''}
${service.dueDate ? `Due: ${new Date(service.dueDate).toLocaleDateString()}` : ''}
${service.completionDate ? `Completed: ${new Date(service.completionDate).toLocaleDateString()}` : ''}
${service.provider ? `Provider: ${service.provider}` : ''}
${service.location ? `Location: ${service.location}` : ''}
${service.numberOfSessions ? `Sessions: ${service.completedSessions || 0}/${service.numberOfSessions}` : ''}
${service.notes ? `Notes: ${service.notes}` : ''}
${service.barriers ? `Barriers: ${service.barriers}` : ''}
=====================================
`).join('\n')}

This report demonstrates ${completionPercentage >= 75 ? 'EXCELLENT' : completionPercentage >= 50 ? 'GOOD' : 'PARTIAL'} compliance with court-ordered case plan requirements.

Generated by The CPS Punisher™ - Professional CPS Case Defense Analyzer
Copyright © 2024 DARREN GUAY - All Rights Reserved`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Service_Compliance_Report_${caseId}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const getStatusIcon = (status: Service['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'not-started':
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'not-started':
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = SERVICE_CATEGORIES.find(c => c.value === category);
    return cat ? cat.icon : Award;
  };

  const totalServices = services.length;
  const completedServices = services.filter(s => s.status === 'completed').length;
  const inProgressServices = services.filter(s => s.status === 'in-progress').length;
  const completionPercentage = totalServices > 0 ? (completedServices / totalServices) * 100 : 0;
  const courtOrderedServices = services.filter(s => s.courtOrdered).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Service Completion Tracker</h2>
                <p className="text-sm text-gray-600">Track case plan compliance and service completion</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAdding(!isAdding)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isAdding ? 'Cancel' : 'Add Service'}
            </Button>
            {services.length > 0 && (
              <Button
                onClick={exportComplianceReport}
                variant="outline"
                className="border-blue-300 hover:bg-blue-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Compliance Report
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Progress Overview */}
      {services.length > 0 && (
        <Card className="p-6 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-semibold">Overall Progress</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Case Plan Completion</span>
                <span className="text-sm font-bold text-indigo-700">{completionPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border-2 border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{totalServices}</div>
                <div className="text-xs text-gray-600">Total Services</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border-2 border-green-200">
                <div className="text-2xl font-bold text-green-700">{completedServices}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border-2 border-indigo-200">
                <div className="text-2xl font-bold text-indigo-700">{inProgressServices}</div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border-2 border-purple-200">
                <div className="text-2xl font-bold text-purple-700">{courtOrderedServices}</div>
                <div className="text-xs text-gray-600">Court Ordered</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <Card className="p-6 border-2 border-blue-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Service' : 'Add New Service'}
          </h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Service Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="border-blue-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      return (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{cat.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Service Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., 12-week Parenting Skills Course"
                  className="border-blue-300"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Service['status']) => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="border-blue-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Court Ordered?</Label>
                <Select
                  value={formData.courtOrdered ? 'yes' : 'no'}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, courtOrdered: value === 'yes' }))
                  }
                >
                  <SelectTrigger className="border-blue-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes - Court Ordered</SelectItem>
                    <SelectItem value="no">No - Voluntary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Order Date</Label>
                <Input
                  type="date"
                  value={formData.orderDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                  className="border-blue-300"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="border-blue-300"
                />
              </div>
              <div>
                <Label>Completion Date</Label>
                <Input
                  type="date"
                  value={formData.completionDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, completionDate: e.target.value }))}
                  className="border-blue-300"
                  disabled={formData.status !== 'completed'}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Service Provider</Label>
                <Input
                  value={formData.provider || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                  placeholder="Agency or provider name"
                  className="border-blue-300"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Address or facility name"
                  className="border-blue-300"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Total Sessions/Hours Required</Label>
                <Input
                  type="number"
                  value={formData.numberOfSessions || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, numberOfSessions: parseInt(e.target.value) || 0 }))}
                  placeholder="12"
                  min="0"
                  className="border-blue-300"
                />
              </div>
              <div>
                <Label>Sessions/Hours Completed</Label>
                <Input
                  type="number"
                  value={formData.completedSessions || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, completedSessions: parseInt(e.target.value) || 0 }))}
                  placeholder="8"
                  min="0"
                  max={formData.numberOfSessions || undefined}
                  className="border-blue-300"
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional information about this service..."
                rows={2}
                className="border-blue-300"
              />
            </div>

            <div>
              <Label>Barriers to Completion</Label>
              <Textarea
                value={formData.barriers || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, barriers: e.target.value }))}
                placeholder="Transportation issues, scheduling conflicts, waitlist, cost, etc."
                rows={2}
                className="border-blue-300"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={editingId ? handleUpdateService : handleAddService}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={!formData.name || !formData.category}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update Service' : 'Add Service'}
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
      {services.length === 0 && !isAdding && (
        <Card className="p-12 text-center border-2 border-dashed border-blue-200">
          <Target className="w-16 h-16 text-blue-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Services Added Yet</h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Start tracking your court-ordered services and case plan requirements. Show the court your compliance!
          </p>
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Service
          </Button>
        </Card>
      )}

      {/* Services List */}
      {services.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Service Details ({services.length})</h3>

          {services.map(service => {
            const Icon = getCategoryIcon(service.category);
            const sessionProgress = service.numberOfSessions 
              ? ((service.completedSessions || 0) / service.numberOfSessions) * 100 
              : 0;

            return (
              <Card key={service.id} className={`p-5 border-2 ${getStatusColor(service.status).replace('text-', 'border-').replace('100', '200')}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(service.status)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-semibold text-lg">{service.name}</h4>
                        {service.courtOrdered && (
                          <Badge className="bg-red-600 text-xs">Court Ordered</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-sm text-gray-600">
                        <Badge variant="outline" className={`${getStatusColor(service.status)} border`}>
                          {getStatusIcon(service.status)}
                          <span className="ml-1 capitalize">{service.status.replace('-', ' ')}</span>
                        </Badge>
                        <span className="text-gray-400">•</span>
                        <span className="capitalize">{SERVICE_CATEGORIES.find(c => c.value === service.category)?.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteService(service.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-3">
                  {service.orderDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Ordered</div>
                        <div className="font-medium">{new Date(service.orderDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                  {service.dueDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Bell className="w-4 h-4 text-orange-500" />
                      <div>
                        <div className="text-xs text-gray-500">Due</div>
                        <div className="font-medium">{new Date(service.dueDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                  {service.completionDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <div className="text-xs text-gray-500">Completed</div>
                        <div className="font-medium">{new Date(service.completionDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                </div>

                {service.numberOfSessions && service.numberOfSessions > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Session Progress</span>
                      <span className="font-semibold">{service.completedSessions || 0} / {service.numberOfSessions}</span>
                    </div>
                    <Progress value={sessionProgress} className="h-2" />
                  </div>
                )}

                <div className="space-y-2">
                  {service.provider && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Provider:</span> {service.provider}
                      {service.location && <span className="text-gray-500"> • {service.location}</span>}
                    </div>
                  )}

                  {service.notes && (
                    <div className="text-sm bg-blue-50 p-3 rounded border border-blue-200">
                      <div className="font-medium text-blue-900 mb-1">Notes:</div>
                      <div className="text-blue-800">{service.notes}</div>
                    </div>
                  )}

                  {service.barriers && (
                    <Alert className="bg-orange-50 border-orange-300">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <AlertTitle className="text-orange-900 text-sm">Barriers to Completion</AlertTitle>
                      <AlertDescription className="text-orange-800 text-sm">{service.barriers}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
