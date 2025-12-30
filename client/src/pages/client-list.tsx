import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Mail, Phone, Building, DollarSign, FileText, Search, ArrowLeft, Upload, X, File } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useDemoGuard, DEMO_LIMITATIONS } from "@/hooks/useDemoGuard";
import { AppHeader } from "@/components/app-header";
import { copy } from "@/lib/copy";
import { useTranslation } from "@/lib/i18n";
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

interface UploadedFile {
  file: File;
  preview?: string;
}

export default function ClientList() {
  const { toast } = useToast();
  const { canPerformAction } = useDemoGuard();
  const { t } = useTranslation();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: t('error'),
        description: t('required'),
        variant: "destructive",
      });
      return;
    }

    // Check demo limitations for client creation
    if (!canPerformAction(DEMO_LIMITATIONS.CREATE_CLIENT)) {
      return;
    }

    try {
      setIsUploading(true);
      const response = await apiRequest("POST", "/api/clients", formData) as Response;
      const newClient = await response.json();
      
      // Upload files if any
      if (uploadedFiles.length > 0 && newClient.id) {
        for (const uploadedFile of uploadedFiles) {
          const fileFormData = new FormData();
          fileFormData.append('file', uploadedFile.file);
          fileFormData.append('name', uploadedFile.file.name);
          fileFormData.append('type', 'other');
          fileFormData.append('description', `Uploaded with new client: ${formData.name}`);
          
          try {
            await fetch(`/api/clients/${newClient.id}/documents`, {
              method: 'POST',
              body: fileFormData,
              credentials: 'include'
            });
          } catch (fileError) {
            console.error('Failed to upload file:', uploadedFile.file.name, fileError);
          }
        }
      }
      
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
      setUploadedFiles([]);
      
      toast({
        title: t('success'),
        description: uploadedFiles.length > 0 
          ? `${t('clientAdded')} with ${uploadedFiles.length} file(s)`
          : t('clientAdded'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('errorOccurred'),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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
        <AppHeader />

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
      <AppHeader />

      <div className="p-6">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="button-back-to-dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('back')}
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-[var(--signal)]" />
              <h1 className="text-3xl font-bold text-gray-900">{t('clientManagement')}</h1>
            </div>
          </div>
          
          <Button 
            className="bg-[#FF7F00] hover:bg-[#e6720a] text-white" 
            data-testid="button-new-client"
            onClick={() => {
              if (canPerformAction(DEMO_LIMITATIONS.CREATE_CLIENT)) {
                setIsOpen(true);
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('newClient')}
          </Button>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('addClient')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('clientName')} *</Label>
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
                    <Label htmlFor="company">{t('company')}</Label>
                    <Input
                      id="company"
                      placeholder="Company name"
                      value={formData.company}
                      onChange={(e) => updateFormData("company", e.target.value)}
                      data-testid="input-company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
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
                    <Label htmlFor="phone">{t('phone')}</Label>
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
                    <Label htmlFor="website">{t('website')}</Label>
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
                    <Label htmlFor="status">{t('status')}</Label>
                    <Select value={formData.status} onValueChange={(value) => updateFormData("status", value as any)}>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="active">{t('active')}</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">{t('address')}</Label>
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
                  <Label htmlFor="notes">{t('notes')}</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about this client"
                    value={formData.notes}
                    onChange={(e) => updateFormData("notes", e.target.value)}
                    rows={3}
                    data-testid="textarea-notes"
                  />
                </div>
                
                {/* File Upload Section */}
                <div className="space-y-3">
                  <Label>Attachments</Label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#FF7F00] transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    data-testid="upload-dropzone"
                  >
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.png,.jpg,.jpeg,.gif"
                      data-testid="input-file-upload"
                    />
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload files</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, XLS, TXT, CSV, Images (Max 10MB each)</p>
                  </div>
                  
                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((item, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
                          data-testid={`uploaded-file-${index}`}
                        >
                          {item.preview ? (
                            <img src={item.preview} alt="" className="h-10 w-10 object-cover rounded" />
                          ) : (
                            <File className="h-10 w-10 text-gray-400 p-2 bg-white rounded" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(item.file.size)}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                            data-testid={`remove-file-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    {t('cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[#FF7F00] hover:bg-[#e6720a] text-white" 
                    data-testid="button-create-client"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Creating...
                      </>
                    ) : (
                      t('create')
                    )}
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
              placeholder={t('search')}
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noClients')}</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? copy.emptyStates.search.nothingMatches : copy.emptyStates.clients.noClients}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => {
                    if (canPerformAction(DEMO_LIMITATIONS.CREATE_CLIENT)) {
                      setIsOpen(true);
                    }
                  }}
                  className="bg-[#FF7F00] hover:bg-[#e6720a] text-white"
                  data-testid="button-add-first-client"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addClient')}
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
                      <Badge variant={getStatusBadgeVariant(client.status ?? 'active')}>
                        {client.status || 'active'}
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
                          <span>{client.totalProposals || 0} {t('proposals')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${(client.totalRevenue || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      {client.outstandingBalance && Number(client.outstandingBalance) > 0 && (
                        <div className="mt-2 text-sm text-orange-600 font-medium">
                          {t('outstanding')}: ${Number(client.outstandingBalance).toLocaleString()}
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