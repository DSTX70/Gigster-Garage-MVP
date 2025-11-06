import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import {
  Menu,
  ChevronRight,
  ChevronDown,
  Home,
  Calendar,
  Users,
  Building,
  FileText,
  BarChart3,
  Settings,
  Shield,
  Zap,
  Bot,
  Brain,
  Clock,
  Webhook,
  Key,
  Database,
  Plus,
  Search,
  Archive,
  MessageSquare,
  FileCheck,
  Presentation,
  PenTool,
  Timer,
  Briefcase,
  TrendingUp,
  Eye,
  Mail,
} from 'lucide-react';

interface NavigationSection {
  id: string;
  title: string;
  icon: React.ElementType;
  items: NavigationItem[];
  adminOnly?: boolean;
  collapsed?: boolean;
}

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ElementType;
  path: string;
  adminOnly?: boolean;
  badge?: string;
}

const navigationSections: NavigationSection[] = [
  {
    id: 'core',
    title: 'Core Features',
    icon: Home,
    items: [
      { id: 'home', title: 'Dashboard', icon: Home, path: '/' },
      { id: 'tasks', title: 'Tasks', icon: FileCheck, path: '/tasks' },
      { id: 'projects', title: 'Projects', icon: Briefcase, path: '/project-dashboard' },
      { id: 'calendar', title: 'Calendar', icon: Calendar, path: '/calendar' },
      { id: 'messages', title: 'Messages', icon: MessageSquare, path: '/messages' },
    ],
  },
  {
    id: 'business',
    title: 'Business Operations',
    icon: Building,
    items: [
      { id: 'clients', title: 'Clients', icon: Users, path: '/client-list' },
      { id: 'invoices', title: 'Invoices', icon: FileText, path: '/invoices' },
      { id: 'contracts', title: 'Contracts', icon: FileCheck, path: '/contracts' },
      { id: 'payments', title: 'Payments', icon: Building, path: '/payments' },
      { id: 'proposals', title: 'Proposals', icon: Presentation, path: '/proposals' },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics & Insights',
    icon: BarChart3,
    items: [
      { id: 'analytics', title: 'Analytics', icon: BarChart3, path: '/analytics' },
      { id: 'productivity', title: 'Productivity', icon: TrendingUp, path: '/productivity' },
      { id: 'advanced-reporting', title: 'Advanced Reports', icon: Eye, path: '/advanced-reporting' },
      { id: 'ai-insights', title: 'AI Insights', icon: Brain, path: '/ai-insights' },
      { id: 'predictive-analytics', title: 'Predictive Analytics', icon: Brain, path: '/predictive-analytics' },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced Features',
    icon: Zap,
    collapsed: true,
    items: [
      { id: 'workflow-automation', title: 'Workflow Automation', icon: Zap, path: '/workflow-automation' },
      { id: 'smart-scheduling', title: 'Smart Scheduling', icon: Clock, path: '/smart-scheduling' },
      { id: 'garage-assistant', title: 'AI Assistant', icon: Bot, path: '/garage-assistant' },
      { id: 'team-collaboration', title: 'Team Collaboration', icon: Users, path: '/team-collaboration' },
      { id: 'custom-fields', title: 'Custom Fields', icon: Settings, path: '/custom-fields' },
      { id: 'bulk-operations', title: 'Bulk Operations', icon: Database, path: '/bulk-operations' },
      { id: 'templates', title: 'Templates', icon: FileText, path: '/templates' },
      { id: 'filing-cabinet', title: 'Filing Cabinet', icon: Archive, path: '/filing-cabinet' },
    ],
  },
  {
    id: 'system',
    title: 'System Administration',
    icon: Shield,
    adminOnly: true,
    collapsed: true,
    items: [
      { id: 'admin', title: 'User Management', icon: Users, path: '/admin', adminOnly: true },
      { id: 'permissions', title: 'Permissions', icon: Key, path: '/permissions-management', adminOnly: true },
      { id: 'sso', title: 'SSO Management', icon: Shield, path: '/sso-management', adminOnly: true },
      { id: 'audit', title: 'Audit Logs', icon: Eye, path: '/audit-logging', adminOnly: true },
      { id: 'api-webhooks', title: 'API & Webhooks', icon: Webhook, path: '/api-webhooks', adminOnly: true },
      { id: 'performance', title: 'Performance', icon: TrendingUp, path: '/performance-dashboard', adminOnly: true },
    ],
  },
  {
    id: 'tools',
    title: 'Tools & Utilities',
    icon: PenTool,
    collapsed: true,
    items: [
      { id: 'instant-proposal', title: 'Instant Proposal', icon: Zap, path: '/instant-proposal' },
      { id: 'create-presentation', title: 'Create Presentation', icon: Presentation, path: '/create-presentation' },
      { id: 'template-editor', title: 'Template Editor', icon: PenTool, path: '/template-editor' },
      { id: 'user-manual', title: 'User Manual', icon: FileText, path: '/user-manual' },
    ],
  },
];

export function NavigationMenu() {
  const [, navigate] = useLocation();
  const { isAdmin } = useAuth();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['core', 'business']) // Core and Business sections start expanded
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleItemClick = (path: string) => {
    navigate(path);
  };

  const visibleSections = navigationSections.filter(section => 
    !section.adminOnly || isAdmin
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10 relative p-1.5 sm:p-2"
          data-testid="button-navigation-menu"
          title="Navigation Menu"
        >
          <Menu size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80 max-h-[600px] overflow-y-auto"
        align="end"
        side="bottom"
      >
        <DropdownMenuLabel className="text-lg font-semibold text-garage-navy">
          Navigation
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="space-y-1">
          {visibleSections.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            const visibleItems = section.items.filter(item => 
              !item.adminOnly || isAdmin
            );

            if (visibleItems.length === 0) return null;

            const SectionIcon = section.icon;

            return (
              <Collapsible
                key={section.id}
                open={isExpanded}
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between px-3 py-2 h-auto text-left hover:bg-gray-50"
                    data-testid={`section-${section.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <SectionIcon size={18} className="text-garage-navy" />
                      <span className="font-medium text-gray-900">
                        {section.title}
                      </span>
                      {section.adminOnly && (
                        <span className="bg-garage-navy text-white px-1.5 py-0.5 rounded-full text-xs font-medium">
                          Admin
                        </span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-1 pl-4">
                  {visibleItems.map((item) => {
                    const ItemIcon = item.icon;
                    
                    return (
                      <DropdownMenuItem
                        key={item.id}
                        className="cursor-pointer py-2 px-3 rounded-md hover:bg-gray-50"
                        onClick={() => handleItemClick(item.path)}
                        data-testid={`nav-item-${item.id}`}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <ItemIcon size={16} className="text-garage-navy/70" />
                          <span className="text-gray-700 font-medium">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="bg-ignition-teal text-white px-1.5 py-0.5 rounded-full text-xs font-medium ml-auto">
                              {item.badge}
                            </span>
                          )}
                          {item.adminOnly && (
                            <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-xs font-medium ml-auto">
                              Admin
                            </span>
                          )}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Quick Actions */}
        <div className="p-2">
          <DropdownMenuLabel className="text-sm font-medium text-gray-600 mb-2">
            Quick Actions
          </DropdownMenuLabel>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() => handleItemClick('/tasks?new=true')}
              data-testid="quick-new-task"
            >
              <Plus size={14} className="mr-1" />
              New Task
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() => handleItemClick('/create-invoice')}
              data-testid="quick-new-invoice"
            >
              <FileText size={14} className="mr-1" />
              New Invoice
            </Button>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Search Hint */}
        <div className="p-3 text-center">
          <p className="text-xs text-gray-500 mb-2">
            Need help finding something?
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-garage-navy hover:bg-garage-navy/10"
            onClick={() => {
              // Focus global search (implement based on your search component)
              const searchInput = document.querySelector('[data-testid="global-search-input"]') as HTMLInputElement;
              if (searchInput) {
                searchInput.focus();
              }
            }}
            data-testid="focus-search"
          >
            <Search size={14} className="mr-1" />
            Use Global Search
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NavigationMenu;