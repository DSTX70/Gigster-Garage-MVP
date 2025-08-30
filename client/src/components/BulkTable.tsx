import { useState } from "react";
import { BulkActions } from "./BulkActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckSquare, Square, Eye, Edit, Trash2 } from "lucide-react";

interface BulkTableProps<T> {
  entityType: 'tasks' | 'projects' | 'clients';
  title: string;
  items: T[];
  columns: {
    key: string;
    title: string;
    render?: (value: any, item: T) => React.ReactNode;
    sortable?: boolean;
  }[];
  onRefresh: () => void;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  loading?: boolean;
  className?: string;
}

export function BulkTable<T extends { id: string }>({
  entityType,
  title,
  items,
  columns,
  onRefresh,
  onView,
  onEdit,
  onDelete,
  loading = false,
  className = ""
}: BulkTableProps<T>) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Handle individual item selection
  const handleItemSelect = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  // Handle header checkbox (select all/none)
  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < items.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Render cell content
  const renderCell = (item: T, column: any) => {
    const value = (item as any)[column.key];
    
    if (column.render) {
      return column.render(value, item);
    }
    
    // Default rendering for common types
    if (typeof value === 'boolean') {
      return <Badge variant={value ? "default" : "secondary"}>{value ? "Yes" : "No"}</Badge>;
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    if (column.key === 'status') {
      const statusColors: Record<string, string> = {
        todo: "secondary",
        in_progress: "default",
        review: "outline",
        done: "default",
        active: "default",
        inactive: "secondary",
        archived: "outline"
      };
      return <Badge variant={statusColors[value] as any || "secondary"}>{value}</Badge>;
    }
    
    if (column.key === 'priority') {
      const priorityColors: Record<string, string> = {
        low: "secondary",
        medium: "outline",
        high: "default",
        urgent: "destructive"
      };
      return <Badge variant={priorityColors[value] as any || "secondary"}>{value}</Badge>;
    }
    
    return value || '-';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading {entityType}...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Bulk Actions Component */}
      <BulkActions
        entityType={entityType}
        items={items}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        onRefresh={onRefresh}
      />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <Badge variant="outline">{items.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-lg mb-2">No {entityType} found</div>
              <div>Create your first {entityType.slice(0, -1)} to get started</div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        ref={(ref) => {
                          if (ref) ref.indeterminate = someSelected;
                        }}
                        onCheckedChange={handleSelectAll}
                        data-testid="checkbox-select-all"
                      />
                    </TableHead>
                    {columns.map((column) => (
                      <TableHead key={column.key}>
                        {column.title}
                      </TableHead>
                    ))}
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow 
                      key={item.id}
                      className={selectedItems.includes(item.id) ? "bg-muted/50" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) => 
                            handleItemSelect(item.id, checked as boolean)
                          }
                          data-testid={`checkbox-${item.id}`}
                        />
                      </TableCell>
                      {columns.map((column) => (
                        <TableCell key={column.key}>
                          {renderCell(item, column)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {onView && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onView(item)}
                              data-testid={`button-view-${item.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(item)}
                              data-testid={`button-edit-${item.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(item)}
                              data-testid={`button-delete-${item.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}