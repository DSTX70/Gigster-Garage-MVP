import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Download, 
  Filter, 
  Search, 
  Calendar as CalendarIcon,
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Activity,
  Database,
  Lock,
  Globe,
  Building,
  AlertCircle,
  TrendingUp,
  BarChart3,
  FileCheck,
  Archive,
  Eye,
  Settings,
  RefreshCw,
  Zap
} from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AuditEvent {
  id: string;
  timestamp: string;
  source: string;
  category: string;
  action: string;
  actor: {
    id?: string;
    type: string;
    name: string;
    email?: string;
    ipAddress: string;
    userAgent?: string;
    sessionId?: string;
  };
  resource: {
    type: string;
    id?: string;
    name?: string;
    attributes?: Record<string, any>;
  };
  outcome: 'success' | 'failure' | 'partial';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: {
    description: string;
    oldValue?: any;
    newValue?: any;
    reason?: string;
    errorMessage?: string;
    metadata?: Record<string, any>;
  };
  compliance: {
    regulations: string[];
    dataClassification: string;
    retentionPeriod: number;
    encryptionRequired: boolean;
  };
  context: any;
}

interface AuditStatistics {
  totalEvents: number;
  overview: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
  };
  bySource: Record<string, number>;
  byCategory: Record<string, number>;
  byOutcome: Record<string, number>;
  bySeverity: Record<string, number>;
  securityEvents: {
    total: number;
    critical: number;
    failed: number;
  };
  complianceEvents: {
    gdpr: number;
    sox: number;
    hipaa: number;
    pciDss: number;
  };
  dataClassification: {
    public: number;
    internal: number;
    confidential: number;
    restricted: number;
  };
  topActors: { name: string; count: number }[];
  topResources: { type: string; count: number }[];
  trends: {
    eventsPerDay: number;
    securityIncidents: number;
    failureRate: number;
  };
}

interface ComplianceReport {
  id: string;
  title: string;
  regulation: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    securityEvents: number;
    dataAccessEvents: number;
    configurationChanges: number;
  };
  generatedAt: string;
  generatedBy: string;
  status: string;
}

