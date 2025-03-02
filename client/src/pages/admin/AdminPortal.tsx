import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmailTemplateEditor } from '@/components/EmailTemplateEditor';
import {
  Search,
  MapPin,
  FileText,
  Save,
  Loader2,
  Trash2,
  Download,
  User,
  Settings,
  UserPlus,
  ChevronUp,
  ChevronDown,
  Eye,
  BarChart,
  Mail,
  CheckCircle,
  Users,
  DollarSign
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DatePicker } from "@/components/ui/date-picker";
import { addDays, subDays, isWithinInterval } from 'date-fns';
import { Separator } from "@/components/ui/separator";


type WaitlistEntry = {
  id: number;
  email: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
};

type DateRange = {
  from: Date;
  to: Date;
} | null;

type SegmentationCriteria = {
  dateRange: DateRange;
  states: string[];
  cities: string[];
  zipCodes: string[];
};

type SortDirection = 'asc' | 'desc';
type SortField = 'created_at' | 'zip_code';

type Service = {
  id: number;
  name: string;
  description: string;
  price: number;
  sort_order: number;
};

type Plan = {
  id: number;
  name: string;
  description: string;
  price: number;
  billing_period: 'monthly' | 'yearly';
  sort_order: number;
  features?: PlanFeature[];
};

type PlanFeature = {
  id: number;
  plan_id: number;
  feature: string;
  included: boolean;
  sort_order: number;
};

let knownZipCodeMappings: Record<string, { city: string, state: string }> = {
  '75033': { city: 'Frisco', state: 'TX' },
  // Add any other problematic ZIP codes here
};

type EmailTemplate = {
  id: number;
  name: string;
  subject: string;
  html_content: string;
  thumbnail_url?: string; // Added thumbnail_url
};

type EmailHistoryEntry = {
  id: number;
  template_name: string;
  sent_at: string;
  total_recipients: number;
  status: 'completed' | 'failed' | 'pending';
};

type PageContent = {
  id: number;
  page: string;
  section: string;
  key: string;
  content: string;
};

