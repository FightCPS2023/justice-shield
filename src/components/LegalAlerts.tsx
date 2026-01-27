import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Bell, BellRing, Plus, Trash2, Edit2, Search, 
  FileText, Gavel, Clock, Mail, Webhook, 
  AlertCircle, CheckCircle2, Crown, Sparkles,
  Copy, ExternalLink, Settings, Filter
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface SearchAlert {
  id: number;
  name: string;
  query: string;
  rate: 'rt' | 'dly' | 'wly' | 'mly';
  alert_type: string;
  date_created: string;
  date_last_hit: string | null;
  secret_key: string;
}

interface DocketAlert {
  id: number;
  docket: number;
  alert_type: 0 | 1; // 0 = unsubscribe, 1 = subscribe
  date_created: string;
  date_last_hit: string | null;
  secret_key: string;
  docket_name?: string;
}

interface LegalAlertsProps {
  violations?: any;
  caseDetails?: any;
}

export function LegalAlerts({ violations = {}, caseDetails = {} }: LegalAlertsProps) {
  const { isPremium, isAttorney } = useSubscription();
  const [searchAlerts, setSearchAlerts] = useState<SearchAlert[]>([
    {
      id: 1,
      name: 'Fourth Amendment CPS Cases',
      query: 'q="Fourth Amendment" AND "child protective services"&type=o',
      rate: 'rt',
      alert_type: 'o',
      date_created: '2024-01-15T10:30:00Z',
      date_last_hit: '2024-01-20T14:22:00Z',
      secret_key: 'abc123def456'
    },
    {
      id: 2,
      name: 'Emergency Removal Standards',
      query: 'q="emergency removal" AND "imminent danger"&type=o',
      rate: 'dly',
      alert_type: 'o',
      date_created: '2024-01-10T09:15:00Z',
      date_last_hit: null,
      secret_key: 'xyz789ghi012'
    },
    {
      id: 3,
      name: 'Due Process Violations',
      query: 'q="due process" AND CPS&type=o',
      rate: 'wly',
      alert_type: 'o',
      date_created: '2024-01-05T11:45:00Z',
      date_last_hit: '2024-01-18T09:33:00Z',
      secret_key: 'mno345pqr678'
    }
  ]);

  const [docketAlerts, setDocketAlerts] = useState<DocketAlert[]>([
    {
      id: 101,
      docket: 12345,
      alert_type: 1,
      date_created: '2024-01-12T13:20:00Z',
      date_last_hit: '2024-01-19T16:45:00Z',
      secret_key: 'docket123abc',
      docket_name: 'Smith v. County CPS'
    },
    {
      id: 102,
      docket: 67890,
      alert_type: 1,
      date_created: '2024-01-08T08:30:00Z',
      date_last_hit: null,
      secret_key: 'docket456def',
      docket_name: 'Jones v. State DCFS'
    }
  ]);

  // New alert form states
  const [newSearchAlertName, setNewSearchAlertName] = useState('');
  const [newSearchAlertQuery, setNewSearchAlertQuery] = useState('');
  const [newSearchAlertRate, setNewSearchAlertRate] = useState<'rt' | 'dly' | 'wly' | 'mly'>('rt');
  const [newDocketId, setNewDocketId] = useState('');
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);

  const violationCount = Object.values(violations).filter(Boolean).length;

  // Suggested alerts based on case violations
  const suggestedAlerts = [
    {
      name: 'Fourth Amendment & CPS',
      query: 'q="Fourth Amendment" AND "child protective services"&type=o',
      reason: 'Your case has Fourth Amendment violations',
      relevant: violations.fourthAmendment
    },
    {
      name: 'Due Process in CPS Cases',
      query: 'q="due process" AND CPS AND removal&type=o',
      reason: 'Your case has due process violations',
      relevant: violations.dueProcess
    },
    {
      name: 'Emergency Removal Standards',
      query: 'q="emergency removal" AND "imminent danger" AND standard&type=o',
      reason: 'Relevant to removal challenges',
      relevant: true
    },
    {
      name: 'Reasonable Efforts Requirement',
      query: 'q="reasonable efforts" AND CPS AND prevention&type=o',
      reason: 'Your case has service failure violations',
      relevant: violations.noReasonableEfforts
    },
    {
      name: 'ADA & CPS Discrimination',
      query: 'q=ADA AND "child protective services" AND discrimination&type=o',
      reason: 'Relevant for disability rights',
      relevant: violations.adaViolation
    },
    {
      name: 'Section 1983 Civil Rights',
      query: 'q="42 U.S.C. 1983" AND CPS&type=o',
      reason: 'Federal civil rights claims',
      relevant: violationCount > 3
    }
  ];

  const rateLabels = {
    rt: { label: 'Real-time', icon: BellRing, color: 'text-red-600' },
    dly: { label: 'Daily', icon: Clock, color: 'text-orange-600' },
    wly: { label: 'Weekly', icon: Clock, color: 'text-blue-600' },
    mly: { label: 'Monthly', icon: Clock, color: 'text-green-600' }
  };

  const handleCreateSearchAlert = async () => {
    if (!newSearchAlertName || !newSearchAlertQuery) {
      toast.error('Please provide alert name and query');
      return;
    }

    setIsCreatingAlert(true);

    // Simulate API call
    setTimeout(() => {
      const newAlert: SearchAlert = {
        id: Date.now(),
        name: newSearchAlertName,
        query: newSearchAlertQuery,
        rate: newSearchAlertRate,
        alert_type: 'o',
        date_created: new Date().toISOString(),
        date_last_hit: null,
        secret_key: Math.random().toString(36).substring(7)
      };

      setSearchAlerts([newAlert, ...searchAlerts]);
      setNewSearchAlertName('');
      setNewSearchAlertQuery('');
      setNewSearchAlertRate('rt');
      setIsCreatingAlert(false);
      toast.success('Search alert created successfully!');
    }, 1000);
  };

  const handleCreateDocketAlert = async () => {
    if (!newDocketId) {
      toast.error('Please provide a docket ID');
      return;
    }

    setIsCreatingAlert(true);

    // Simulate API call
    setTimeout(() => {
      const newAlert: DocketAlert = {
        id: Date.now(),
        docket: parseInt(newDocketId),
        alert_type: 1,
        date_created: new Date().toISOString(),
        date_last_hit: null,
        secret_key: Math.random().toString(36).substring(7),
        docket_name: `Docket #${newDocketId}`
      };

      setDocketAlerts([newAlert, ...docketAlerts]);
      setNewDocketId('');
      setIsCreatingAlert(false);
      toast.success('Docket alert created successfully!');
    }, 1000);
  };

  const handleDeleteSearchAlert = (id: number) => {
    setSearchAlerts(searchAlerts.filter(alert => alert.id !== id));
    toast.success('Alert deleted');
  };

  const handleDeleteDocketAlert = (id: number) => {
    setDocketAlerts(docketAlerts.filter(alert => alert.id !== id));
    toast.success('Docket alert deleted');
  };

  const handleUseSuggestedAlert = (query: string, name: string) => {
    setNewSearchAlertName(name);
    setNewSearchAlertQuery(query);
    toast.success('Alert template loaded! Review and create.');
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isPremium && !isAttorney) {
    return (
      <Card className="p-8 text-center">
        <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl mb-2">Legal Alerts - Premium Feature</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Get real-time notifications about new case law, legal developments, and specific cases relevant to your CPS defense. 
          Set up custom search alerts and track active dockets with email or webhook notifications.
        </p>
        <div className="flex gap-3 justify-center">
          <Button size="lg">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium - $19.99/mo
          </Button>
          <Button size="lg" variant="outline">
            <Crown className="w-4 h-4 mr-2" />
            Attorney Suite - $99/mo
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <BellRing className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl">Legal Alerts</h2>
              <Badge className="bg-blue-600 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                CourtListener Integration
              </Badge>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              Stay updated with real-time notifications about new case law and docket activities. 
              Configure alerts to receive updates via email or webhook when new relevant information is available.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-blue-700">
                <Bell className="w-4 h-4" />
                <span>{searchAlerts.length} Search Alerts</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <FileText className="w-4 h-4" />
                <span>{docketAlerts.length} Docket Alerts</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* API Integration Notice */}
      <Alert className="bg-amber-50 border-amber-200">
        <Settings className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-900">CourtListener API Integration</AlertTitle>
        <AlertDescription className="text-amber-800">
          Legal Alerts use the CourtListener API to monitor case law and dockets. Make sure you've configured 
          your API token in Settings. Alerts can notify you by email or webhook (for advanced integrations).
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Alerts ({searchAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="docket" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Docket Alerts ({docketAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="suggested" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Suggested ({suggestedAlerts.filter(a => a.relevant).length})
          </TabsTrigger>
        </TabsList>

        {/* Search Alerts Tab */}
        <TabsContent value="search" className="space-y-6">
          {/* Create New Search Alert */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-primary" />
              <h3 className="text-lg">Create Search Alert</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Monitor CourtListener for new case law matching your search criteria. You'll be notified when new opinions are published.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Alert Name</label>
                <Input
                  placeholder="e.g., Fourth Amendment CPS Cases"
                  value={newSearchAlertName}
                  onChange={(e) => setNewSearchAlertName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Search Query</label>
                <Input
                  placeholder='q="Fourth Amendment" AND "child protective services"&type=o'
                  value={newSearchAlertQuery}
                  onChange={(e) => setNewSearchAlertQuery(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use CourtListener search syntax. Get query from CourtListener search results.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Alert Frequency</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['rt', 'dly', 'wly', 'mly'] as const).map((rate) => {
                    const rateInfo = rateLabels[rate];
                    const Icon = rateInfo.icon;
                    return (
                      <Button
                        key={rate}
                        variant={newSearchAlertRate === rate ? 'default' : 'outline'}
                        onClick={() => setNewSearchAlertRate(rate)}
                        className="flex flex-col items-center gap-1 h-auto py-3"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs">{rateInfo.label}</span>
                      </Button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Webhook notifications are always sent in real-time regardless of this setting.
                </p>
              </div>

              <Button 
                onClick={handleCreateSearchAlert}
                disabled={isCreatingAlert || !newSearchAlertName || !newSearchAlertQuery}
                className="w-full"
              >
                {isCreatingAlert ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Creating Alert...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Search Alert
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Active Search Alerts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg">Active Search Alerts ({searchAlerts.length})</h3>
              {searchAlerts.length > 0 && (
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              )}
            </div>

            {searchAlerts.length === 0 ? (
              <Card className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No search alerts yet. Create one above!</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {searchAlerts.map((alert) => {
                  const rateInfo = rateLabels[alert.rate];
                  const RateIcon = rateInfo.icon;
                  return (
                    <Card key={alert.id} className="p-5 hover:border-primary transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-2">
                            <Search className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{alert.name}</h4>
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <RateIcon className={`w-3 h-3 ${rateInfo.color}`} />
                                  {rateInfo.label}
                                </Badge>
                                <Badge variant="outline">Opinions</Badge>
                                {alert.date_last_hit && (
                                  <Badge className="bg-green-100 text-green-800 border-green-200">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <div className="bg-muted p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
                                {alert.query}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Created: {formatDate(alert.date_created)}</span>
                                <span>Last Hit: {formatDate(alert.date_last_hit)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteSearchAlert(alert.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Docket Alerts Tab */}
        <TabsContent value="docket" className="space-y-6">
          {/* Create New Docket Alert */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-primary" />
              <h3 className="text-lg">Create Docket Alert</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to a specific court docket to receive real-time notifications whenever new filings or updates are available.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Docket ID or Case Number</label>
                <Input
                  placeholder="Enter CourtListener docket ID (e.g., 12345)"
                  value={newDocketId}
                  onChange={(e) => setNewDocketId(e.target.value)}
                  type="number"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Find docket IDs by searching cases on CourtListener. The ID is in the URL.
                </p>
              </div>

              <Button 
                onClick={handleCreateDocketAlert}
                disabled={isCreatingAlert || !newDocketId}
                className="w-full"
              >
                {isCreatingAlert ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Creating Alert...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Docket Alert
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Active Docket Alerts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg">Active Docket Alerts ({docketAlerts.length})</h3>
            </div>

            {docketAlerts.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No docket alerts yet. Create one above!</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {docketAlerts.map((alert) => (
                  <Card key={alert.id} className="p-5 hover:border-primary transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <Gavel className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">
                              {alert.docket_name || `Docket #${alert.docket}`}
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <BellRing className="w-3 h-3 text-red-600" />
                                Real-time
                              </Badge>
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                Docket ID: {alert.docket}
                              </Badge>
                              {alert.date_last_hit && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Active
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Created: {formatDate(alert.date_created)}</span>
                              <span>Last Hit: {formatDate(alert.date_last_hit)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteDocketAlert(alert.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Info Card */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>About Docket Alerts</AlertTitle>
            <AlertDescription>
              Docket Alerts notify you immediately when new filings, orders, or updates are available for tracked cases. 
              This is useful for monitoring active litigation or following precedent-setting cases.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Suggested Alerts Tab */}
        <TabsContent value="suggested" className="space-y-6">
          <Alert className="bg-purple-50 border-purple-200">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <AlertTitle className="text-purple-900">Smart Alert Suggestions</AlertTitle>
            <AlertDescription className="text-purple-800">
              Based on your case violations and details, we've identified relevant legal topics to monitor. 
              Click "Use Template" to create an alert with pre-configured search terms.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {suggestedAlerts.map((suggestion, idx) => (
              <Card 
                key={idx} 
                className={`p-5 transition-all ${
                  suggestion.relevant 
                    ? 'border-purple-300 bg-purple-50/50' 
                    : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        suggestion.relevant ? 'bg-purple-100' : 'bg-muted'
                      }`}>
                        <Search className={`w-5 h-5 ${
                          suggestion.relevant ? 'text-purple-600' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{suggestion.name}</h4>
                          {suggestion.relevant && (
                            <Badge className="bg-purple-600 text-white">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{suggestion.reason}</p>
                        <div className="bg-muted/50 p-2 rounded text-xs font-mono overflow-x-auto">
                          {suggestion.query}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={suggestion.relevant ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUseSuggestedAlert(suggestion.query, suggestion.name)}
                    disabled={!suggestion.relevant}
                  >
                    Use Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {violationCount === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Violations Identified Yet</AlertTitle>
              <AlertDescription>
                Complete the Violations checker to get personalized alert suggestions based on your specific case issues.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      {/* Settings Footer */}
      <Card className="p-5 bg-muted/50">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium mb-1">Alert Delivery Settings</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Configure how you receive alert notifications. You can receive alerts via email (default) or webhook for advanced integrations.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Email Settings
              </Button>
              {isAttorney && (
                <Button variant="outline" size="sm">
                  <Webhook className="w-4 h-4 mr-2" />
                  Webhook Settings
                </Button>
              )}
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                CourtListener API
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
