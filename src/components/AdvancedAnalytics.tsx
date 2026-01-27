import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Scale,
  Calendar,
  Award,
  AlertTriangle,
  Loader2,
  Info,
  Download,
  Filter
} from 'lucide-react';
import { executeAnalytics, getCPSAnalytics, type AnalyticsQuery } from '../utils/bulk-data-api';
import { toast } from 'sonner@2.0.3';

interface AdvancedAnalyticsProps {
  accessToken: string;
  userState?: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const VIOLATION_TYPES = [
  'Fourth Amendment',
  'Fourteenth Amendment',
  'No Reasonable Efforts',
  'Denied Legal Counsel',
  'ICWA Violations',
  'Timeline Violations',
  'Falsified Reports',
  'Hearsay Evidence'
];

const ANALYSIS_TYPES = [
  { value: 'violation_patterns', label: 'Violation Patterns', icon: AlertTriangle },
  { value: 'court_trends', label: 'Court Trends', icon: Scale },
  { value: 'judge_statistics', label: 'Judge Statistics', icon: Award },
  { value: 'timeline_analysis', label: 'Timeline Analysis', icon: Calendar },
  { value: 'citation_impact', label: 'Citation Impact', icon: TrendingUp },
];

export function AdvancedAnalytics({ accessToken, userState }: AdvancedAnalyticsProps) {
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<string>('violation_patterns');
  const [selectedState, setSelectedState] = useState(userState || 'all');
  const [cpsAnalytics, setCpsAnalytics] = useState<any>(null);
  const [customResults, setCustomResults] = useState<any>(null);
  
  const [filters, setFilters] = useState({
    courtId: '',
    dateStart: '',
    dateEnd: '',
    violationType: '',
  });

  useEffect(() => {
    loadCPSAnalytics();
  }, [selectedState]);

  const loadCPSAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getCPSAnalytics(
        accessToken, 
        selectedState === 'all' ? undefined : selectedState
      );
      setCpsAnalytics(data);
    } catch (error) {
      console.error('Error loading CPS analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const runCustomAnalysis = async () => {
    try {
      setLoading(true);
      
      const query: AnalyticsQuery = {
        type: analysisType as any,
        filters: {
          courtId: filters.courtId || undefined,
          dateStart: filters.dateStart || undefined,
          dateEnd: filters.dateEnd || undefined,
          violationType: filters.violationType || undefined,
        },
        limit: 100,
      };

      const results = await executeAnalytics(accessToken, query);
      setCustomResults(results);
      toast.success('Analysis complete');
    } catch (error) {
      console.error('Error running analysis:', error);
      toast.error('Failed to run analysis');
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    const data = customResults || cpsAnalytics;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cps-analytics-${Date.now()}.json`;
    link.click();
    toast.success('Analytics exported');
  };

  if (loading && !cpsAnalytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Advanced CPS Case Analytics</AlertTitle>
        <AlertDescription>
          Powered by bulk data analysis of thousands of CPS cases. Identify patterns, trends, 
          and statistical insights to strengthen your defense strategy.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              <SelectItem value="California">California</SelectItem>
              <SelectItem value="Texas">Texas</SelectItem>
              <SelectItem value="New York">New York</SelectItem>
              <SelectItem value="Florida">Florida</SelectItem>
              <SelectItem value="Illinois">Illinois</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={loadCPSAnalytics} disabled={loading} variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Apply Filter
          </Button>
        </div>

        <Button onClick={exportResults} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="courts">Courts</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="custom">Custom Query</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {cpsAnalytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-3xl font-bold">
                        {cpsAnalytics.successRates?.[0]?.rate || 0}%
                      </p>
                      <p className="text-sm text-muted-foreground">Average Success Rate</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      <p className="text-3xl font-bold">
                        {cpsAnalytics.violationPatterns?.length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Common Violations</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Scale className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-3xl font-bold">
                        {cpsAnalytics.courtTrends?.length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Active Courts</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-3xl font-bold">
                        {cpsAnalytics.timelineStats?.avgDuration || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Case Days</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Most Common Issues in CPS Cases</CardTitle>
                  <CardDescription>
                    Top legal issues identified across analyzed cases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cpsAnalytics.commonIssues?.slice(0, 10).map((issue: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="font-medium">{issue.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary"
                                style={{ width: `${issue.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-16 text-right">
                              {issue.percentage}%
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-sm font-semibold">{issue.count}</p>
                          <p className="text-xs text-muted-foreground">cases</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="violations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Violation Pattern Analysis</CardTitle>
              <CardDescription>
                Distribution of constitutional and procedural violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={cpsAnalytics?.violationPatterns || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="type"
                  >
                    {(cpsAnalytics?.violationPatterns || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Violation Success Rates</CardTitle>
              <CardDescription>
                Which violations lead to favorable outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={cpsAnalytics?.violationPatterns || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="successRate" fill="#3b82f6" name="Success Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Court Performance Trends</CardTitle>
              <CardDescription>
                Case outcomes by court over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={cpsAnalytics?.courtTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="favorableOutcomes" stroke="#10b981" name="Favorable" />
                  <Line type="monotone" dataKey="unfavorableOutcomes" stroke="#ef4444" name="Unfavorable" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Court Statistics</CardTitle>
              <CardDescription>
                Comparative analysis across jurisdictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cpsAnalytics?.courtTrends?.slice(0, 10).map((court: any, index: number) => (
                  <div key={index} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{court.name}</h3>
                      <Badge>{court.totalCases} cases</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-semibold text-green-600">{court.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Duration</p>
                        <p className="font-semibold">{court.avgDuration} days</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Trend</p>
                        <p className="font-semibold flex items-center gap-1">
                          {court.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          {court.trend}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Timeline Analysis</CardTitle>
              <CardDescription>
                How case duration affects outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={cpsAnalytics?.timelineStats?.durationBuckets || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="favorable" fill="#10b981" name="Favorable Outcomes" />
                  <Bar dataKey="unfavorable" fill="#ef4444" name="Unfavorable Outcomes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Analytics Query</CardTitle>
              <CardDescription>
                Run advanced SQL-powered analysis on bulk data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Analysis Type</label>
                  <Select value={analysisType} onValueChange={setAnalysisType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ANALYSIS_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Violation Type</label>
                  <Select value={filters.violationType || "all"} onValueChange={(v) => setFilters({ ...filters, violationType: v === "all" ? "" : v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Violations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Violations</SelectItem>
                      {VIOLATION_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date From</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-md"
                    value={filters.dateStart}
                    onChange={(e) => setFilters({ ...filters, dateStart: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date To</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-md"
                    value={filters.dateEnd}
                    onChange={(e) => setFilters({ ...filters, dateEnd: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={runCustomAnalysis} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Analysis...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Run Analysis
                  </>
                )}
              </Button>

              {customResults && (
                <div className="mt-6">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Analysis Complete</AlertTitle>
                    <AlertDescription>
                      Found {customResults.summary.totalRecords} matching records
                    </AlertDescription>
                  </Alert>

                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold">Key Insights:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {customResults.summary.insights.map((insight: string, i: number) => (
                        <li key={i} className="text-sm">{insight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
