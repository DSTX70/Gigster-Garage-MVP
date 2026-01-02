import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ActionCardProps = {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  borderClassName?: string;
  iconWrapClassName?: string;
  testId?: string;
};

export function ActionCard({
  href,
  title,
  description,
  icon,
  borderClassName,
  iconWrapClassName,
  testId,
}: ActionCardProps) {
  return (
    <Link href={href}>
      <Card
        className={cn(
          "hover:shadow-lg transition-shadow cursor-pointer",
          borderClassName ? `border-l-4 ${borderClassName}` : ""
        )}
        data-testid={testId}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={cn("p-2 sm:p-3 rounded-lg", iconWrapClassName ?? "bg-gray-100")}>
              {icon}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">{title}</h3>
              <p className="text-xs sm:text-sm text-gray-600">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
