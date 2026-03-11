"use client";

import { useState, useEffect } from "react";
import {
  useGetSellerDiscountsQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  useToggleDiscountStatusMutation,
  useGetProductsForDiscountQuery,
  useApplyDiscountToProductsMutation,
  useRemoveDiscountFromProductsMutation,
} from "@/services/api/sellerApi";
import { formatCurrency } from "@/utils/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Plus,
  Percent,
  IndianRupee,
  Edit,
  Trash2,
  AlertCircle,
  Copy,
  Check,
  Tag,
  Package,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface DiscountFormData {
  code: string;
  name: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

const initialFormData: DiscountFormData = {
  code: "",
  name: "",
  description: "",
  type: "percentage",
  value: 0,
  minOrderAmount: 0,
  maxDiscountAmount: undefined,
  usageLimit: undefined,
  isActive: true,
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
};

export default function DiscountsPage() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>(null);
  const [formData, setFormData] = useState<DiscountFormData>(initialFormData);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: discounts, isLoading, error } = useGetSellerDiscountsQuery({});
  const [createDiscount, { isLoading: isCreating }] = useCreateDiscountMutation();
  const [updateDiscount, { isLoading: isUpdating }] = useUpdateDiscountMutation();
  const [deleteDiscount, { isLoading: isDeleting }] = useDeleteDiscountMutation();
  const [toggleStatus] = useToggleDiscountStatusMutation();
  const [applyDiscount, { isLoading: isApplying }] = useApplyDiscountToProductsMutation();
  const [removeDiscount, { isLoading: isRemoving }] = useRemoveDiscountFromProductsMutation();

  // Fetch products when products dialog is open
  const { data: products, isLoading: isLoadingProducts } = useGetProductsForDiscountQuery(
    selectedDiscount?._id,
    { skip: !isProductsDialogOpen }
  );

  // Set selected products when products data loads
  useEffect(() => {
    if (products && isProductsDialogOpen) {
      const preSelected = products
        .filter((p: any) => p.isSelected)
        .map((p: any) => p._id);
      setSelectedProductIds(preSelected);
    }
  }, [products, isProductsDialogOpen]);

  const handleCreateDiscount = async () => {
    if (!formData.code || !formData.name || formData.value <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createDiscount({
        ...formData,
        maxDiscountAmount: formData.maxDiscountAmount || undefined,
        usageLimit: formData.usageLimit || undefined,
        endDate: formData.endDate || undefined,
      }).unwrap();

      toast({
        title: "Success",
        description: "Discount created successfully",
      });
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to create discount",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDiscount = async () => {
    if (!selectedDiscount || !formData.code || !formData.name || formData.value <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateDiscount({
        id: selectedDiscount._id,
        ...formData,
        maxDiscountAmount: formData.maxDiscountAmount || undefined,
        usageLimit: formData.usageLimit || undefined,
        endDate: formData.endDate || undefined,
      }).unwrap();

      toast({
        title: "Success",
        description: "Discount updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedDiscount(null);
      setFormData(initialFormData);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to update discount",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDiscount = async () => {
    if (!selectedDiscount) return;

    try {
      await deleteDiscount(selectedDiscount._id).unwrap();
      toast({
        title: "Success",
        description: "Discount deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedDiscount(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to delete discount",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (discountId: string) => {
    try {
      await toggleStatus(discountId).unwrap();
      toast({
        title: "Success",
        description: "Discount status updated",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const openProductsDialog = (discount: any) => {
    setSelectedDiscount(discount);
    setSelectedProductIds([]);
    setIsProductsDialogOpen(true);
  };

  const handleApplyDiscount = async () => {
    if (!selectedDiscount) return;

    try {
      if (selectedProductIds.length === 0) {
        // Remove discount from all products
        await removeDiscount(selectedDiscount._id).unwrap();
        toast({
          title: "Success",
          description: "Discount removed from all products",
        });
      } else {
        // Apply discount to selected products
        await applyDiscount({
          discountId: selectedDiscount._id,
          productIds: selectedProductIds,
        }).unwrap();
        toast({
          title: "Success",
          description: `Discount applied to ${selectedProductIds.length} product(s)`,
        });
      }
      setIsProductsDialogOpen(false);
      setSelectedDiscount(null);
      setSelectedProductIds([]);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to apply discount",
        variant: "destructive",
      });
    }
  };

  const toggleProductSelection = (productId: string, hasOtherDiscount: boolean) => {
    if (hasOtherDiscount) {
      toast({
        title: "Warning",
        description: "This product already has another discount applied. Selecting it will replace the existing discount.",
      });
    }
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const openEditDialog = (discount: any) => {
    setSelectedDiscount(discount);
    setFormData({
      code: discount.code,
      name: discount.name,
      description: discount.description || "",
      type: discount.type,
      value: discount.value,
      minOrderAmount: discount.minOrderAmount || 0,
      maxDiscountAmount: discount.maxDiscountAmount,
      usageLimit: discount.usageLimit,
      isActive: discount.isActive,
      startDate: discount.startDate ? new Date(discount.startDate).toISOString().split("T")[0] : "",
      endDate: discount.endDate ? new Date(discount.endDate).toISOString().split("T")[0] : "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (discount: any) => {
    setSelectedDiscount(discount);
    setIsDeleteDialogOpen(true);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getDiscountStatus = (discount: any) => {
    const now = new Date();
    const startDate = discount.startDate ? new Date(discount.startDate) : null;
    const endDate = discount.endDate ? new Date(discount.endDate) : null;

    if (!discount.isActive) return { label: "Inactive", variant: "secondary" as const };
    if (startDate && now < startDate) return { label: "Scheduled", variant: "outline" as const };
    if (endDate && now > endDate) return { label: "Expired", variant: "destructive" as const };
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return { label: "Limit Reached", variant: "destructive" as const };
    }
    return { label: "Active", variant: "default" as const };
  };

  if (isLoading) {
    return <DiscountsLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-[1600px]">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to load discounts</h2>
            <p className="text-muted-foreground">
              There was an error loading your discounts. Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-[1600px] space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Discounts</h1>
          <p className="text-muted-foreground">
            Create and manage discount codes for your customers
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Create Discount
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Discounts</p>
                <p className="text-2xl font-bold tracking-tight">{discounts?.length || 0}</p>
              </div>
              <div className="rounded-lg bg-muted p-2.5">
                <Tag className="size-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Active Discounts</p>
                <p className="text-2xl font-bold tracking-tight">
                  {discounts?.filter((d: any) => d.isActive).length || 0}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-2.5">
                <Check className="size-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Uses</p>
                <p className="text-2xl font-bold tracking-tight">
                  {discounts?.reduce((sum: number, d: any) => sum + (d.usedCount || 0), 0) || 0}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-2.5">
                <Percent className="size-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Discounts</CardTitle>
          <CardDescription>
            Manage your discount codes and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!discounts || discounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No discounts yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first discount code to attract more customers
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Create Discount
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discounts.map((discount: any) => {
                    const status = getDiscountStatus(discount);
                    return (
                      <TableRow key={discount._id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                              {discount.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 cursor-pointer"
                              onClick={() => copyCode(discount.code)}
                            >
                              {copiedCode === discount.code ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{discount.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {discount.type === "percentage" ? (
                              <Percent className="h-3 w-3 mr-1" />
                            ) : (
                              <IndianRupee className="h-3 w-3 mr-1" />
                            )}
                            {discount.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {discount.type === "percentage"
                            ? `${discount.value}%`
                            : formatCurrency(discount.value)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer h-auto py-1 px-2"
                            onClick={() => openProductsDialog(discount)}
                          >
                            <Package className="h-3 w-3 mr-1" />
                            {discount.applicableProducts?.length || 0}
                          </Button>
                        </TableCell>
                        <TableCell>
                          {discount.usedCount || 0}
                          {discount.usageLimit ? ` / ${discount.usageLimit}` : ""}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={discount.isActive}
                            onCheckedChange={() => handleToggleStatus(discount._id)}
                            className="cursor-pointer"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => openEditDialog(discount)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950/30"
                              onClick={() => openDeleteDialog(discount)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedDiscount(null);
            setFormData(initialFormData);
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? "Edit Discount" : "Create New Discount"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen
                ? "Update your discount code settings"
                : "Create a new discount code for your customers"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g., SAVE20"
                  maxLength={20}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Summer Sale"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this discount..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "percentage" | "fixed") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage" className="cursor-pointer">Percentage (%)</SelectItem>
                    <SelectItem value="fixed" className="cursor-pointer">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value *</Label>
                <div className="relative">
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })
                    }
                    min={0}
                    max={formData.type === "percentage" ? 100 : undefined}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {formData.type === "percentage" ? "%" : "₹"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minOrderAmount">Min. Order Amount</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })
                  }
                  min={0}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDiscountAmount">Max. Discount Amount</Label>
                <Input
                  id="maxDiscountAmount"
                  type="number"
                  value={formData.maxDiscountAmount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  min={0}
                  placeholder="No limit"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input
                id="usageLimit"
                type="number"
                value={formData.usageLimit || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usageLimit: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                min={0}
                placeholder="Unlimited"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Active Status</p>
                <p className="text-sm text-muted-foreground">
                  Enable this discount for customers
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                className="cursor-pointer"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                setSelectedDiscount(null);
                setFormData(initialFormData);
              }}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              onClick={isEditDialogOpen ? handleUpdateDiscount : handleCreateDiscount}
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating
                ? "Saving..."
                : isEditDialogOpen
                ? "Update Discount"
                : "Create Discount"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Discount</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the discount &quot;{selectedDiscount?.name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDiscount}
              disabled={isDeleting}
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Apply to Products Dialog */}
      <Dialog
        open={isProductsDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsProductsDialogOpen(false);
            setSelectedDiscount(null);
            setSelectedProductIds([]);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply Discount to Products</DialogTitle>
            <DialogDescription>
              Select products to apply &quot;{selectedDiscount?.name}&quot; ({selectedDiscount?.code})
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isLoadingProducts ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !products || products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  Add some products first to apply discounts
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    {selectedProductIds.length} of {products.length} selected
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => setSelectedProductIds(products.map((p: any) => p._id))}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => setSelectedProductIds([])}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
                  {products.map((product: any) => (
                    <div
                      key={product._id}
                      className={`flex items-center gap-4 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedProductIds.includes(product._id) ? "bg-muted/30" : ""
                      }`}
                      onClick={() => toggleProductSelection(product._id, product.hasOtherDiscount)}
                    >
                      <Checkbox
                        checked={selectedProductIds.includes(product._id)}
                        onCheckedChange={() =>
                          toggleProductSelection(product._id, product.hasOtherDiscount)
                        }
                        className="cursor-pointer"
                      />
                      <div className="w-12 h-12 relative rounded-md overflow-hidden bg-muted shrink-0">
                        {product.productImages?.[0] ? (
                          <Image
                            src={product.productImages[0]}
                            alt={product.productName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.productName}</p>
                      </div>
                      {product.hasOtherDiscount && !product.isSelected && (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          Has discount
                        </Badge>
                      )}
                      {product.isSelected && (
                        <Badge variant="default" className="bg-emerald-600">
                          Applied
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                setIsProductsDialogOpen(false);
                setSelectedDiscount(null);
                setSelectedProductIds([]);
              }}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              onClick={handleApplyDiscount}
              disabled={isApplying || isRemoving || isLoadingProducts}
            >
              {isApplying || isRemoving ? "Applying..." : "Apply Discount"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

// Loading Skeleton
function DiscountsLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-[1600px] space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  );
}
