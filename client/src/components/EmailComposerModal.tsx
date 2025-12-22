import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTo?: string;
  defaultSubject?: string;
  defaultBody?: string;
  onSuccess?: () => void;
}

export function EmailComposerModal({
  isOpen,
  onClose,
  defaultTo = "",
  defaultSubject = "",
  defaultBody = "",
  onSuccess
}: EmailComposerModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    to: defaultTo,
    subject: defaultSubject,
    content: defaultBody,
    priority: "medium" as "low" | "medium" | "high"
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        to: defaultTo,
        subject: defaultSubject,
        content: defaultBody,
        priority: "medium"
      });
    }
  }, [isOpen, defaultTo, defaultSubject, defaultBody]);

  const sendEmailMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/messages", {
        toEmail: data.to,
        subject: data.subject,
        content: data.content,
        priority: data.priority,
        attachments: []
      });
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Your message has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      onClose();
      onSuccess?.();
      setFormData({ to: "", subject: "", content: "", priority: "medium" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send",
        description: error?.message || "Unable to send email. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!formData.to || !formData.subject || !formData.content) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields (To, Subject, Message).",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.to)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    sendEmailMutation.mutate(formData);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#004C6D]" />
            Send Email
          </DialogTitle>
          <DialogDescription>
            Compose and send an email to your customer.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email-to">To *</Label>
            <Input
              id="email-to"
              type="email"
              placeholder="customer@example.com"
              value={formData.to}
              onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
              data-testid="input-email-to"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email-subject">Subject *</Label>
            <Input
              id="email-subject"
              placeholder="Enter email subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              data-testid="input-email-subject"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email-priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: "low" | "medium" | "high") => 
                setFormData(prev => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger id="email-priority" data-testid="select-email-priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email-content">Message *</Label>
            <Textarea
              id="email-content"
              placeholder="Write your message here..."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={6}
              data-testid="textarea-email-content"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-email">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={sendEmailMutation.isPending}
            className="bg-[#004C6D] hover:bg-[#003d57]"
            data-testid="button-send-email"
          >
            {sendEmailMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useEmailComposer() {
  const [isOpen, setIsOpen] = useState(false);
  const [defaults, setDefaults] = useState({
    to: "",
    subject: "",
    body: ""
  });

  const openComposer = (options?: { to?: string; subject?: string; body?: string }) => {
    setDefaults({
      to: options?.to || "",
      subject: options?.subject || "",
      body: options?.body || ""
    });
    setIsOpen(true);
  };

  const closeComposer = () => {
    setIsOpen(false);
    setDefaults({ to: "", subject: "", body: "" });
  };

  return {
    isOpen,
    defaults,
    openComposer,
    closeComposer
  };
}
