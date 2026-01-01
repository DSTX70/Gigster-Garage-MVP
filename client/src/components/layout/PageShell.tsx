import { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  title: string;
  subtitle?: string;
  statusBadge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  primaryAction?: ReactNode;
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    disabled?: boolean;
  }>;
  helpLink?: string;
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
  noPadding?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export function PageShell({
  title,
  subtitle,
  statusBadge,
  primaryAction,
  secondaryActions,
  helpLink,
  children,
  className,
  maxWidth = "7xl",
  noPadding = false,
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg)] dark:bg-[var(--bg)]">
      <AppHeader />
      
      <main className={cn(
        "mx-auto",
        maxWidthClasses[maxWidth],
        !noPadding && "px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8",
        className
      )}>
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] dark:text-[var(--text)] truncate">
                  {title}
                </h1>
                {statusBadge && (
                  <Badge variant={statusBadge.variant || "secondary"}>
                    {statusBadge.label}
                  </Badge>
                )}
              </div>
              {subtitle && (
                <p className="text-sm sm:text-base text-[var(--muted)] dark:text-[var(--muted)] mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {helpLink && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-[var(--muted)]"
                  data-testid="button-help-link"
                >
                  <a href={helpLink} target="_blank" rel="noopener noreferrer">
                    <HelpCircle className="w-4 h-4 mr-1" />
                    Help
                  </a>
                </Button>
              )}
              
              {secondaryActions && secondaryActions.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" data-testid="button-secondary-actions">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {secondaryActions.map((action, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        data-testid={`menu-item-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {action.icon && <span className="mr-2">{action.icon}</span>}
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {primaryAction}
            </div>
          </div>
        </div>
        
        {children}
      </main>
    </div>
  );
}

export default PageShell;
