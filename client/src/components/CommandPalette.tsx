import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Clock,
  FileText,
  Users,
  Folder,
  Mail,
  Plus,
  Play,
  Pause,
  DollarSign,
  FileSignature,
  Home,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Zap,
  Calendar,
  Archive,
  Bot,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Task, Project, Client, Invoice, TimeLog } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface RecentPage {
  title: string;
  url: string;
  iconName: string; // Store icon identifier instead of React node
  timestamp: number;
}

// Icon mapping for rehydration
const iconMap: Record<string, React.ReactNode> = {
  Clock: <Clock className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Folder: <Folder className="h-4 w-4" />,
  Plus: <Plus className="h-4 w-4" />,
  FileSignature: <FileSignature className="h-4 w-4" />,
  Home: <Home className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
  DollarSign: <DollarSign className="h-4 w-4" />,
  Archive: <Archive className="h-4 w-4" />,
  Zap: <Zap className="h-4 w-4" />,
  Bot: <Bot className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
};

interface SearchResult {
  id: string;
  type: "task" | "project" | "client" | "invoice";
  title: string;
  description?: string;
  url: string;
  metadata?: {
    status?: string;
    priority?: string;
    dueDate?: string;
  };
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);

  // Fetch all data for search
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: open,
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: open,
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    enabled: open,
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
    enabled: open,
  });

  const { data: activeTimer } = useQuery<TimeLog | null>({
    queryKey: ["/api/timelogs/active"],
    enabled: open,
  });

  // Load recent pages from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recent-pages");
    if (stored) {
      try {
        setRecentPages(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse recent pages", e);
      }
    }
  }, [open]);

  // Save page visit
  const savePageVisit = useCallback((title: string, url: string, iconName: string) => {
    setRecentPages((prev) => {
      const newPages = [
        { title, url, iconName, timestamp: Date.now() },
        ...prev.filter((p) => p.url !== url),
      ].slice(0, 10);
      localStorage.setItem("recent-pages", JSON.stringify(newPages));
      return newPages;
    });
  }, []);

  // Toggle command palette with Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Start timer mutation
  const startTimerMutation = useMutation({
    mutationFn: async (description: string) => {
      return apiRequest("POST", "/api/timelogs/start", { description });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timelogs/active"] });
      toast({
        title: "Timer started",
        description: "Your work session has begun",
      });
      setOpen(false);
    },
  });

  // Stop timer mutation
  const stopTimerMutation = useMutation({
    mutationFn: async (timeLogId: string) => {
      return apiRequest("POST", "/api/timelogs/stop", { timeLogId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timelogs/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timelogs"] });
      toast({
        title: "Timer stopped",
        description: "Your work session has been saved",
      });
      setOpen(false);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setOpen(false);
    },
  });

  // Filter search results
  const filteredTasks = search
    ? tasks
        .filter((task) =>
          task.title.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const filteredProjects = search
    ? projects
        .filter((project) =>
          project.name.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const filteredClients = search
    ? clients
        .filter((client) =>
          client.name.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const filteredInvoices = search
    ? invoices
        .filter((invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 5)
    : [];

  // Quick actions
  const quickActions = [
    {
      icon: <Plus className="h-4 w-4" />,
      label: "Create Task",
      action: () => {
        savePageVisit("Create Task", "/tasks", "Plus");
        navigate("/tasks");
        setOpen(false);
      },
      shortcut: "N",
    },
    {
      icon: <Folder className="h-4 w-4" />,
      label: "New Project",
      action: () => {
        navigate("/");
        setOpen(false);
      },
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: "Create Invoice",
      action: () => {
        savePageVisit("Create Invoice", "/create-invoice", "FileText");
        navigate("/create-invoice");
        setOpen(false);
      },
    },
    {
      icon: <FileSignature className="h-4 w-4" />,
      label: "Create Proposal",
      action: () => {
        savePageVisit("Create Proposal", "/create-proposal", "FileSignature");
        navigate("/create-proposal");
        setOpen(false);
      },
    },
    {
      icon: activeTimer ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />,
      label: activeTimer ? "Stop Timer" : "Start Timer",
      action: () => {
        if (activeTimer) {
          stopTimerMutation.mutate(activeTimer.id);
        } else {
          startTimerMutation.mutate("Working");
        }
      },
      shortcut: "T",
    },
  ];

  // Navigation shortcuts
  const navigationShortcuts = [
    {
      iconName: "Home",
      label: "Dashboard",
      url: "/",
    },
    {
      iconName: "Clock",
      label: "Tasks",
      url: "/tasks",
    },
    {
      iconName: "BarChart3",
      label: "Productivity",
      url: "/productivity",
    },
    {
      iconName: "FileText",
      label: "Invoices",
      url: "/invoices",
    },
    {
      iconName: "Users",
      label: "Clients",
      url: "/clients",
    },
    {
      iconName: "DollarSign",
      label: "Payments",
      url: "/payments",
    },
    {
      iconName: "Archive",
      label: "Filing Cabinet",
      url: "/filing-cabinet",
    },
    {
      iconName: "Zap",
      label: "Workflow Automation",
      url: "/workflow-automation",
    },
  ];

  if (isAdmin) {
    navigationShortcuts.push(
      {
        iconName: "Bot",
        label: "Agent Management",
        url: "/agent-management",
      },
      {
        iconName: "TrendingUp",
        label: "Analytics Dashboard",
        url: "/dashboard",
      }
    );
  }

  const handleNavigate = (url: string, title: string, iconName: string) => {
    savePageVisit(title, url, iconName);
    navigate(url);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Type a command or search..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        {!search && (
          <CommandGroup heading="Quick Actions">
            {quickActions.map((action) => (
              <CommandItem
                key={action.label}
                onSelect={action.action}
                data-testid={`command-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {action.icon}
                <span>{action.label}</span>
                {action.shortcut && (
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    {action.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Recent Pages */}
        {!search && recentPages.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent">
              {recentPages.slice(0, 5).map((page) => (
                <CommandItem
                  key={page.url}
                  onSelect={() => handleNavigate(page.url, page.title, page.iconName)}
                >
                  {iconMap[page.iconName] || <Home className="h-4 w-4" />}
                  <span>{page.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(page.timestamp).toLocaleDateString()}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Search Results - Tasks */}
        {filteredTasks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tasks">
              {filteredTasks.map((task) => (
                <CommandItem
                  key={task.id}
                  onSelect={() => {
                    savePageVisit(task.title, "/tasks", "Clock");
                    navigate("/tasks");
                    setOpen(false);
                  }}
                  data-testid={`command-task-${task.id}`}
                >
                  <Clock className="h-4 w-4" />
                  <span>{task.title}</span>
                  {task.priority === "high" && (
                    <Badge className="ml-auto bg-red-100 text-red-800 text-xs">High</Badge>
                  )}
                  {task.completed && (
                    <Badge className="ml-auto bg-green-100 text-green-800 text-xs">Done</Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Search Results - Projects */}
        {filteredProjects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Projects">
              {filteredProjects.map((project) => (
                <CommandItem
                  key={project.id}
                  onSelect={() => {
                    savePageVisit(project.name, `/project/${project.id}`, "Folder");
                    navigate(`/project/${project.id}`);
                    setOpen(false);
                  }}
                  data-testid={`command-project-${project.id}`}
                >
                  <Folder className="h-4 w-4" />
                  <span>{project.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Search Results - Clients */}
        {filteredClients.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Clients">
              {filteredClients.map((client) => (
                <CommandItem
                  key={client.id}
                  onSelect={() => {
                    savePageVisit(client.name, `/client/${client.id}`, "Users");
                    navigate(`/client/${client.id}`);
                    setOpen(false);
                  }}
                  data-testid={`command-client-${client.id}`}
                >
                  <Users className="h-4 w-4" />
                  <span>{client.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Search Results - Invoices */}
        {filteredInvoices.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Invoices">
              {filteredInvoices.map((invoice) => (
                <CommandItem
                  key={invoice.id}
                  onSelect={() => {
                    savePageVisit(`Invoice #${invoice.invoiceNumber}`, `/invoices/${invoice.id}`, "FileText");
                    navigate(`/invoices/${invoice.id}`);
                    setOpen(false);
                  }}
                  data-testid={`command-invoice-${invoice.id}`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Invoice #{invoice.invoiceNumber}</span>
                  <Badge className="ml-auto" variant="secondary">
                    {invoice.status}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Navigation */}
        {!search && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Navigation">
              {navigationShortcuts.map((nav) => (
                <CommandItem
                  key={nav.url}
                  onSelect={() => handleNavigate(nav.url, nav.label, nav.iconName)}
                >
                  {iconMap[nav.iconName] || <Home className="h-4 w-4" />}
                  <span>{nav.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Account Actions */}
        {!search && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Account">
              <CommandItem onSelect={() => logoutMutation.mutate()}>
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>

      <div className="border-t p-2 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-2">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
            ↑↓
          </kbd>
          <span>Navigate</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
            ⏎
          </kbd>
          <span>Select</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
            ESC
          </kbd>
          <span>Close</span>
        </div>
      </div>
    </CommandDialog>
  );
}
