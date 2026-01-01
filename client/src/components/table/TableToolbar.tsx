import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, SortAsc, SortDesc, Calendar as CalendarIcon, X, ChevronDown, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export interface FilterOption {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface SortOption {
  id: string;
  label: string;
}

interface TableToolbarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterOption[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (filterId: string, value: string) => void;
  sortOptions?: SortOption[];
  activeSort?: { id: string; direction: "asc" | "desc" };
  onSortChange?: (sortId: string, direction: "asc" | "desc") => void;
  showDateRange?: boolean;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  onReset?: () => void;
  actions?: ReactNode;
  className?: string;
}

export function TableToolbar({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  activeFilters = {},
  onFilterChange,
  sortOptions = [],
  activeSort,
  onSortChange,
  showDateRange = false,
  dateRange,
  onDateRangeChange,
  onReset,
  actions,
  className,
}: TableToolbarProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const hasActiveFilters = Object.values(activeFilters).some(v => v && v !== "all");
  const hasActiveSort = !!activeSort;
  const hasActiveDateRange = dateRange?.from || dateRange?.to;

  const activeFilterCount = Object.values(activeFilters).filter(v => v && v !== "all").length + 
    (hasActiveDateRange ? 1 : 0);

  return (
    <div className={cn("flex flex-col sm:flex-row gap-3 mb-4", className)}>
      <div className="flex-1 flex flex-col sm:flex-row gap-2">
        {onSearchChange && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
              data-testid="input-table-search"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => onSearchChange("")}
                data-testid="button-clear-search"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {filters.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" data-testid="button-table-filter">
                <Filter className="h-4 w-4" />
                Filter
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filters.map((filter) => (
                <div key={filter.id} className="px-2 py-1.5">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    {filter.label}
                  </label>
                  <Select
                    value={activeFilters[filter.id] || "all"}
                    onValueChange={(value) => onFilterChange?.(filter.id, value)}
                  >
                    <SelectTrigger className="h-8" data-testid={`select-filter-${filter.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {sortOptions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" data-testid="button-table-sort">
                {activeSort?.direction === "desc" ? (
                  <SortDesc className="h-4 w-4" />
                ) : (
                  <SortAsc className="h-4 w-4" />
                )}
                Sort
                {hasActiveSort && (
                  <ChevronDown className="h-3 w-3 ml-1" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => {
                    const newDirection = activeSort?.id === option.id && activeSort.direction === "asc" 
                      ? "desc" 
                      : "asc";
                    onSortChange?.(option.id, newDirection);
                  }}
                  data-testid={`menu-item-sort-${option.id}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {activeSort?.id === option.id && (
                      activeSort.direction === "asc" ? (
                        <SortAsc className="h-4 w-4 ml-2" />
                      ) : (
                        <SortDesc className="h-4 w-4 ml-2" />
                      )
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {showDateRange && (
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2" data-testid="button-date-range">
                <CalendarIcon className="h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  "Date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  onDateRangeChange?.(range);
                  if (range?.from && range?.to) {
                    setIsDatePickerOpen(false);
                  }
                }}
                numberOfMonths={2}
                initialFocus
              />
              {hasActiveDateRange && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      onDateRangeChange?.(undefined);
                      setIsDatePickerOpen(false);
                    }}
                  >
                    Clear dates
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}

        {(hasActiveFilters || hasActiveDateRange) && onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-1 text-muted-foreground"
            data-testid="button-reset-filters"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export default TableToolbar;
