import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn } from "@/lib/queryClient";
import { Pencil, Plus, CheckCircle, X, FileText, GripVertical, Trash2 } from "lucide-react";

interface PricingPlan {
  id: number;
  name: string;
  price: number;
  description: string;
  billing_period: string;
  sort_order: number;
  features: PlanFeature[];
}

interface PlanFeature {
  id: number;
  feature: string;
  included: boolean;
  sort_order: number;
}

interface PricingContent {
  page_title: string;
  page_subtitle: string;
}

// Plan form schema that matches database
const planFormSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  description: z.string().min(1, "Description is required"),
  billing_period: z.string().default("month"),
  sort_order: z.coerce.number().default(0),
  features: z.array(z.object({
    feature: z.string().min(1, "Feature text is required"),
    included: z.boolean().default(true),
    sort_order: z.coerce.number().default(0),
  })).default([]),
});

type PlanFormData = z.infer<typeof planFormSchema>;

// Content form schema
const contentFormSchema = z.object({
  page_title: z.string().min(1, "Page title is required"),
  page_subtitle: z.string().min(1, "Page subtitle is required"),
});

type ContentFormData = z.infer<typeof contentFormSchema>;

export default function PricingManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [showFeatureEditDialog, setShowFeatureEditDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [editingFeatures, setEditingFeatures] = useState<PlanFeature[]>([]);

  // Fetch plans and content
  const { data: plans = [], isLoading: plansLoading } = useQuery<PricingPlan[]>({
    queryKey: ["/api/admin/pricing/plans"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: content } = useQuery<PricingContent>({
    queryKey: ["/api/admin/pricing/content"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Forms
  const planForm = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      billing_period: "month",
      sort_order: 0,
      features: [],
    },
  });

  const contentForm = useForm<ContentFormData>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      page_title: content?.page_title || "Simple, Transparent Pricing",
      page_subtitle: content?.page_subtitle || "Choose the perfect plan for your lawn. All plans include our innovative service approach and dedicated support team.",
    },
  });

  // Mutations
  const createPlanMutation = useMutation({
    mutationFn: async (data: PlanFormData) => {
      const response = await fetch("/api/admin/pricing/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing/plans"] });
      setShowPlanDialog(false);
      setEditingPlan(null);
      planForm.reset();
      toast({ title: "Success", description: "Plan created successfully" });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async (data: PlanFormData) => {
      if (!editingPlan) throw new Error("No plan selected for editing");
      const response = await fetch(`/api/admin/pricing/plans/${editingPlan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing/plans"] });
      setShowPlanDialog(false);
      setEditingPlan(null);
      planForm.reset();
      toast({ title: "Success", description: "Plan updated successfully" });
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async (data: ContentFormData) => {
      const response = await fetch("/api/admin/pricing/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing/content"] });
      setShowContentDialog(false);
      toast({ title: "Success", description: "Page content updated successfully" });
    },
  });

  // Feature management
  const addFeature = () => {
    const currentFeatures = planForm.getValues("features");
    planForm.setValue("features", [
      ...currentFeatures,
      { feature: "", included: true, sort_order: currentFeatures.length },
    ]);
  };

  const removeFeature = (index: number) => {
    const currentFeatures = planForm.getValues("features");
    planForm.setValue("features", currentFeatures.filter((_, i) => i !== index));
  };

  // Handle plan edit
  const handleEditPlan = (plan: PricingPlan) => {
    setEditingPlan(plan);
    planForm.reset({
      name: plan.name,
      price: plan.price,
      description: plan.description,
      billing_period: plan.billing_period,
      sort_order: plan.sort_order,
      features: plan.features.map(f => ({
        feature: f.feature,
        included: f.included,
        sort_order: f.sort_order,
      })),
    });
    setShowPlanDialog(true);
  };

  // Handle plan submission
  const handlePlanSubmit = (data: PlanFormData) => {
    if (editingPlan) {
      updatePlanMutation.mutate(data);
    } else {
      createPlanMutation.mutate(data);
    }
  };

  // Handle feature editing
  const handleEditFeatures = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setEditingFeatures([...plan.features].sort((a, b) => a.sort_order - b.sort_order));
    setShowFeatureEditDialog(true);
  };

  // Update feature status
  const updateFeatureStatus = (featureIndex: number, included: boolean) => {
    const updatedFeatures = [...editingFeatures];
    updatedFeatures[featureIndex].included = included;
    setEditingFeatures(updatedFeatures);
  };

  // Move feature up/down
  const moveFeature = (fromIndex: number, toIndex: number) => {
    const updatedFeatures = [...editingFeatures];
    const [movedFeature] = updatedFeatures.splice(fromIndex, 1);
    updatedFeatures.splice(toIndex, 0, movedFeature);
    
    // Update sort orders
    updatedFeatures.forEach((feature, index) => {
      feature.sort_order = index;
    });
    
    setEditingFeatures(updatedFeatures);
  };

  // Add new feature
  const addNewFeature = () => {
    const newFeature: PlanFeature = {
      id: Date.now(), // Temporary ID for new features
      feature: "",
      included: true,
      sort_order: editingFeatures.length,
      plan_id: editingPlan?.id || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEditingFeatures([...editingFeatures, newFeature]);
  };

  // Remove feature
  const removeFeatureFromList = (featureIndex: number) => {
    setEditingFeatures(editingFeatures.filter((_, index) => index !== featureIndex));
  };

  // Update feature text
  const updateFeatureText = (featureIndex: number, text: string) => {
    const updatedFeatures = [...editingFeatures];
    updatedFeatures[featureIndex].feature = text;
    setEditingFeatures(updatedFeatures);
  };

  // Save features mutation
  const saveFeaturesMutation = useMutation({
    mutationFn: async (features: PlanFeature[]) => {
      if (!editingPlan) throw new Error("No plan selected");
      
      const response = await fetch(`/api/admin/pricing/plans/${editingPlan.id}/features`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features }),
      });
      if (!response.ok) throw new Error("Failed to save features");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing/plans"] });
      setShowFeatureEditDialog(false);
      setEditingFeatures([]);
      setEditingPlan(null);
      toast({ title: "Success", description: "Features updated successfully" });
    },
  });

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Pricing Management</h2>
          <div className="flex gap-2">
            <Button onClick={() => setShowContentDialog(true)} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Edit Page Content
            </Button>
            <Button onClick={() => setShowPlanDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Plan
            </Button>
          </div>
        </div>

        {/* Plans List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pricing Plans</h3>
          {plansLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {plans?.map((plan, index) => (
                <Card key={plan.id} className={`p-4 ${index === 1 ? 'border-primary' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold">{plan.name}</h4>
                        {index === 1 && (
                          <Badge variant="default">Popular</Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold">${plan.price}/{plan.billing_period}</p>
                      <p className="text-muted-foreground mb-2">{plan.description}</p>
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Features:</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditFeatures(plan)}
                          >
                            <Pencil className="w-3 h-3 mr-1" />
                            Edit Features
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-sm">
                          {plan.features.map((feature) => (
                            <div key={feature.id} className={`flex items-center gap-1 ${feature.included ? 'text-green-600' : 'text-red-500'}`}>
                              {feature.included ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              {feature.feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditPlan(plan)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Badge variant="outline" className="text-xs">
                        Sort Order: {plan.sort_order}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Edit Plan" : "Add New Plan"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...planForm}>
            <form onSubmit={planForm.handleSubmit(handlePlanSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={planForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Essential Care" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={planForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder="149" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={planForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Perfect for standard residential lawns up to 5,000 sq ft" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={planForm.control}
                  name="billing_period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Period</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select billing period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="month">Monthly</SelectItem>
                          <SelectItem value="year">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={planForm.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Features Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel>Features</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                    Add Feature
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {planForm.watch("features").map((_, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <FormField
                        control={planForm.control}
                        name={`features.${index}.feature`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input {...field} placeholder="Feature description" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowPlanDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPlanMutation.isPending || updatePlanMutation.isPending}>
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Content Dialog */}
      <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Page Content</DialogTitle>
          </DialogHeader>
          
          <Form {...contentForm}>
            <form onSubmit={contentForm.handleSubmit((data) => updateContentMutation.mutate(data))} className="space-y-4">
              <FormField
                control={contentForm.control}
                name="page_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Simple, Transparent Pricing" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={contentForm.control}
                name="page_subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Subtitle</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Choose the perfect plan for your lawn..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowContentDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateContentMutation.isPending}>
                  Update Content
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Feature Editing Dialog */}
      <Dialog open={showFeatureEditDialog} onOpenChange={setShowFeatureEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Features for {editingPlan?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {editingFeatures.map((feature, index) => (
              <div key={feature.id} className="flex items-center gap-2 p-2 border rounded">
                <div className="cursor-move">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="flex-1">
                  <Input
                    value={feature.feature}
                    onChange={(e) => updateFeatureText(index, e.target.value)}
                    placeholder="Feature description"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={feature.included ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFeatureStatus(index, !feature.included)}
                  >
                    {feature.included ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Included
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 mr-1" />
                        Excluded
                      </>
                    )}
                  </Button>
                  
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveFeature(index, Math.max(0, index - 1))}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveFeature(index, Math.min(editingFeatures.length - 1, index + 1))}
                      disabled={index === editingFeatures.length - 1}
                    >
                      ↓
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFeatureFromList(index)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={addNewFeature}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Feature
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowFeatureEditDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => saveFeaturesMutation.mutate(editingFeatures)}
                disabled={saveFeaturesMutation.isPending}
              >
                Save Features
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}