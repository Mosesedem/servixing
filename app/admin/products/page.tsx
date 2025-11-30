"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Image as ImageIcon,
  Edit,
} from "lucide-react";
import Image from "next/image";
import { ImageUpload } from "@/components/image-upload";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category: string;
  brand: string;
  model?: string;
  condition: string;
  stock: number;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "NGN",
    category: "",
    brand: "",
    model: "",
    condition: "new",
    stock: "",
    images: [] as string[],
    imageFiles: [] as File[],
    isActive: true,
  });

  const categories = [
    "smartphone",
    "laptop",
    "tablet",
    "watch",
    "audio",
    "desktop",
  ];

  const brands = [
    "Apple",
    "Samsung",
    "Dell",
    "HP",
    "Lenovo",
    "Asus",
    "Microsoft",
    "Google",
    "OnePlus",
    "Xiaomi",
    "Huawei",
    "Sony",
    "LG",
  ];

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, filterCategory, filterBrand, filterStatus]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterCategory) params.append("category", filterCategory);
      if (filterBrand) params.append("brand", filterBrand);
      if (filterStatus) params.append("status", filterStatus);

      const response = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let imageUrls = formData.images;

      // Upload new images if any
      if (formData.imageFiles.length > 0) {
        const formDataUpload = new FormData();
        formData.imageFiles.forEach((file) => {
          formDataUpload.append("images", file);
        });

        const uploadResponse = await fetch("/api/admin/products/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrls = [...imageUrls, ...uploadData.data.urls];
        } else {
          const errorData = await uploadResponse.json();
          setError(errorData.error?.message || "Failed to upload images");
          return;
        }
      }

      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: imageUrls,
      };

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        fetchProducts();
        setDialogOpen(false);
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      currency: "NGN",
      category: "",
      brand: "",
      model: "",
      condition: "new",
      stock: "",
      images: [],
      imageFiles: [],
      isActive: true,
    });
    setCustomCategory("");
    setCustomBrand("");
    setEditingProduct(null);
    setError(null);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      currency: product.currency,
      category: product.category,
      brand: product.brand,
      model: product.model || "",
      condition: product.condition,
      stock: product.stock.toString(),
      images: product.images,
      imageFiles: [],
      isActive: product.isActive,
    });
    setCustomCategory(
      categories.includes(product.category) ? "" : product.category
    );
    setCustomBrand(brands.includes(product.brand) ? "" : product.brand);
    setDialogOpen(true);
  };

  const addImageUrl = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }));
  };

  const updateImageUrl = (index: number, url: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? url : img)),
    }));
  };

  const removeImageUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedProducts.length} products?`
      )
    )
      return;

    setBulkLoading(true);
    try {
      await Promise.all(
        selectedProducts.map((id) =>
          fetch(`/api/admin/products/${id}`, { method: "DELETE" })
        )
      );
      fetchProducts();
      setSelectedProducts([]);
    } catch (error) {
      console.error("Failed to delete products:", error);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    setBulkLoading(true);
    try {
      await Promise.all(
        selectedProducts.map((id) =>
          fetch(`/api/admin/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive }),
          })
        )
      );
      fetchProducts();
      setSelectedProducts([]);
    } catch (error) {
      console.error("Failed to update products:", error);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, id]);
    } else {
      setSelectedProducts((prev) => prev.filter((p) => p !== id));
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to update product status:", error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category *
                  </label>
                  <Select
                    value={
                      categories.includes(formData.category)
                        ? formData.category
                        : "other"
                    }
                    onValueChange={(value) => {
                      if (value === "other") {
                        setFormData((prev) => ({
                          ...prev,
                          category: customCategory,
                        }));
                      } else {
                        setFormData((prev) => ({ ...prev, category: value }));
                        setCustomCategory("");
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.category !== "" &&
                    !categories.includes(formData.category) && (
                      <Input
                        value={formData.category}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }));
                          setCustomCategory(e.target.value);
                        }}
                        placeholder="Enter custom category"
                        className="mt-2"
                      />
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Brand *
                  </label>
                  <Select
                    value={
                      brands.includes(formData.brand) ? formData.brand : "other"
                    }
                    onValueChange={(value) => {
                      if (value === "other") {
                        setFormData((prev) => ({
                          ...prev,
                          brand: customBrand,
                        }));
                      } else {
                        setFormData((prev) => ({ ...prev, brand: value }));
                        setCustomBrand("");
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.brand !== "" &&
                    !brands.includes(formData.brand) && (
                      <Input
                        value={formData.brand}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            brand: e.target.value,
                          }));
                          setCustomBrand(e.target.value);
                        }}
                        placeholder="Enter custom brand"
                        className="mt-2"
                      />
                    )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Model
                  </label>
                  <Input
                    value={formData.model}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        model: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Condition
                  </label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, condition: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="refurbished">Refurbished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stock *
                  </label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stock: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Images</label>
                <ImageUpload
                  value={formData.imageFiles}
                  onChange={(files) =>
                    setFormData((prev) => ({ ...prev, imageFiles: files }))
                  }
                  maxFiles={10}
                  maxSize={5}
                />
                {formData.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Existing Images:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {formData.images.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <Image
                              src={url}
                              alt={`Existing ${index + 1}`}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                images: prev.images.filter(
                                  (_, i) => i !== index
                                ),
                              }))
                            }
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editingProduct
                    ? "Update"
                    : "Create"}{" "}
                  Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterBrand} onValueChange={setFilterBrand}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm("");
            setFilterCategory("");
            setFilterBrand("");
            setFilterStatus("");
            fetchProducts();
          }}
        >
          <Filter className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="mb-4 flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleBulkStatusUpdate(true)}
            disabled={bulkLoading}
          >
            {bulkLoading
              ? "Processing..."
              : `Activate Selected (${selectedProducts.length})`}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleBulkStatusUpdate(false)}
            disabled={bulkLoading}
          >
            {bulkLoading
              ? "Processing..."
              : `Deactivate Selected (${selectedProducts.length})`}
          </Button>
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={bulkLoading}
          >
            {bulkLoading
              ? "Deleting..."
              : `Delete Selected (${selectedProducts.length})`}
          </Button>
        </div>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={
                    selectedProducts.length === products.length &&
                    products.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) =>
                      handleSelectProduct(product.id, e.target.checked)
                    }
                  />
                </TableCell>
                <TableCell>
                  {product.images[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="object-cover rounded"
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.brand}</TableCell>
                <TableCell>₦{product.price.toLocaleString()}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleToggleStatus(product.id, product.isActive)
                      }
                    >
                      {product.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
