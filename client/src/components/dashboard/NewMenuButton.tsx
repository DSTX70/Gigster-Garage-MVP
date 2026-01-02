import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  CheckSquare,
  Receipt,
  FileText,
  FileSignature,
  Presentation,
  Users,
  Mail,
} from "lucide-react";

type NewMenuButtonProps = {
  onNewTask: () => void;
};

export function NewMenuButton({ onNewTask }: NewMenuButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          className="text-white border-2"
          style={{
            background: "var(--gg-teal)",
            borderColor: "var(--gg-teal)",
            color: "var(--gg-white)",
          }}
          data-testid="button-new-menu"
        >
          <Plus className="h-4 w-4 mr-1" />
          + New
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onNewTask} data-testid="menu-item-new-task">
          <CheckSquare className="h-4 w-4 mr-2" />
          New Task
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <Link href="/create-invoice">
          <DropdownMenuItem data-testid="menu-item-create-invoice">
            <Receipt className="h-4 w-4 mr-2" />
            Create Invoice
          </DropdownMenuItem>
        </Link>

        <Link href="/create-proposal">
          <DropdownMenuItem data-testid="menu-item-create-proposal">
            <FileText className="h-4 w-4 mr-2" />
            Create Proposal
          </DropdownMenuItem>
        </Link>

        <Link href="/create-contract">
          <DropdownMenuItem data-testid="menu-item-create-contract">
            <FileSignature className="h-4 w-4 mr-2" />
            Create Contract
          </DropdownMenuItem>
        </Link>

        <Link href="/create-presentation">
          <DropdownMenuItem data-testid="menu-item-create-presentation">
            <Presentation className="h-4 w-4 mr-2" />
            Create Presentation
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <Link href="/clients">
          <DropdownMenuItem data-testid="menu-item-clients">
            <Users className="h-4 w-4 mr-2" />
            Clients
          </DropdownMenuItem>
        </Link>

        <Link href="/messages">
          <DropdownMenuItem data-testid="menu-item-messages">
            <Mail className="h-4 w-4 mr-2" />
            Messages
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
