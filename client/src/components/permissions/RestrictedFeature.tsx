import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Lock, Crown, Settings, ShieldAlert, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export type RestrictionType = "role" | "plan" | "setup" | "demo";

interface RestrictionConfig {
  icon: typeof Lock;
  title: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
  badgeText: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
}

const restrictionConfigs: Record<RestrictionType, RestrictionConfig> = {
  role: {
    icon: ShieldAlert,
    title: "Admin Access Required",
    description: "This feature requires administrator privileges. Contact your admin to request access.",
    actionLabel: "Request Access",
    actionUrl: "/settings",
    badgeText: "Admin Only",
    badgeVariant: "secondary",
  },
  plan: {
    icon: Crown,
    title: "Upgrade to Unlock",
    description: "This feature is available on higher-tier plans. Upgrade to access advanced capabilities.",
    actionLabel: "View Plans",
    actionUrl: "/pricing",
    badgeText: "Pro",
    badgeVariant: "default",
  },
  setup: {
    icon: Settings,
    title: "Configuration Required",
    description: "This feature requires additional setup. Complete the configuration to enable it.",
    actionLabel: "Configure",
    actionUrl: "/system-status",
    badgeText: "Setup Needed",
    badgeVariant: "outline",
  },
  demo: {
    icon: Lock,
    title: "Not Available in Demo",
    description: "This action is disabled in demo mode. Sign up for a real account to use this feature.",
    actionLabel: "Sign Up",
    actionUrl: "/pricing",
    badgeText: "Demo",
    badgeVariant: "secondary",
  },
};

interface RestrictedFeatureProps {
  type: RestrictionType;
  featureName?: string;
  requiredRole?: string;
  requiredPlan?: "Pro" | "Enterprise";
  missingConfig?: string;
  children?: ReactNode;
  showInline?: boolean;
  className?: string;
}

export function RestrictedFeature({
  type,
  featureName,
  requiredRole,
  requiredPlan,
  missingConfig,
  children,
  showInline = false,
  className,
}: RestrictedFeatureProps) {
  const config = restrictionConfigs[type];
  const Icon = config.icon;

  let description = config.description;
  let badgeText = config.badgeText;

  if (type === "role" && requiredRole) {
    description = `This feature requires the ${requiredRole} role.`;
    badgeText = requiredRole;
  }

  if (type === "plan" && requiredPlan) {
    description = `Upgrade to ${requiredPlan} to access ${featureName || "this feature"}.`;
    badgeText = requiredPlan;
  }

  if (type === "setup" && missingConfig) {
    description = `Configure ${missingConfig} to enable ${featureName || "this feature"}.`;
  }

  if (showInline) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("inline-flex items-center gap-1 opacity-50 cursor-not-allowed", className)}>
            {children}
            <Lock className="h-3 w-3" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="font-medium">{config.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            <a href={config.actionUrl} className="text-primary underline text-xs inline-flex items-center gap-1">
              {config.actionLabel}
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center py-8 px-6 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <Badge variant={config.badgeVariant} className="mb-2">
          {badgeText}
        </Badge>
        <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
        <Button asChild data-testid={`button-restricted-${type}-action`}>
          <a href={config.actionUrl}>
            {config.actionLabel}
            <ArrowRight className="h-4 w-4 ml-2" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

interface RestrictedButtonProps {
  type: RestrictionType;
  featureName?: string;
  requiredRole?: string;
  requiredPlan?: "Pro" | "Enterprise";
  missingConfig?: string;
  children: ReactNode;
  className?: string;
}

export function RestrictedButton({
  type,
  featureName,
  requiredRole,
  requiredPlan,
  missingConfig,
  children,
  className,
}: RestrictedButtonProps) {
  const config = restrictionConfigs[type];
  const Icon = config.icon;

  let tooltipText = config.description;

  if (type === "role" && requiredRole) {
    tooltipText = `Requires ${requiredRole} role`;
  }

  if (type === "plan" && requiredPlan) {
    tooltipText = `Upgrade to ${requiredPlan} to unlock`;
  }

  if (type === "setup" && missingConfig) {
    tooltipText = `Configure ${missingConfig} first`;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          disabled
          className={cn("gap-2 cursor-not-allowed", className)}
          data-testid={`button-restricted-${type}`}
        >
          {children}
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex items-center gap-2">
          <span>{tooltipText}</span>
          <a href={config.actionUrl} className="text-primary underline text-xs">
            {config.actionLabel}
          </a>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function PlanGatedFeature({
  requiredPlan,
  featureName,
  featureValue,
  children,
  className,
}: {
  requiredPlan: "Pro" | "Enterprise";
  featureName: string;
  featureValue?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="absolute top-2 right-2">
        <Badge variant="default" className="gap-1">
          <Crown className="h-3 w-3" />
          {requiredPlan}
        </Badge>
      </div>
      <CardContent className="pt-10 pb-6 px-6">
        {children || (
          <div className="text-center">
            <h4 className="font-semibold mb-2">{featureName}</h4>
            {featureValue && (
              <p className="text-sm text-muted-foreground mb-4">{featureValue}</p>
            )}
            <Button asChild variant="outline" size="sm" data-testid="button-upgrade-plan">
              <a href="/pricing">
                Upgrade to {requiredPlan}
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RestrictedFeature;