export default function AuditLoggingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('events');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    source: '',
    category: '',
    outcome: '',
    severity: '',
    startDate: '',
    endDate: ''
  });
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showComplianceDialog, setShowComplianceDialog] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState('');

  const { data: events = [], isLoading } = useQuery<{ events: AuditEvent[]; total: number; hasMore: boolean }>({
    queryKey: ['/api/audit/events', filters, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (filters.source) params.append('source', filters.source);
      if (filters.category) params.append('category', filters.category);
      if (filters.outcome) params.append('outcome', filters.outcome);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await apiRequest('GET', `/api/audit/events?${params.toString()}`);
      return response.json();
    }
  });

  const { data: statistics } = useQuery<AuditStatistics>({
    queryKey: ['/api/audit/statistics']
  });

  const { data: complianceReports = [] } = useQuery<ComplianceReport[]>({
    queryKey: ['/api/audit/compliance-reports']
  });

  const exportMutation = useMutation({
    mutationFn: async (format: string) => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (filters.source) params.append('source', filters.source);
      if (filters.category) params.append('category', filters.category);
      if (filters.outcome) params.append('outcome', filters.outcome);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('format', format);
      
      const response = await apiRequest('POST', `/api/audit/export?${params.toString()}`, {});
      return response.json();
    },
    onSuccess: (data) => {
      // Create download link
      const blob = new Blob([data.data], { type: data.contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setShowExportDialog(false);
      toast({
        title: "Export Complete",
        description: `Audit data exported as ${data.filename}`,
      });
    }
  });

  const generateComplianceReportMutation = useMutation({
    mutationFn: async ({ regulation, startDate, endDate }: { regulation: string; startDate: string; endDate: string }) => {
      const response = await apiRequest('POST', '/api/audit/compliance-reports', {
        regulation,
        startDate,
        endDate
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/audit/compliance-reports'] });
      setShowComplianceDialog(false);
      toast({
        title: "Compliance Report Generated",
        description: "The compliance report has been generated successfully",
      });
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success': return CheckCircle;
      case 'failure': return XCircle;
      case 'partial': return AlertCircle;
      default: return Activity;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'success': return 'text-green-600';
      case 'failure': return 'text-red-600';
      case 'partial': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'user': return User;
      case 'api': return Zap;
      case 'system': return Settings;
      case 'sso': return Shield;
      case 'permissions': return Lock;
      default: return Activity;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return Shield;
      case 'authorization': return Lock;
      case 'data_access': return Eye;
      case 'data_modification': return Database;
      case 'system_config': return Settings;
      case 'security': return AlertTriangle;
      default: return Activity;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50">
      <AppHeader />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Audit Logging & Compliance</h1>
            <p className="text-gray-600">Complete activity tracking and compliance reporting</p>
          </div>
          <div className="flex items-center space-x-3">
            {statistics && (
              <>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {statistics.totalEvents.toLocaleString()} events
                </Badge>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {statistics.securityEvents.critical} critical
                </Badge>
              </>
            )}
            <Button 
              onClick={() => setShowComplianceDialog(true)}
              variant="outline"
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button 
              onClick={() => setShowExportDialog(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="events">Audit Events</TabsTrigger>
            <TabsTrigger value="statistics">Analytics</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Audit Events Tab */}
          <TabsContent value="events" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-events"
                      />
                    </div>
                  </div>
                  <Select value={filters.source} onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Sources</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="sso">SSO</SelectItem>
                      <SelectItem value="permissions">Permissions</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="authentication">Authentication</SelectItem>
                      <SelectItem value="authorization">Authorization</SelectItem>
                      <SelectItem value="data_access">Data Access</SelectItem>
                      <SelectItem value="data_modification">Data Modification</SelectItem>
                      <SelectItem value="system_config">System Config</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.outcome} onValueChange={(value) => setFilters(prev => ({ ...prev, outcome: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Outcomes</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failure">Failure</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.severity} onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Severities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Events List */}
            <div className="space-y-4">
              {isLoading ? (
                <Card className="p-12 text-center">
                  <RefreshCw className="h-8 w-8 mx-auto mb-4 text-gray-400 animate-spin" />
                  <p className="text-gray-500">Loading audit events...</p>
                </Card>
              ) : events.events?.length === 0 ? (
                <Card className="p-12 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Audit Events</h3>
                  <p className="text-gray-500">No events match your current filters</p>
                </Card>
              ) : (
                events.events?.map((event) => {
                  const OutcomeIcon = getOutcomeIcon(event.outcome);
                  const SourceIcon = getSourceIcon(event.source);
                  const CategoryIcon = getCategoryIcon(event.category);
                  
                  return (
                    <Card key={event.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="flex items-center space-x-2">
                              <OutcomeIcon className={`h-5 w-5 ${getOutcomeColor(event.outcome)}`} />
                              <SourceIcon className="h-4 w-4 text-gray-500" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-semibold text-lg">{event.action}</h4>
                                <Badge variant="outline" className={getSeverityColor(event.severity)}>
                                  {event.severity}
                                </Badge>
                                <Badge variant="secondary">
                                  {event.category}
                                </Badge>
                              </div>
                              
                              <p className="text-gray-600 mb-3">{event.details.description}</p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <Label className="text-xs text-gray-500">Actor</Label>
                                  <div className="font-medium">{event.actor.name}</div>
                                  <div className="text-xs text-gray-500">{event.actor.type}</div>
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-500">Resource</Label>
                                  <div className="font-medium">{event.resource.type}</div>
                                  {event.resource.name && (
                                    <div className="text-xs text-gray-500">{event.resource.name}</div>
                                  )}
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-500">Compliance</Label>
                                  <div className="font-medium">{event.compliance.dataClassification}</div>
                                  {event.compliance.regulations.length > 0 && (
                                    <div className="text-xs text-gray-500">
                                      {event.compliance.regulations.join(', ')}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-500">Timestamp</Label>
                                  <div className="font-medium">
                                    {format(new Date(event.timestamp), 'MMM d, HH:mm:ss')}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {event.actor.ipAddress}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Load More */}
            {events.hasMore && (
              <div className="text-center">
                <Button variant="outline">
                  Load More Events
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            {statistics && (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-teal-600 mb-2">
                        {statistics.overview.last24Hours.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Events (24h)</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {statistics.overview.last7Days.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Events (7d)</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        {statistics.securityEvents.critical}
                      </div>
                      <div className="text-sm text-gray-600">Critical Security Events</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {statistics.trends.failureRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Failure Rate</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts and Breakdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* By Source */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Events by Source</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(statistics.bySource).map(([source, count]) => (
                          <div key={source} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {/* {getSourceIcon(source)({ className: "h-4 w-4 text-gray-500" })} */}
                              <span className="capitalize">{source}</span>
                            </div>
                            <span className="font-medium">{count.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* By Category */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Events by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(statistics.byCategory).map(([category, count]) => (
                          <div key={category} className="flex items-center justify-between">
                            <span className="capitalize">{category.replace('_', ' ')}</span>
                            <span className="font-medium">{count.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Compliance Events */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Compliance Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>GDPR</span>
                          <span className="font-medium">{statistics.complianceEvents.gdpr}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>SOX</span>
                          <span className="font-medium">{statistics.complianceEvents.sox}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>HIPAA</span>
                          <span className="font-medium">{statistics.complianceEvents.hipaa}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>PCI-DSS</span>
                          <span className="font-medium">{statistics.complianceEvents.pciDss}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Data Classification */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Data Classification</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(statistics.dataClassification).map(([classification, count]) => (
                          <div key={classification} className="flex items-center justify-between">
                            <span className="capitalize">{classification}</span>
                            <span className="font-medium">{count.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Actors and Resources */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Actors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {statistics.topActors.map((actor, index) => (
                          <div key={actor.name} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">#{index + 1}</span>
                              <span>{actor.name}</span>
                            </div>
                            <span className="font-medium">{actor.count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {statistics.topResources.map((resource, index) => (
                          <div key={resource.type} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">#{index + 1}</span>
                              <span className="capitalize">{resource.type}</span>
                            </div>
                            <span className="font-medium">{resource.count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Compliance Reports Tab */}
          <TabsContent value="compliance" className="space-y-6">
            {complianceReports.length === 0 ? (
              <Card className="p-12 text-center">
                <FileCheck className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Compliance Reports</h3>
                <p className="text-gray-500 mb-6">Generate compliance reports for regulatory requirements</p>
                <Button 
                  onClick={() => setShowComplianceDialog(true)}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Generate Your First Report
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6">
                {complianceReports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{report.title}</CardTitle>
                          <CardDescription>
                            {format(new Date(report.period.start), 'MMM d, yyyy')} - {format(new Date(report.period.end), 'MMM d, yyyy')}
                          </CardDescription>
                        </div>
                        <Badge variant={report.status === 'approved' ? 'default' : 'secondary'}>
                          {report.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <Label className="text-sm text-gray-600">Total Events</Label>
                          <div className="text-lg font-semibold">{report.summary.totalEvents}</div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Successful</Label>
                          <div className="text-lg font-semibold text-green-600">{report.summary.successfulEvents}</div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Failed</Label>
                          <div className="text-lg font-semibold text-red-600">{report.summary.failedEvents}</div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Security Events</Label>
                          <div className="text-lg font-semibold text-orange-600">{report.summary.securityEvents}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Generated {format(new Date(report.generatedAt), 'MMM d, yyyy HH:mm')}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Settings</CardTitle>
                <CardDescription>Configure audit logging and retention policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-3 block">Retention Policies</Label>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">GDPR Compliance</h4>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">EU GDPR data retention requirements</p>
                      <div className="text-sm text-gray-500">Retention: 7 years • Encryption: Required</div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Security Events</h4>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Security and authentication events retention</p>
                      <div className="text-sm text-gray-500">Retention: 6 years • Encryption: Required</div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">General System Events</h4>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Standard system operation events</p>
                      <div className="text-sm text-gray-500">Retention: 1 year • Archive after: 90 days</div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">Export Settings</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-personal">Include Personal Data in Exports</Label>
                      <input type="checkbox" id="include-personal" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="encrypt-exports">Encrypt Exported Files</Label>
                      <input type="checkbox" id="encrypt-exports" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Audit Data</DialogTitle>
              <DialogDescription>
                Export filtered audit events in your preferred format
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Export Format</Label>
                <Select onValueChange={(format) => exportMutation.mutate(format)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-gray-500">
                Current filters will be applied to the export. 
                {events.total && ` Approximately ${events.total} events will be exported.`}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Compliance Report Dialog */}
        <Dialog open={showComplianceDialog} onOpenChange={setShowComplianceDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Compliance Report</DialogTitle>
              <DialogDescription>
                Create a compliance report for regulatory requirements
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Regulation</Label>
                <Select value={selectedRegulation} onValueChange={setSelectedRegulation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select regulation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GDPR">GDPR (General Data Protection Regulation)</SelectItem>
                    <SelectItem value="SOX">SOX (Sarbanes-Oxley Act)</SelectItem>
                    <SelectItem value="HIPAA">HIPAA (Health Insurance Portability)</SelectItem>
                    <SelectItem value="PCI-DSS">PCI-DSS (Payment Card Industry)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowComplianceDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    const startDate = '2024-01-01';
                    const endDate = '2024-12-31';
                    generateComplianceReportMutation.mutate({ 
                      regulation: selectedRegulation, 
                      startDate, 
                      endDate 
                    });
                  }}
                  disabled={!selectedRegulation || generateComplianceReportMutation.isPending}
                  className="bg-teal-600 hover:bg-teal-700"
                  data-testid="button-generate-report"
                >
                  Generate Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}