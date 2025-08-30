import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { BulkTable } from "@/components/BulkTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, FolderOpen, Users, Download, Upload, Edit3, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Task, Project, Client } from "@shared/schema";

export default function BulkOperations() {
  const [activeTab, setActiveTab] = useState("tasks");

  // Fetch data
  const { data: tasks = [], isLoading: tasksLoading, refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: projects = [], isLoading: projectsLoading, refetch: refetchProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: clients = [], isLoading: clientsLoading, refetch: refetchClients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Task table configuration
  const taskColumns = [
    {
      key: 'title',
      title: 'Title',
      sortable: true
    },
    {
      key: 'description',
      title: 'Description',
      render: (value: string) => value ? (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      ) : '-'
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <Badge variant={
          value === 'done' ? 'default' :
          value === 'in_progress' ? 'secondary' :
          value === 'review' ? 'outline' : 'secondary'
        }>
          {value.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (value: string) => (
        <Badge variant={
          value === 'urgent' ? 'destructive' :
          value === 'high' ? 'default' :
          value === 'medium' ? 'outline' : 'secondary'
        }>
          {value}
        </Badge>
      )
    },
    {
      key: 'assignedToId',
      title: 'Assigned To',
      render: (value: string) => value ? (
        <Badge variant="outline">{value}</Badge>
      ) : '-'
    },
    {
      key: 'dueDate',
      title: 'Due Date',
      render: (value: string) => value ? format(new Date(value), 'MMM dd, yyyy') : '-'
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy')
    }
  ];

  // Project table configuration
  const projectColumns = [
    {
      key: 'name',
      title: 'Name',
      sortable: true
    },
    {
      key: 'description',
      title: 'Description',
      render: (value: string) => value ? (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      ) : '-'
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <Badge variant={
          value === 'active' ? 'default' :
          value === 'completed' ? 'secondary' :
          value === 'on_hold' ? 'outline' : 'secondary'
        }>
          {value.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy')
    },
    {
      key: 'updatedAt',
      title: 'Updated',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy')
    }
  ];

  // Client table configuration
  const clientColumns = [
    {
      key: 'name',
      title: 'Name',
      sortable: true
    },
    {
      key: 'email',
      title: 'Email',
      render: (value: string) => value ? (
        <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
          {value}
        </a>
      ) : '-'
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (value: string) => value || '-'
    },
    {
      key: 'company',
      title: 'Company',
      render: (value: string) => value || '-'
    },
    {
      key: 'website',
      title: 'Website',
      render: (value: string) => value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {value}
        </a>
      ) : '-'
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy')
    }
  ];

  // Statistics
  const stats = {
    tasks: {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'done').length,
      pending: tasks.filter(t => t.status !== 'done').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length
    },
    projects: {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      onHold: projects.filter(p => p.status === 'on_hold').length
    },
    clients: {
      total: clients.length,
      withEmail: clients.filter(c => c.email).length,
      withPhone: clients.filter(c => c.phone).length,
      withWebsite: clients.filter(c => c.website).length
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bulk Operations</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Manage multiple items at once with bulk actions, CSV import/export, and batch processing
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <FileText className="w-3 h-3" />
                CSV Support
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Edit3 className="w-3 h-3" />
                Bulk Edit
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Trash2 className="w-3 h-3" />
                Mass Delete
              </Badge>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Tasks Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Total: <Badge variant="outline">{stats.tasks.total}</Badge></div>
                <div>Pending: <Badge variant="secondary">{stats.tasks.pending}</Badge></div>
                <div>Completed: <Badge variant="default">{stats.tasks.completed}</Badge></div>
                <div>Overdue: <Badge variant="destructive">{stats.tasks.overdue}</Badge></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-green-600" />
                Projects Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Total: <Badge variant="outline">{stats.projects.total}</Badge></div>
                <div>Active: <Badge variant="default">{stats.projects.active}</Badge></div>
                <div>Completed: <Badge variant="secondary">{stats.projects.completed}</Badge></div>
                <div>On Hold: <Badge variant="outline">{stats.projects.onHold}</Badge></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Clients Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Total: <Badge variant="outline">{stats.clients.total}</Badge></div>
                <div>With Email: <Badge variant="secondary">{stats.clients.withEmail}</Badge></div>
                <div>With Phone: <Badge variant="outline">{stats.clients.withPhone}</Badge></div>
                <div>With Website: <Badge variant="outline">{stats.clients.withWebsite}</Badge></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Operations Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Tasks ({tasks.length})
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Projects ({projects.length})
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Clients ({clients.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <BulkTable
              entityType="tasks"
              title="Task Management"
              items={tasks}
              columns={taskColumns}
              onRefresh={() => refetchTasks()}
              loading={tasksLoading}
            />
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <BulkTable
              entityType="projects"
              title="Project Management"
              items={projects}
              columns={projectColumns}
              onRefresh={() => refetchProjects()}
              loading={projectsLoading}
            />
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <BulkTable
              entityType="clients"
              title="Client Management"
              items={clients}
              columns={clientColumns}
              onRefresh={() => refetchClients()}
              loading={clientsLoading}
            />
          </TabsContent>
        </Tabs>

        {/* Feature Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Bulk Operations Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  Mass Actions
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Select multiple items with checkboxes</li>
                  <li>• Bulk edit properties like status and priority</li>
                  <li>• Mass delete with confirmation</li>
                  <li>• Progress tracking for batch operations</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Download className="w-4 h-4 text-green-600" />
                  Data Export
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Export to CSV or JSON format</li>
                  <li>• Export all items or selected items</li>
                  <li>• Automatic file download</li>
                  <li>• Structured data with headers</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-purple-600" />
                  Data Import
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Import from CSV files</li>
                  <li>• Automatic data validation</li>
                  <li>• Error handling and reporting</li>
                  <li>• Progress tracking for imports</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}