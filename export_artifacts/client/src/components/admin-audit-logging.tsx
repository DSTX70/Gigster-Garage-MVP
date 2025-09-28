import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Calendar as CalendarIcon,
  AlertTriangle, 
  CheckCircle,
  Info,
  Shield,
  User,
  Database,
  Settings,
  Clock,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AuditEvent {
  id: string;
  timestamp: string;
  source: 'system' | 'user' | 'api' | 'sso' | 'permissions' | 'webhook' | 'backup' | 'ai';
  category: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system_config' | 'security' | 'compliance' | 'user_action';
  action: string;
  actor: {
    id?: string;
    type: 'user' | 'system' | 'api' | 'service';
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
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    retentionPeriod: number;
    encryptionRequired: boolean;
  };
}

interface AuditFilters {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  source: string[];
  category: string[];
  action: string;
  actor: string;
  outcome: string[];
  severity: string[];
  searchTerm: string;
}

export function AdminAuditLogging() {
  const [filters, setFilters] = useState<AuditFilters>({
    dateRange: { from: null, to: null },
    source: [],
    category: [],
    action: '',
    actor: '',
    outcome: [],
    severity: [],
    searchTerm: ''
  });
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Query audit events
  const { data: auditEvents = [], isLoading } = useQuery<AuditEvent[]>({
    queryKey: ["/api/admin/audit", filters],
  });

  // Query audit statistics
  const { data: auditStats } = useQuery({
    queryKey: ["/api/admin/audit/stats"],
  });

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'system': return <Settings className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      case 'api': return <Database className="h-4 w-4" />;
      case 'sso': return <Shield className="h-4 w-4" />;
      case 'permissions': return <Shield className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failure': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'partial': return <Info className="h-4 w-4 text-yellow-600" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'authentication': return 'bg-blue-100 text-blue-800';
      case 'authorization': return 'bg-purple-100 text-purple-800';
      case 'data_access': return 'bg-green-100 text-green-800';
      case 'data_modification': return 'bg-yellow-100 text-yellow-800';
      case 'system_config': return 'bg-indigo-100 text-indigo-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'compliance': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportAuditLog = () => {
    // Implementation would export filtered audit log
    console.log('Exporting audit log with filters:', filters);
  };

  const clearFilters = () => {
    setFilters({
      dateRange: { from: null, to: null },
      source: [],
      category: [],
      action: '',
      actor: '',
      outcome: [],
      severity: [],
      searchTerm: ''
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="admin-audit-logging">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-3" size={32} />
            Audit Logging
          </h1>
          <p className="text-gray-600 mt-1">Monitor system activities and compliance</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-toggle-filters"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            onClick={exportAuditLog}
            data-testid="button-export-log"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(auditStats as any)?.totalEvents || auditEvents.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {auditEvents.filter(e => e.category === 'security').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Failed Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {auditEvents.filter(e => e.outcome === 'failure').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Critical Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {auditEvents.filter(e => e.severity === 'critical').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filter Audit Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search events..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-9"
                    data-testid="input-search-events"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-sm font-medium">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full mt-1 justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? (
                        filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                            {format(filters.dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(filters.dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={filters.dateRange.from || undefined}
                      selected={{
                        from: filters.dateRange.from || undefined,
                        to: filters.dateRange.to || undefined,
                      }}
                      onSelect={(range) => setFilters(prev => ({
                        ...prev,
                        dateRange: { from: range?.from || null, to: range?.to || null }
                      }))}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Source */}
              <div>
                <label className="text-sm font-medium">Source</label>
                <Select
                  value={filters.source[0] || ''}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, source: value ? [value] : [] }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="sso">SSO</SelectItem>
                    <SelectItem value="permissions">Permissions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={filters.category[0] || ''}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value ? [value] : [] }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="authentication">Authentication</SelectItem>
                    <SelectItem value="authorization">Authorization</SelectItem>
                    <SelectItem value="data_access">Data Access</SelectItem>
                    <SelectItem value="data_modification">Data Modification</SelectItem>
                    <SelectItem value="system_config">System Config</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Outcome */}
              <div>
                <label className="text-sm font-medium">Outcome</label>
                <Select
                  value={filters.outcome[0] || ''}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, outcome: value ? [value] : [] }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All outcomes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failure">Failure</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters">
                Clear Filters
              </Button>
              <Button data-testid="button-apply-filters">
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Events List */}
      <div className="flex space-x-6">
        {/* Events List */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Audit Events ({auditEvents.length})</span>
                <Badge variant="outline">{isLoading ? 'Loading...' : 'Live'}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : auditEvents.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No audit events found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {auditEvents.map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "flex items-start space-x-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                          selectedEvent?.id === event.id && "bg-blue-50 border-l-4 border-blue-500"
                        )}
                        onClick={() => setSelectedEvent(event)}
                        data-testid={`audit-event-${event.id}`}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getOutcomeIcon(event.outcome)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {getSourceIcon(event.source)}
                            <Badge className={getCategoryColor(event.category)} variant="secondary">
                              {event.category.replace('_', ' ')}
                            </Badge>
                            <Badge className={getSeverityColor(event.severity)}>
                              {event.severity}
                            </Badge>
                          </div>
                          
                          <p className="font-medium text-sm">{event.action}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{event.details.description}</p>
                          
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <span>{event.actor.name} • {event.actor.ipAddress}</span>
                            <span>{new Date(event.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Event Details Panel */}
        {selectedEvent && (
          <Card className="w-96">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Event Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                  data-testid="button-close-details"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">General Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Timestamp:</span>
                    <span>{new Date(selectedEvent.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Source:</span>
                    <Badge variant="outline">{selectedEvent.source}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <Badge className={getCategoryColor(selectedEvent.category)}>
                      {selectedEvent.category}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Outcome:</span>
                    <div className="flex items-center space-x-1">
                      {getOutcomeIcon(selectedEvent.outcome)}
                      <span>{selectedEvent.outcome}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Severity:</span>
                    <Badge className={getSeverityColor(selectedEvent.severity)}>
                      {selectedEvent.severity}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Actor</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span>{selectedEvent.actor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <Badge variant="outline">{selectedEvent.actor.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">IP Address:</span>
                    <span className="font-mono">{selectedEvent.actor.ipAddress}</span>
                  </div>
                  {selectedEvent.actor.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span>{selectedEvent.actor.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Resource</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <Badge variant="outline">{selectedEvent.resource.type}</Badge>
                  </div>
                  {selectedEvent.resource.name && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span>{selectedEvent.resource.name}</span>
                    </div>
                  )}
                  {selectedEvent.resource.id && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">ID:</span>
                      <span className="font-mono text-xs">{selectedEvent.resource.id}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Details</h4>
                <div className="space-y-2 text-sm">
                  <p>{selectedEvent.details.description}</p>
                  
                  {selectedEvent.details.oldValue && (
                    <div>
                      <span className="text-gray-500 text-xs">Old Value:</span>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(selectedEvent.details.oldValue, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {selectedEvent.details.newValue && (
                    <div>
                      <span className="text-gray-500 text-xs">New Value:</span>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(selectedEvent.details.newValue, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Compliance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Classification:</span>
                    <Badge variant="outline">{selectedEvent.compliance.dataClassification}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Retention:</span>
                    <span>{selectedEvent.compliance.retentionPeriod} days</span>
                  </div>
                  {selectedEvent.compliance.regulations.length > 0 && (
                    <div>
                      <span className="text-gray-500">Regulations:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedEvent.compliance.regulations.map((reg) => (
                          <Badge key={reg} variant="outline" className="text-xs">
                            {reg}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}