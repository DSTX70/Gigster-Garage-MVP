import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Mail, Phone, Building, DollarSign, FileText, Search } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Client } from "@shared/schema";

interface NewClientForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  website: string;
  notes: string;
  status: "active" | "inactive" | "prospect";
}

export default function ClientList() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<NewClientForm>({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    website: "",
    notes: "",
    status: "prospect"
  });

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const updateFormData = (field: keyof NewClientForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Client name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/clients", formData);
      
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      
      setIsOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
        website: "",
        notes: "",
        status: "prospect"
      });
      
      toast({
        title: "Success",
        description: "Client created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "prospect": return "outline";
      default: return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
        <div className="bg-[#FF7F00] text-white py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold">Gigster Garage</div>
            <div className="text-lg">Smarter tools for bolder dreams</div>
          </div>
        </div>

        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-[#FF7F00] text-white py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold">Gigster Garage</div>
          <div className="text-lg">Smarter tools for bolder dreams</div>
        </div>
      </div>

      <div className="p-6">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-[#FF7F00]" />
            <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#FF7F00] hover:bg-[#e6720a] text-white" data-testid="button-new-client">
                <Plus className="h-4 w-4 mr-2" />
                New Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Client Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter client name"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      required
                      data-testid="input-client-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      placeholder="Company name"
                      value={formData.company}
                      onChange={(e) => updateFormData("company", e.target.value)}
                      data-testid="input-company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="client@company.com"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      data-testid="input-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://company.com"
                      value={formData.website}
                      onChange={(e) => updateFormData("website", e.target.value)}
                      data-testid="input-website"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => updateFormData("status", value as any)}>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Client address"
                    value={formData.address}
                    onChange={(e) => updateFormData("address", e.target.value)}
                    rows={2}
                    data-testid="textarea-address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about this client"
                    value={formData.notes}
                    onChange={(e) => updateFormData("notes", e.target.value)}
                    rows={3}
                    data-testid="textarea-notes"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#FF7F00] hover:bg-[#e6720a] text-white" data-testid="button-create-client">
                    Create Client
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-clients"
            />
          </div>
        </div>

        {/* Client Grid */}
        {filteredClients.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "No clients match your search criteria." : "Get started by adding your first client."}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setIsOpen(true)}
                  className="bg-[#FF7F00] hover:bg-[#e6720a] text-white"
                  data-testid="button-add-first-client"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Client
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <Link key={client.id} href={`/client/${client.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={`card-client-${client.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                        {client.name}
                      </CardTitle>
                      <Badge variant={getStatusBadgeVariant(client.status)}>
                        {client.status}
                      </Badge>
                    </div>
                    {client.company && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building className="h-4 w-4" />
                        <span className="text-sm truncate">{client.company}</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {client.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm truncate">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{client.phone}</span>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{client.totalProposals || 0} proposals</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${(client.totalRevenue || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      {client.outstandingBalance && Number(client.outstandingBalance) > 0 && (
                        <div className="mt-2 text-sm text-orange-600 font-medium">
                          Outstanding: ${Number(client.outstandingBalance).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}