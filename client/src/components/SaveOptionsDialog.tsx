import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Download, FolderOpen, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SaveOptionsDialogProps {
  content: string;
  contentType: 'text' | 'image' | 'json';
  defaultFileName?: string;
  defaultDocType?: 'proposal' | 'invoice' | 'contract' | 'presentation' | 'report' | 'agreement' | 'other';
  trigger?: React.ReactNode;
  disabled?: boolean;
}

export function SaveOptionsDialog({
  content,
  contentType,
  defaultFileName = 'content',
  defaultDocType = 'other',
  trigger,
  disabled = false
}: SaveOptionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState(defaultFileName);
  const [docType, setDocType] = useState<string>(defaultDocType);
  const [saveMode, setSaveMode] = useState<'download' | 'filing-cabinet' | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveToFilingCabinetMutation = useMutation({
    mutationFn: async () => {
      const fileExtension = contentType === 'image' ? '.png' : contentType === 'json' ? '.json' : '.txt';
      const mimeType = contentType === 'image' ? 'image/png' : contentType === 'json' ? 'application/json' : 'text/plain';
      
      const response = await apiRequest('POST', '/api/documents/from-content', {
        name: fileName,
        content: content,
        contentType: contentType,
        type: docType,
        mimeType: mimeType,
        fileName: `${fileName}${fileExtension}`
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/search/documents'] });
      toast({ title: "Saved!", description: `${fileName} saved to Filing Cabinet` });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Save failed", 
        description: error.message || "Could not save to Filing Cabinet", 
        variant: "destructive" 
      });
    }
  });

  const handleDownload = () => {
    try {
      let blob: Blob;
      let extension: string;
      
      if (contentType === 'image') {
        const base64Data = content.replace(/^data:image\/\w+;base64,/, '');
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: 'image/png' });
        extension = '.png';
      } else if (contentType === 'json') {
        blob = new Blob([content], { type: 'application/json' });
        extension = '.json';
      } else {
        blob = new Blob([content], { type: 'text/plain' });
        extension = '.txt';
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ title: "Downloaded!", description: `${fileName}${extension} saved to your device` });
      setOpen(false);
    } catch (error) {
      toast({ title: "Download failed", description: "Could not download file", variant: "destructive" });
    }
  };

  const handleSaveToFilingCabinet = () => {
    saveToFilingCabinetMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            disabled={disabled}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            data-testid="button-save-options"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Options</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fileName">File Name</Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
              data-testid="input-save-filename"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger data-testid="select-doc-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="presentation">Presentation</SelectItem>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="agreement">Agreement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex flex-col items-center py-6 h-auto"
              data-testid="button-download-file"
            >
              <Download className="h-8 w-8 mb-2 text-blue-600" />
              <span className="font-medium">Download</span>
              <span className="text-xs text-gray-500">Save to device</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSaveToFilingCabinet}
              disabled={saveToFilingCabinetMutation.isPending}
              className="flex flex-col items-center py-6 h-auto"
              data-testid="button-save-filing-cabinet"
            >
              {saveToFilingCabinetMutation.isPending ? (
                <Loader2 className="h-8 w-8 mb-2 animate-spin text-green-600" />
              ) : (
                <FolderOpen className="h-8 w-8 mb-2 text-green-600" />
              )}
              <span className="font-medium">Filing Cabinet</span>
              <span className="text-xs text-gray-500">Save to library</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