export default function AdminPortal() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("waitlist-entries");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [currentNotes, setCurrentNotes] = useState("");
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);
  const [loadingZips, setLoadingZips] = useState<{ [key: number]: boolean }>({});
  const [isAutoPopulating, setIsAutoPopulating] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState<Record<number, Partial<WaitlistEntry>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [sendEmailDialogOpen, setSendEmailDialogOpen] = useState(false);
  const [selectAllRecipients, setSelectAllRecipients] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState(new Set<string>());
  const [recipientSearchTerm, setRecipientSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<"welcome" | "verification" | null>(null);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [segmentationCriteria, setSegmentationCriteria] = useState<SegmentationCriteria>({
    dateRange: null,
    states: [],
    cities: [],
    zipCodes: [],
  });
  const [activeTemplateTab, setActiveTemplateTab] = useState('system');
  const { data: customTemplates, isLoading: customTemplatesLoading } = useQuery<EmailTemplate[]>({
    queryKey: ['email-templates', 'custom'],
    queryFn: () => fetch('/api/email-templates/custom').then(res => res.json()),
    enabled: activeTab === 'email-templates' && activeTemplateTab === 'custom'
  });
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
  const [deleteTemplateDialogOpen, setDeleteTemplateDialogOpen] = useState(false);
  const [deleteEmailHistoryDialogOpen, setDeleteEmailHistoryDialogOpen] = useState(false);
  const [emailHistoryToDelete, setEmailHistoryToDelete] = useState<EmailHistoryEntry | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [editingContent, setEditingContent] = useState<PageContent | null>(null);
  const [showContentDialog, setShowContentDialog] = useState(false);


  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/login');
    }
  }, [user, authLoading, setLocation]);

  const {
    data: waitlistEntries = [],
    isLoading: waitlistLoading,
  } = useQuery<WaitlistEntry[]>({
    queryKey: ['waitlist'],
    queryFn: () => fetch('/api/waitlist').then(res => res.json()),
    enabled: activeTab === "waitlist-entries" && !!user,
  });

  const {
    data: analyticsData,
    isLoading: analyticsLoading
  } = useQuery({
    queryKey: ['waitlist-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/waitlist/analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
    enabled: activeTab === "waitlist-analytics"
  });

  const { data: emailHistory, isLoading: emailHistoryLoading } = useQuery({
    queryKey: ['email-history'],
    queryFn: () => fetch('/api/email-history').then(res => res.json()),
    enabled: activeTab === 'email-history'
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await fetch('/api/pricing/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: activeTab === "pricing",
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await fetch('/api/pricing/plans');
      if (!response.ok) throw new Error('Failed to fetch plans');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: activeTab === "pricing",
  });

  const { data: pageContent = [], isLoading: contentLoading } = useQuery<PageContent[]>({
    queryKey: ['pricing-content'],
    queryFn: async () => {
      const response = await fetch('/api/pricing/content');
      if (!response.ok) throw new Error('Failed to fetch page content');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: activeTab === "pricing",
  });

  const updateEntryMutation = useMutation({
    mutationFn: async (entries: Array<{ id: number } & Partial<WaitlistEntry>>) => {
      setIsSaving(true);
      try {
        const results = await Promise.all(
          entries.map(async (entry) => {
            const response = await fetch(`/api/waitlist/${entry.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(entry),
            });

            const responseData = await response.json();

            if (!response.ok) {
              throw new Error(responseData.details || responseData.error || 'Failed to update entry');
            }

            return responseData;
          })
        );
        return results;
      } finally {
        setIsSaving(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      setUnsavedChanges({});
      toast({
        title: "Changes saved",
        description: "All waitlist entries have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save changes",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/waitlist/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete entry');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      toast({
        title: "Entry deleted",
        description: "The waitlist entry has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete entry",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (service: Omit<Service, 'id'>) => {
      const response = await fetch('/api/pricing/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service),
      });
      if (!response.ok) throw new Error('Failed to create service');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setShowServiceDialog(false);
      toast({
        title: "Service created",
        description: "The service has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create service",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async (service: Service) => {
      const response = await fetch(`/api/pricing/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service),
      });
      if (!response.ok) throw new Error('Failed to update service');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setShowServiceDialog(false);
      toast({
        title: "Service updated",
        description: "The service has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update service",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/pricing/services/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete service');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({
        title: "Service deleted",
        description: "The service has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete service",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (plan: Omit<Plan, 'id'>) => {
      const response = await fetch('/api/pricing/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });
      if (!response.ok) throw new Error('Failed to create plan');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setShowPlanDialog(false);
      toast({
        title: "Plan created",
        description: "The plan has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create plan",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async (plan: Plan) => {
      const response = await fetch(`/api/pricing/plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });
      if (!response.ok) throw new Error('Failed to update plan');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setShowPlanDialog(false);
      toast({
        title: "Plan updated",
        description: "The plan has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update plan",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/pricing/plans/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete plan');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast({
        title: "Plan deleted",
        description: "The plan has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete plan",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    },
  });

  const createContentMutation = useMutation({
    mutationFn: async (content: Omit<PageContent, 'id'>) => {
      const response = await fetch('/api/pricing/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (!response.ok) throw new Error('Failed to create content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-content'] });
      setShowContentDialog(false);
      toast({
        title: "Content created",
        description: "The content has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create content",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async (content: PageContent) => {
      const response = await fetch(`/api/pricing/content/${content.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (!response.ok) throw new Error('Failed to update content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-content'] });
      setShowContentDialog(false);
      toast({
        title: "Content updated",
        description: "The content has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update content",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/pricing/content/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete content');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-content'] });
      toast({
        title: "Content deleted",
        description: "The content has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete content",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    },
  });

  const handleFieldChange = (entryId: number, field: keyof WaitlistEntry, value: string) => {
    setUnsavedChanges(prev => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        id: entryId,
        [field]: value
      }
    }));
  };

  const handleSaveChanges = () => {
    const changes = Object.values(unsavedChanges);
    if (changes.length > 0) {
      updateEntryMutation.mutate(changes);
    }
  };

  const handleDelete = (id: number) => {
    setEntryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      deleteEntryMutation.mutate(entryToDelete);
    }
    setDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  const getFilteredRecipients = () => {
    return waitlistEntries.filter(entry => {
      if (segmentationCriteria.dateRange?.from && segmentationCriteria.dateRange?.to) {
        const entryDate = new Date(entry.created_at);
        if (!isWithinInterval(entryDate, {
          start: segmentationCriteria.dateRange.from,
          end: segmentationCriteria.dateRange.to
        })) {
          return false;
        }
      }

      if (segmentationCriteria.states.length > 0) {
        if (!entry.state || !segmentationCriteria.states.includes(entry.state)) {
          return false;
        }
      }

      if (segmentationCriteria.cities.length > 0) {
        if (!entry.city || !segmentationCriteria.cities.includes(entry.city)) {
          return false;
        }
      }

      if (segmentationCriteria.zipCodes.length > 0) {
        if (!entry.zip_code || !segmentationCriteria.zipCodes.includes(entry.zip_code)) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredEntries = getFilteredRecipients().filter(entry => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.email.toLowerCase().includes(searchLower) ||
      entry.first_name?.toLowerCase().includes(searchLower) ||
      entry.last_name?.toLowerCase().includes(searchLower) ||
      entry.zip_code?.includes(searchTerm)
    );
  });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;

    if (sortField === 'created_at') {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return (dateA - dateB) * modifier;
    } else {
      const zipA = a.zip_code || '';
      const zipB = b.zip_code || '';
      return zipA.localeCompare(zipB) * modifier;
    }
  });

  const handleViewDetails = (entry: WaitlistEntry) => {
    setSelectedEntry(entry);
    setShowDetailsDialog(true);
  };

  const handleCityStateFromZip = async (zip: string, entryId: number) => {
    if (!/^\d{5}$/.test(zip)) {
      toast({
        title: "Invalid ZIP Code",
        description: "ZIP code must be 5 digits",
        variant: "destructive"
      });
      return false;
    }

    try {
      setLoadingZips(prev => ({ ...prev, [entryId]: true }));

      if (knownZipCodeMappings[zip]) {
        await updateEntryMutation.mutateAsync([{
          id: entryId,
          city: knownZipCodeMappings[zip].city,
          state: knownZipCodeMappings[zip].state
        }]);
        return true;
      }

      let retries = 3;
      let response;
      while (retries >= 0) {
        try {
          response = await fetch(`https://api.zippopotam.us/us/${zip}`);
          if (response.ok) break;

          if (response.status === 429) {
            const backoffTime = Math.pow(2, 3 - retries) * 2000;
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          } else {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }

          retries--;
          if (retries < 0) {
            throw new Error(`ZIP code lookup failed after all retries: ${response?.statusText || 'Unknown error'}`);
          }
        } catch (fetchError) {
          if (retries < 0) throw fetchError;
          await new Promise(resolve => setTimeout(resolve, 3000));
          retries--;
        }
      }

      if (!response?.ok) {
        throw new Error('Failed to get response from ZIP API');
      }

      const data = await response.json();

      if (data && data.places && data.places.length > 0 && data.places[0]) {
        const place = data.places[0];
        if (place['place name'] && place['state abbreviation']) {
          await updateEntryMutation.mutateAsync([{
            id: entryId,
            city: place['place name'],
            state: place['state abbreviation']
          }]);
          toast({
            title: "ZIP Code Validated",
            description: `Updated to ${place['place name']}, ${place['state abbreviation']}`,
            variant: "default"
          });
          return true;
        } else {
          throw new Error('Invalid location data format in API response');
        }
      } else {
        if (data && data['post code'] === zip) {
          throw new Error('API returned data but in an unexpected format');
        } else {
          throw new Error('No location data found for this ZIP code');
        }
      }
    } catch (error) {
      console.error('Error in handleCityStateFromZip:', error);
      toast({
        title: "ZIP Code Validation Failed",
        description: error instanceof Error ? error.message : "Please enter city and state manually",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoadingZips(prev => ({ ...prev, [entryId]: false }));
    }
  };

  const handleAutoPopulateAll = async () => {
    setIsAutoPopulating(true);
    let successCount = 0;
    let failCount = 0;
    let failedZips: string[] = [];

    try {
      const entriesToUpdate = filteredEntries.filter(
        entry => entry.zip_code && (!entry.city || !entry.state)
      );

      if (entriesToUpdate.length === 0) {
        toast({
          title: "No entries to update",
          description: "All entries with ZIP codes already have city and state information.",
        });
        return;
      }

      for (const entry of entriesToUpdate) {
        if (!entry.zip_code) continue;

        try {
          const success = await handleCityStateFromZip(entry.zip_code, entry.id);
          if (success) {
            successCount++;
          } else {
            failCount++;
            failedZips.push(entry.zip_code);
          }
          if (successCount + failCount < entriesToUpdate.length) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          failCount++;
          failedZips.push(entry.zip_code);
        }
      }

      let description = `Successfully updated ${successCount} entries.`;
      if (failCount > 0) {
        description += `\nFailed entries: ${failedZips.join(', ')}`;
      }

      toast({
        title: "Auto-population Complete",
        description: description,
        duration: 5000,
        variant: successCount > 0 ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Auto-population Failed",
        description: "An error occurred while updating locations.",
        variant: "destructive"
      });
    } finally {
      setIsAutoPopulating(false);
    }
  };

  const handleExportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      const excelData = filteredEntries.map(entry => ({
        'Email': entry.email,
        'Sign-up Date': format(new Date(entry.created_at), "MMM dd, yyyy 'at' h:mm a"),
        'First Name': entry.first_name || '',
        'Last Name': entry.last_name || '',
        'Phone Number': entry.phone_number || '',
        'Street Address': entry.street_address || '',
        'City': entry.city || '',
        'State': entry.state || '',
        'ZIP Code': entry.zip_code || '',
        'Notes': entry.notes || ''
      }));
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Waitlist Entries');
      XLSX.writeFile(workbook, `waitlist-entries-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

      toast({
        title: "Export Successful",
        description: "Waitlist entries have been exported to Excel.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export waitlist entries.",
        variant: "destructive"
      });
    }
  };

  const filteredWaitlistEntries = recipientSearchTerm
    ? waitlistEntries.filter(entry =>
      entry.email.toLowerCase().includes(recipientSearchTerm.toLowerCase())
    )
    : waitlistEntries;

  const handleSendEmails = async () => {
    try {
      setIsSendingEmails(true);
      const recipients = Array.from(selectedRecipients);

      const response = await fetch('/api/email/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate as string,
          recipients: recipients
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send emails');
      }

      toast({
        title: "Success",
        description: `Sent ${recipients.length} email${recipients.length > 1 ? 's' : ''} successfully.`,
      });
      setSendEmailDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send emails",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container py-4 md:py-10 px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-muted-foreground mt-1">Manage your platform content and settings</p>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <Badge variant="outline" className="flex gap-1 px-3 py-1">
            <User className="w-3 h-3" /> {user?.username}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await logout();
                setLocation('/login');
              } catch (error) {
                toast({
                  title: "Logout Failed",
                  description: "Could not log out. Please try again.",
                  variant: "destructive"
                });
              }
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full md:w-auto overflow-x-auto flex whitespace-nowrap">
          <TabsTrigger value="waitlist-entries">
            <UserPlus className="w-4 h-4 mr-2" />
            Waitlist Entries
          </TabsTrigger>
          <TabsTrigger value="waitlist-analytics">
            <BarChart className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="email-templates">
            <FileText className="w-4 h-4 mr-2" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="email-history">
            <Mail className="w-4 h-4 mr-2"/>
            Email History
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-4">
          <Card className="p-4 md:p-6">
            <LoadingOverlay 
              isLoading={servicesLoading || plansLoading || contentLoading}
              text="Loading pricing data..."
            />

            {/* Services Section */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Services</h2>
                  <p className="text-muted-foreground">Manage your service offerings and pricing</p>
                </div>
                <Button onClick={() => {
                  setEditingService(null);
                  setShowServiceDialog(true);
                }}>
                  Add New Service
                </Button>
              </div>

              <div className="space-y-4">
                {Array.isArray(services) && services.map((service) => (
                  <Card key={service.id} className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                        <p className="text-sm font-medium mt-2">${service.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingService(service);
                            setShowServiceDialog(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteServiceMutation.mutate(service.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Separator className="my-8" />

            {/* Plans Section */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Plans</h2>
                  <p className="text-muted-foreground">Manage your subscription plans and features</p>
                </div>
                <Button onClick={() => {
                  setEditingPlan(null);
                  setShowPlanDialog(true);
                }}>
                  Add New Plan
                </Button>
              </div>

              <div className="space-y-4">
                {Array.isArray(plans) && plans.map((plan) => (
                  <Card key={plan.id} className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                        <p className="text-sm font-medium mt-2">
                          ${plan.price}/{plan.billing_period}
                        </p>
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Features:</h4>
                          <ul className="space-y-2">
                            {plan.features?.map((feature) => (
                              <li key={feature.id} className="text-sm flex items-center gap-2">
                                <CheckCircle className={`h-4 w-4 ${feature.included ? 'text-green-500' : 'text-muted-foreground'}`} />
                                {feature.feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingPlan(plan);
                            setShowPlanDialog(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deletePlanMutation.mutate(plan.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Separator className="my-8" />

            {/* Page Content Section */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Page Content</h2>
                  <p className="text-muted-foreground">Manage the text content that appears on the pricing page</p>
                </div>
                <Button onClick={() => {
                  setEditingContent(null);
                  setShowContentDialog(true);
                }}>
                  Add New Content
                </Button>
              </div>

              <div className="space-y-4">
                {Array.isArray(pageContent) && pageContent.map((content) => (
                  <Card key={content.id} className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium">{content.section} - {content.key}</h3>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{content.content}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingContent(content);
                            setShowContentDialog(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteContentMutation.mutate(content.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist-entries" className="space-y-4">
          <Card className="p-4 md:p-6 relative">
            <LoadingOverlay
              isLoading={waitlistLoading}
              text="Loading entries..."
            />
            <LoadingOverlay
              isLoading={isSaving}
              text="Saving changes..."
            />
            <LoadingOverlay
              isLoading={isAutoPopulating}
              text="Auto-populating locations..."
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleExportToExcel}
                  className="bg-primary/10 text-primary hover:bg-primary/20"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export to Excel
                </Button>
                <Button
                  onClick={handleAutoPopulateAll}
                  disabled={isAutoPopulating}
                >
                  {isAutoPopulating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Auto Populate City/State
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="rounded-md border min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead
                        onClick={() => handleSort('zip_code')}
                        className="cursor-pointer hover:text-primary transition-colors duration-200"
                      >
                        ZIP Code
                        {sortField === 'zip_code' && (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="ml-2 h-4 w-4 inline-block" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4 inline-block" />
                          )
                        )}
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort('created_at')}
                        className="cursor-pointer hover:text-primary transition-colors duration-200"
                      >
                        Sign-up Date/Time
                        {sortField === 'created_at' && (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="ml-2 h-4 w-4 inline-block" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4 inline-block" />
                          )
                        )}
                      </TableHead>
                      <TableHead className="w-[200px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedEntries.map((entry) => (
                      <TableRow
                        key={entry.id}
                        className="transition-colors duration-200 hover:bg-primary/5 group"
                      >
                        <TableCell className="font-medium">
                          <Input
                            value={unsavedChanges[entry.id]?.email ?? entry.email}
                            onChange={(e) => handleFieldChange(entry.id, 'email', e.target.value)}
                            className="transition-all duration-200 group-hover:border-primary/50"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              value={unsavedChanges[entry.id]?.zip_code ?? entry.zip_code ?? ''}
                              onChange={(e) => {
                                const zip = e.target.value;
                                handleFieldChange(entry.id, 'zip_code', zip);
                                if (zip.length === 5) {
                                  handleCityStateFromZip(zip, entry.id);
                                }
                              }}
                              className="max-w-[100px] transition-all duration-200 group-hover:border-primary/50"
                            />
                            {loadingZips[entry.id] && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {format(new Date(entry.created_at), "MMM dd, yyyy 'at' h:mm a")}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col md:flex-row items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(entry)}
                              className="transition-all duration-200 group-hover:border-primary/50 group-hover:bg-primary/10"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(entry.id)}
                              className="transition-all duration-200 group-hover:bg-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="fixed bottom-4 md:bottom-8 right-4 md:right-8">
              <Button
                onClick={handleSaveChanges}
                disabled={Object.keys(unsavedChanges).length === 0 || isSaving}
                size="lg"
                className="relative"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist-analytics" className="space-y-4">
          <Card className="p-4 md:p-6 relative">
            <LoadingOverlay
              isLoading={analyticsLoading}
              text="Loading analytics..."
            />

            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Waitlist Analytics</h2>
                <p className="text-muted-foreground">Track signup trends across different time periods.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Last Hour</h3>
                  <p className="text-2xl font-bold mt-2">{analyticsData?.hourly?.total || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">signups</p>
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Today</h3>
                  <p className="text-2xl font-bold mt-2">{analyticsData?.daily?.total || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">signups</p>
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">This Month</h3>
                  <p className="text-2xl font-bold mt-2">{analyticsData?.monthly?.total || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">signups</p>
                </Card>
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">This Year</h3>
                  <p className="text-2xl font-bold mt-2">{analyticsData?.yearly?.total || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">signups</p>
                </Card>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Hourly Breakdown</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Hour</TableHead>
                          <TableHead>Signups</TableHead>
                          <TableHead>Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData?.hourly?.breakdown?.map((hour: any) => (
                          <TableRow key={hour.hour}>
                            <TableCell>{hour.hour}:00</TableCell>
                            <TableCell>{hour.count}</TableCell>
                            <TableCell>{hour.percentage}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Daily Breakdown</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Signups</TableHead>                          <TableHead>Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData?.daily?.breakdown?.map((day: any) => (
                          <TableRow key={day.date}>
                            <TableCell>{day.date}</TableCell>
                            <TableCell>{day.count}</TableCell>
                            <TableCell>{day.percentage}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Monthly Breakdown</h3>
                  <div className="overflow-xauto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead>Signups</TableHead>
                          <TableHead>Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData?.monthly?.breakdown?.map((month: any) => (
                          <TableRow key={month.month}>
                            <TableCell>{month.month}</TableCell>
                            <TableCell>{month.count}</TableCell>
                            <TableCell>{month.percentage}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="email-templates">
          <Card className="p-4 md:p-6 relative">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Email Templates</h2>
                  <p className="text-muted-foreground">
                    Manage automated email templates for different events in your application.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setSendEmailDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Send Custom Email
                  </Button>
                </div>
              </div>

              <Tabs value={activeTemplateTab} onValueChange={setActiveTemplateTab} className="w-full">
                <TabsList className="w-full flex justify-start space-x-2">
                  <TabsTrigger value="system">System Templates</TabsTrigger>
                  <TabsTrigger value="custom">Custom Templates</TabsTrigger>
                  <TabsTrigger value="create">Create Template</TabsTrigger>
                </TabsList>

                <TabsContent value="system" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h3 className="text-lg font-medium mb-4">Welcome Email</h3>
                      <EmailTemplateEditor
                        initialData={{
                          name: "Welcome Email",
                          subject: "Welcome to Our Platform",
                          html_content: `
                            <h1>Welcome {firstName}!</h1>
                            <p>Thank you for joining our waitlist. We're excited to have you with us.</p>
                            <p>We'll keep you updated on our progress and let you know when we're ready to launch.</p>
                          `,
                        }}
                        onSave={async (data) => {
                          const response = await fetch('/api/email-templates/welcome', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data),
                          });
                          if (!response.ok) {
                            throw new Error('Failed to save template');
                          }
                        }}
                      />
                    </Card>

                    <Card className="p-4">
                      <h3 className="text-lg font-medium mb-4">Verification Email</h3>
                      <EmailTemplateEditor
                        initialData={{
                          name: "Verification Email",
                          subject: "Verify Your Email",
                          html_content: `
                            <h1>Hello {firstName}!</h1>
                            <p>Your verification code is: {verificationCode}</p>
                            <p>Enter this code to verify your email address.</p>
                          `,
                        }}
                        onSave={async (data) => {
                          const response = await fetch('/api/email-templates/verification', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data),
                          });
                          if (!response.ok) {
                            throw new Error('Failed to save template');
                          }
                        }}
                      />
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="space-y-4">
                  {customTemplatesLoading ? (
                    <LoadingSpinner />
                  ) : customTemplates?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No custom templates yet.</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setActiveTemplateTab("create")}
                      >
                        Create Your First Template
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {customTemplates?.map((template) => (
                        <Card key={template.id} className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-medium">{template.name}</h3>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setTemplateToDelete(template);
                                setDeleteTemplateDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {template.thumbnail_url ? (
                            <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden border">
                              <img
                                src={template.thumbnail_url}
                                alt={`Preview of ${template.name}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-48 mb-4 rounded-md border flex items-center justify-center bg-muted">
                              <FileText className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <EmailTemplateEditor
                            initialData={template}
                            onSave={async (data) => {
                              const response = await fetch(`/api/email-templates/${template.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data),
                              });
                              if (!response.ok) {
                                throw new Error('Failed to update template');
                              }
                              queryClient.invalidateQueries({ queryKey: ['email-templates'] });
                            }}
                          />
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="create">
                  <Card className="p-4">
                    <h3 className="text-lg font-medium mb-4">Create New Template</h3>
                    <EmailTemplateEditor
                      initialData={{
                        name: "",
                        subject: "",
                        html_content: "",
                      }}
                      onSave={async (data) => {
                        const response = await fetch('/api/email-templates', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(data),
                        });
                        if (!response.ok) {
                          throw new Error('Failed to create template');
                        }
                        await queryClient.invalidateQueries({ queryKey: ['email-templates'] });
                        setActiveTemplateTab("custom");
                        toast({
                          title: "Success",
                          description: "Template created successfully",
                        });
                      }}
                    />
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-muted-foreground">Configure your application settings here.</p>
          </Card>
        </TabsContent>
        <TabsContent value="email-history" className="space-y-4">
          <Card className="p-4 md:p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Email History</h2>
              <p className="text-muted-foreground">
                Track all sent emails and their delivery statistics
              </p>
            </div>

            {emailHistoryLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(emailHistory) ? emailHistory.map((history: EmailHistoryEntry) => (
                      <TableRow key={history.id}>
                        <TableCell className="font-medium">
                          {history.template_name}
                        </TableCell>
                        <TableCell>
                          {format(new Date(history.sent_at), "MMM dd, yyyy 'at' h:mm a")}
                        </TableCell>
                        <TableCell>{history.total_recipients}</TableCell>
                        <TableCell>
                          <Badge variant={history.status === 'completed' ? 'default' : 'destructive'}>
                            {history.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No email history available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="pricing" className="space-y-4">
          <Card className="p-4 md:p-6">
            <LoadingOverlay 
              isLoading={servicesLoading || plansLoading || contentLoading}
              text="Loading pricing data..."
            />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Services</h2>
                <p className="text-muted-foreground">Manage your service offerings and pricing</p>
              </div>
              <Button onClick={() => {
                setEditingService(null);
                setShowServiceDialog(true);
              }}>
                Add New Service
              </Button>
            </div>

            <div className="space-y-4">
              {Array.isArray(services) && services.map((service) => (
                <Card key={service.id} className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{service.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                      <p className="text-sm font-medium mt-2">${service.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingService(service);
                          setShowServiceDialog(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteServiceMutation.mutate(service.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Separator className="my-8" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Plans</h2>
                <p className="text-muted-foreground">Manage your subscription plans and features</p>
              </div>
              <Button onClick={() => {
                setEditingPlan(null);
                setShowPlanDialog(true);
              }}>
                Add New Plan
              </Button>
            </div>

            <div className="space-y-4">
              {plans.map((plan) => (
                <Card key={plan.id} className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                      <p className="text-sm font-medium mt-2">
                        ${plan.price}/{plan.billing_period}
                      </p>
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Features:</h4>
                        <ul className="space-y-2">
                          {plan.features?.map((feature) => (
                            <li key={feature.id} className="text-sm flex items-center gap-2">
                              <CheckCircle className={`h-4 w-4 ${feature.included ? 'text-green-500' : 'text-muted-foreground'}`} />
                              {feature.feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingPlan(plan);
                          setShowPlanDialog(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deletePlanMutation.mutate(plan.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Add content management section to pricing tab */}
            <Separator className="my-8" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Page Content</h2>
                <p className="text-muted-foreground">Manage the text content that appears on the pricing page</p>
              </div>
              <Button onClick={() => {
                setEditingContent(null);
                setShowContentDialog(true);
              }}>
                Add New Content
              </Button>
            </div>

            <div className="space-y-4">
              {pageContent.map((content) => (
                <Card key={content.id} className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{content.section} - {content.key}</h3>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{content.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingContent(content);
                          setShowContentDialog(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteContentMutation.mutate(content.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

      </Tabs>

      <Dialog open={sendEmailDialogOpen} onOpenChange={setSendEmailDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Send Custom Email</DialogTitle>
            <DialogDescription>
              Send a custom email to segmented waitlist subscribers
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="segmentation">
                <AccordionTrigger className="text-sm font-medium">
                  Segmentation Criteria
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Signup Date Range</Label>
                      <div className="flex items-center gap-2">
                        <DatePicker
                          selected={segmentationCriteria.dateRange?.from}
                          onSelect={(date) => setSegmentationCriteria(prev => ({
                            ...prev,
                            dateRange: {
                              from: date || new Date(),
                              to: prev.dateRange?.to || new Date()
                            }
                          }))}
                        />
                        <span>to</span>
                        <DatePicker
                          selected={segmentationCriteria.dateRange?.to}
                          onSelect={(date) => setSegmentationCriteria(prev => ({
                            ...prev,
                            dateRange: {
                              from: prev.dateRange?.from || new Date(),
                              to: date || new Date()
                            }
                          }))}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSegmentationCriteria(prev => ({
                            ...prev,
                            dateRange: null
                          }))}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>States</Label>
                        <Select
                          value={segmentationCriteria.states[0] || ''}
                          onValueChange={(value) => setSegmentationCriteria(prev => ({
                            ...prev,
                            states: value ? [value] : []
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(new Set(waitlistEntries.map(e => e.state).filter(Boolean))).map(state => (
                              <SelectItem key={state} value={state!}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Cities</Label>
                        <Select
                          value={segmentationCriteria.cities[0] || ''}
                          onValueChange={(value) => setSegmentationCriteria(prev => ({
                            ...prev,
                            cities: value ? [value] : []
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(new Set(waitlistEntries.map(e => e.city).filter(Boolean))).map(city => (
                              <SelectItem key={city} value={city!}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>ZIP Codes</Label>
                        <Select
                          value={segmentationCriteria.zipCodes[0] || ''}
                          onValueChange={(value) => setSegmentationCriteria(prev => ({
                            ...prev,
                            zipCodes: value ? [value] : []
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ZIP code" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(new Set(waitlistEntries.map(e => e.zip_code).filter(Boolean))).map(zip => (
                              <SelectItem key={zip} value={zip!}>{zip}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSegmentationCriteria({
                          dateRange: null,
                          states: [],
                          cities: [],
                          zipCodes: [],
                        })}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="selectAll"
                checked={selectAllRecipients}
                onCheckedChange={(checked) => {
                  setSelectAllRecipients(!!checked);
                  if (checked) {
                    setSelectedRecipients(new Set(getFilteredRecipients().map(e => e.email)));
                  } else {
                    setSelectedRecipients(new Set());
                  }
                }}
              />
              <label
                htmlFor="selectAll"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Select All Filtered Recipients ({getFilteredRecipients().length})
              </label>
            </div>

            {!selectAllRecipients && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search subscribers..."
                    value={recipientSearchTerm}
                    onChange={(e) => setRecipientSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <ScrollArea className="h-[200px] border rounded-md p-2">
                  <div className="space-y-2">
                    {getFilteredRecipients().map((entry) => (
                      <div key={entry.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`recipient-${entry.id}`}
                          checked={selectedRecipients.has(entry.email)}
                          onCheckedChange={(checked) => {
                            const newSelected = new Set(selectedRecipients);
                            if (checked) {
                              newSelected.add(entry.email);
                            } else {
                              newSelected.delete(entry.email);
                            }
                            setSelectedRecipients(newSelected);
                          }}
                        />
                        <label
                          htmlFor={`recipient-${entry.id}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {entry.email}
                          {entry.city && entry.state && (
                            <span className="text-muted-foreground ml-2">
                              ({entry.city}, {entry.state})
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="text-sm text-muted-foreground">
                  Selected {selectedRecipients.size} of {getFilteredRecipients().length} filtered subscribers
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Email Template</Label>
              <Select
                value={selectedTemplate || ''}
                onValueChange={(value) => setSelectedTemplate(value as "welcome" | "verification")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome Email</SelectItem>
                  <SelectItem value="verification">Verification Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSendEmailDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmails}
              disabled={
                isSendingEmails ||
                selectedRecipients.size === 0 ||
                !selectedTemplate
              }
            >
              {isSendingEmails ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email{selectedRecipients.size > 1 ? 's' : ''} ({selectedRecipients.size})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the waitlist entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const serviceData = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                price: parseFloat(formData.get('price') as string),
                sort_order: parseInt(formData.get('sort_order') as string),
              };

              if (editingService) {
                updateServiceMutation.mutate({ ...serviceData, id: editingService.id });
              } else {
                createServiceMutation.mutate(serviceData);
              }
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingService?.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingService?.description}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={editingService?.price}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  name="sort_order"
                  type="number"
                  defaultValue={editingService?.sort_order ?? 0}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit">
                {editingService ? 'Update Service' : 'Create Service'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Add New Plan'}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const features = Array.from(document.querySelectorAll('[data-feature]')).map((el) => ({
                feature: (el.querySelector('[name="feature"]') as HTMLInputElement).value,
                included: (el.querySelector('[name="included"]') as HTMLInputElement).checked,
                sort_order: parseInt((el.querySelector('[name="feature_sort_order"]') as HTMLInputElement).value),
              }));

              const planData = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                price: parseFloat(formData.get('price') as string),
                billing_period: formData.get('billing_period') as 'monthly' | 'yearly',
                sort_order: parseInt(formData.get('sort_order') as string),
                features,
              };

              if (editingPlan) {
                updatePlanMutation.mutate({ ...planData, id: editingPlan.id });
              } else {
                createPlanMutation.mutate(planData);
              }
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingPlan?.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingPlan?.description}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={editingPlan?.price}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="billing_period">Billing Period</Label>
                  <Select
                    name="billing_period"
                    defaultValue={editingPlan?.billing_period ?? 'monthly'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  name="sort_order"
                  type="number"
                  defaultValue={editingPlan?.sort_order ?? 0}
                  required
                />
              </div>
              <div>
                <Label>Features</Label>
                <div className="space-y-2 mt-2">
                  {(editingPlan?.features ?? [{ feature: '', included: true, sort_order: 0 }]).map((feature, index) => (
                    <div key={index} data-feature className="grid grid-cols-[1fr,auto,auto] gap-2 items-center">
                      <Input
                        name="feature"
                        placeholder="Feature description"
                        defaultValue={feature.feature}
                        required
                      />
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`included-${index}`} className="text-sm">Included</Label>
                        <Checkbox
                          id={`included-${index}`}
                          name="included"
                          defaultChecked={feature.included}
                        />
                      </div>
                      <Input
                        name="feature_sort_order"
                        type="number"
                        className="w-20"
                        defaultValue={feature.sort_order}
                        required
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => {
                      const featuresContainer = document.querySelector('[data-feature]')?.parentElement;
                      if (featuresContainer) {
                        const newFeature = featuresContainer.lastElementChild?.cloneNode(true) as HTMLElement;
                        if (newFeature) {
                          const inputs = newFeature.querySelectorAll('input');
                          inputs.forEach(input => {
                            if (input.name === 'feature') input.value = '';
                            if (input.name === 'feature_sort_order') {
                              input.value = String(featuresContainer.children.length);
                            }
                          });
                          featuresContainer.appendChild(newFeature);
                        }
                      }
                    }}
                  >
                    Add Feature
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit">
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Content Dialog */}
      <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContent ? 'Edit Content' : 'Add New Content'}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const contentData = {
                page: 'pricing',
                section: formData.get('section') as string,
                key: formData.get('key') as string,
                content: formData.get('content') as string,
              };

              if (editingContent) {
                updateContentMutation.mutate({ ...contentData, id: editingContent.id });
              } else {
                createContentMutation.mutate(contentData);
              }
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="section">Section</Label>
                <Select
                  name="section"
                  defaultValue={editingContent?.section ?? "hero"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Hero</SelectItem>
                    <SelectItem value="plans">Plans</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="key">Content Key</Label>
                <Input
                  id="key"
                  name="key"
                  placeholder="e.g., title, description"
                  defaultValue={editingContent?.key}
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  rows={5}
                  defaultValue={editingContent?.content}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit">
                {editingContent ? 'Update Content' : 'Create Content'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}