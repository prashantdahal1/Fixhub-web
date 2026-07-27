"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Eye, Trash2, Edit3, MoreVertical, X, Lock, Image, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/AuthContext";
import ConfirmModal from "../../shared/ConfirmModal";

interface Service {
  _id: string;
  professionalId?:
    | string
    | {
        firstName: string;
        lastName: string;
        email: string;
      };
  title: string;
  description: string;
  category: string;
  shortDescription: string;
  basePrice: number;
  priceUnit: string;
  imageUrl?: string;
  imageUrls?: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
}

interface ProfessionalOption {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}



export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [professionals, setProfessionals] = useState<ProfessionalOption[]>([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const { user } = useAuth();

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (search) params.set("search", search);
      if (filterCategory !== "all") params.set("category", filterCategory);

      const res = await fetch(`/api/v1/services?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        let list: Service[] = json.data || [];
        if (sortBy === "newest") {
          list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortBy === "rating") {
          list = [...list].sort((a, b) => b.rating - a.rating);
        } else if (sortBy === "price_asc") {
          list = [...list].sort((a, b) => a.basePrice - b.basePrice);
        }
        setServices(list);
      }
    } catch (err) {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, sortBy]);

  const fetchProfessionals = useCallback(async () => {
    setLoadingProfessionals(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/v1/admin/users?role=professional&size=100`, {
        headers,
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProfessionals(json.data);
      }
    } catch (err) {
      toast.error('Failed to load professionals');
    } finally {
      setLoadingProfessionals(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchProfessionals();
  }, [fetchServices, fetchProfessionals]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(services.map(s => s._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Delete each service
      await Promise.all(
        selectedIds.map(id =>
          fetch(`/api/v1/services/${id}`, {
            method: 'DELETE',
            headers,
            credentials: 'include'
          })
        )
      );

      setServices(prev => prev.filter(s => !selectedIds.includes(s._id)));
      setSelectedIds([]);
      setShowBulkDeleteModal(false);
      toast.success(`${selectedIds.length} service${selectedIds.length !== 1 ? 's' : ''} deleted successfully`);
    } catch (err) {
      toast.error("Failed to delete services");
    } finally {
      setIsDeleting(false);
    }
  };

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [singleDeleteTargetId, setSingleDeleteTargetId] = useState<string | null>(null);

  const handleDeleteService = (id: string) => {
    setSingleDeleteTargetId(id);
  };

  const confirmSingleDelete = async () => {
    if (!singleDeleteTargetId) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/v1/services/${singleDeleteTargetId}`, { method: 'DELETE', headers, credentials: 'include' });
      if (!res.ok) {
        toast.error('Failed to delete service');
        return;
      }
      setServices(prev => prev.filter(s => s._id !== singleDeleteTargetId));
      setSelectedIds(prev => prev.filter(i => i !== singleDeleteTargetId));
      toast.success('Service deleted');
    } catch (err) {
      toast.error('Failed to delete service');
    } finally {
      setSingleDeleteTargetId(null);
    }
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setShowEditModal(true);
  };

  const handleCreateService = async (serviceData: {
    title: string;
    description: string;
    shortDescription: string;
    basePrice: number;
    priceUnit: string;
    category: string;
    professionalId?: string;
    imageFiles?: File[];
  }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const formData = new FormData();
      formData.append('title', serviceData.title);
      formData.append('description', serviceData.description);
      formData.append('shortDescription', serviceData.shortDescription);
      formData.append('basePrice', String(serviceData.basePrice));
      formData.append('priceUnit', serviceData.priceUnit);
      formData.append('category', serviceData.category);
      if (serviceData.professionalId) {
        formData.append('professionalId', serviceData.professionalId);
      }
      if (serviceData.imageFiles && serviceData.imageFiles.length > 0) {
        serviceData.imageFiles.slice(0, 4).forEach((file) => {
          formData.append('images', file);
        });
      }

      const res = await fetch('/api/v1/services', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) {
        toast.error('Failed to create service');
        return;
      }
      const json = await res.json();
      const created = json.data as Service;
      setServices(prev => [created, ...prev]);
      setShowAddModal(false);
      toast.success('Service created successfully');
    } catch (err) {
      toast.error('Failed to create service');
    }
  };

  const handleEditSave = async (updated: Service, imageFiles?: File[] | null, removeCurrentImage = false) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      if (removeCurrentImage && (!imageFiles || imageFiles.length === 0)) {
        const deleteRes = await fetch(`/api/v1/services/${updated._id}/image`, {
          method: 'DELETE',
          headers,
          credentials: 'include',
        });
        if (!deleteRes.ok) {
          toast.error('Failed to remove existing image');
          return;
        }
      }

      const formData = new FormData();
      formData.append('title', updated.title);
      formData.append('description', updated.description);
      formData.append('shortDescription', updated.shortDescription);
      formData.append('basePrice', String(updated.basePrice));
      formData.append('priceUnit', updated.priceUnit);
      formData.append('category', updated.category);
      if (updated.professionalId) {
        formData.append('professionalId', normalizeProfessionalId(updated.professionalId));
      }
      formData.append('removeCurrentImages', String(removeCurrentImage));
      if (imageFiles && imageFiles.length > 0) {
        imageFiles.slice(0, 4).forEach((file) => {
          formData.append('images', file);
        });
      }

      const res = await fetch(`/api/v1/services/${updated._id}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) {
        toast.error('Failed to update service');
        return;
      }
      const json = await res.json();
      const updatedService = json.data as Service;
      setServices(prev => prev.map(s => (s._id === updated._id ? updatedService : s)));
      setShowEditModal(false);
      setEditingService(null);
      toast.success('Service updated');
    } catch (err) {
      toast.error('Failed to update service');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Services Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all services posted on the platform</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </button>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm font-semibold">
                <span>{selectedIds.length} selected</span>
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-red-400 hover:text-red-600 p-0.5 rounded hover:bg-red-100/50 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        >
          <option value="all">All Categories</option>
          <option value="electrician">Electrician</option>
          <option value="plumber">Plumber</option>
          <option value="ac_repair">AC Repair</option>
          <option value="painter">Painter</option>
          <option value="carpenter">Carpenter</option>
          <option value="cleaner">Cleaner</option>
          <option value="geyser">Geyser</option>
          <option value="appliance_repair">Appliance Repair</option>
          <option value="pest_control">Pest Control</option>
          <option value="other">Other</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        >
          <option value="newest">Newest</option>
          <option value="rating">Highest Rated</option>
          <option value="price_asc">Price (Low to High)</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === services.length && services.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Service</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Provider</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Rating</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Posted</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-500">
                    Loading services...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-500">
                    No services found
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(service._id)}
                        onChange={() => handleSelectOne(service._id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                          {service.imageUrls?.[0] || service.imageUrl ? (
                            <img src={service.imageUrls?.[0] || service.imageUrl} alt={service.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400">
                              <Image className="h-5 w-5" />
                              <span className="text-[10px] mt-1">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-950 truncate">{service.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{service.shortDescription}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">
                        {typeof service.professionalId === "object" && service.professionalId ? `${service.professionalId.firstName} ${service.professionalId.lastName}` : "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                        {service.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        Rs {service.basePrice.toLocaleString()}
                        {service.priceUnit === 'per_hour' ? (
                          <span className="text-slate-500 font-normal text-xs"> /hr</span>
                        ) : service.priceUnit === 'per_sqft' ? (
                          <span className="text-slate-500 font-normal text-xs"> /sqft</span>
                        ) : null}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-slate-900">{service.rating.toFixed(1)}</span>
                        <span className="text-xs text-slate-500">({service.reviewCount})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500">
                        {new Date(service.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="relative inline-flex">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === service._id ? null : service._id)}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                          aria-label="Open service actions"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>

                        {openMenuId === service._id && (
                          <div className="absolute right-0 top-full mt-2 w-36 rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/30 z-20">
                            <button
                              type="button"
                              onClick={() => { openEdit(service); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Edit3 className="h-4 w-4 text-slate-500" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => { handleDeleteService(service._id); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedIds.length} service${selectedIds.length !== 1 ? 's' : ''}?`}
        message="This action cannot be undone. These services will be permanently removed from the platform."
        confirmText="Delete All"
        cancelText="Cancel"
        variant="danger"
      />
      <ConfirmModal
        isOpen={!!singleDeleteTargetId}
        onClose={() => setSingleDeleteTargetId(null)}
        onConfirm={confirmSingleDelete}
        title="Delete Service?"
        message="Are you sure you want to delete this service? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
      {showEditModal && editingService && (
        <EditServiceModal
          service={editingService}
          professionals={professionals}
          onClose={() => { setShowEditModal(false); setEditingService(null); }}
          onSave={handleEditSave}
        />
      )}
      {showAddModal && (
        <AddServiceModal
          professionals={professionals}
          onClose={() => setShowAddModal(false)}
          onSave={handleCreateService}
        />
      )}
    </div>
  );
}

function normalizeProfessionalId(raw: unknown): string {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && raw !== null && "_id" in raw) {
    return (raw as any)._id ?? "";
  }
  return String(raw);
}

function EditServiceModal({ service, professionals, onClose, onSave }: { service: Service; professionals: ProfessionalOption[]; onClose: () => void; onSave: (s: Service, imageFiles?: File[] | null, removeCurrentImages?: boolean) => void }) {
  const [title, setTitle] = useState(service.title);
  const [description, setDescription] = useState(service.description || "");
  const [shortDescription, setShortDescription] = useState(service.shortDescription);
  const [basePrice, setBasePrice] = useState(service.basePrice);
  const [priceUnit, setPriceUnit] = useState(service.priceUnit);
  const [category, setCategory] = useState(service.category);
  const [professionalId, setProfessionalId] = useState(normalizeProfessionalId(service.professionalId));
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>(service.imageUrls?.slice(0, 4) || (service.imageUrl ? [service.imageUrl] : []));
  const [removeCurrentImages, setRemoveCurrentImages] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const limitedFiles = files.slice(0, 4);
    setImageFiles(limitedFiles);
    setRemoveCurrentImages(false);
    setImagePreview(limitedFiles.map((file) => URL.createObjectURL(file)));
    // Auto-suggest service details from first image (progressive enhancement)
    if (limitedFiles.length > 0) {
      const first = limitedFiles[0];
      const fd = new FormData();
      fd.append('image', first);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      fetch('/api/v1/admin/service-suggest', { method: 'POST', body: fd, credentials: 'include', headers })
        .then((r) => r.json())
        .then((json) => {
          if (json && json.success && json.data?.suggested) {
            const s = json.data.suggested;
            if (!title) setTitle(s.title || title);
            if (!description) setDescription(s.shortDescription || description);
            if (!shortDescription) setShortDescription(s.shortDescription || shortDescription);
            if (s.category) setCategory(s.category);
            if (s.basePrice) setBasePrice(s.basePrice);
            if (s.priceUnit) setPriceUnit(s.priceUnit);
          }
        })
        .catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Edit Service</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Image</label>
            <div className="mb-3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 h-44 w-full flex items-center justify-center">
              {imagePreview.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 w-full h-full p-2">
                  {imagePreview.map((src, index) => (
                    <div key={index} className="relative overflow-hidden rounded-2xl bg-slate-100">
                      <img src={src} alt={`${title || service.title} ${index + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFiles((prev) => prev.filter((_, i) => i !== index));
                          setImagePreview((prev) => prev.filter((_, i) => i !== index));
                        }}
                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center text-xs"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Image className="h-5 w-5" />
                  <span className="text-xs">Choose up to 4 images</span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {service.imageUrls?.length || service.imageUrl ? (
              <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={removeCurrentImages}
                  onChange={(e) => setRemoveCurrentImages(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Remove existing service images when saving
              </label>
            ) : null}
            <p className="text-xs text-slate-400 mt-1">You can upload up to 4 images.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Short Description</label>
            <textarea value={shortDescription} onChange={e => setShortDescription(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
          </div>
            <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Base Price (NPR)</label>
              <input type="number" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Price Unit</label>
              <select value={priceUnit} onChange={e => setPriceUnit(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900">
                <option value="flat">Flat</option>
                <option value="per_hour">Per Hour</option>
                <option value="per_sqft">Per Sqft</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Assigned Professional</label>
            <select value={professionalId} onChange={e => setProfessionalId(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900">
              <option value="">Unassigned</option>
              {professionals.map((pro) => (
                <option key={pro._id} value={pro._id}>
                  {pro.firstName} {pro.lastName} ({pro.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900">
              <option value="electrician">Electrician</option>
              <option value="plumber">Plumber</option>
              <option value="ac_repair">AC Repair</option>
              <option value="painter">Painter</option>
              <option value="carpenter">Carpenter</option>
              <option value="cleaner">Cleaner</option>
              <option value="geyser">Geyser</option>
              <option value="appliance_repair">Appliance Repair</option>
              <option value="pest_control">Pest Control</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
          <button
            onClick={() => onSave(
              {
                ...service,
                title,
                description,
                shortDescription,
                basePrice,
                priceUnit,
                category,
                professionalId: professionalId || service.professionalId,
              },
              imageFiles.length > 0 ? imageFiles : null,
              removeCurrentImages
            )}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function AddServiceModal({
  professionals,
  onClose,
  onSave,
}: {
  professionals: ProfessionalOption[];
  onClose: () => void;
  onSave: (serviceData: {
    title: string;
    description: string;
    shortDescription: string;
    basePrice: number;
    priceUnit: string;
    category: string;
    professionalId?: string;
    imageFiles?: File[];
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [basePrice, setBasePrice] = useState(0);
  const [priceUnit, setPriceUnit] = useState("flat");
  const [category, setCategory] = useState("electrician");
  const [professionalId, setProfessionalId] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const limitedFiles = files.slice(0, 4);
    setImageFiles(limitedFiles);
    setImagePreview(limitedFiles.map((file) => URL.createObjectURL(file)));
    // Auto-suggest for Add modal as well
    if (limitedFiles.length > 0) {
      const first = limitedFiles[0];
      const fd = new FormData();
      fd.append('image', first);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      fetch('/api/v1/admin/service-suggest', { method: 'POST', body: fd, credentials: 'include', headers })
        .then((r) => r.json())
        .then((json) => {
          if (json && json.success && json.data?.suggested) {
            const s = json.data.suggested;
            if (!title) setTitle(s.title || title);
            if (!description) setDescription(s.shortDescription || description);
            if (!shortDescription) setShortDescription(s.shortDescription || shortDescription);
            if (s.category) setCategory(s.category);
            if (s.basePrice) setBasePrice(s.basePrice);
            if (s.priceUnit) setPriceUnit(s.priceUnit);
          }
        })
        .catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Add Service</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Image</label>
            <div className="mb-3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 h-44 w-full flex items-center justify-center">
              {imagePreview.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 w-full h-full p-2">
                  {imagePreview.map((src, index) => (
                    <div key={index} className="relative overflow-hidden rounded-2xl bg-slate-100">
                      <img src={src} alt={`${title || "New service"} ${index + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFiles((prev) => prev.filter((_, i) => i !== index));
                          setImagePreview((prev) => prev.filter((_, i) => i !== index));
                        }}
                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center text-xs"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Image className="h-5 w-5" />
                  <span className="text-xs">Upload up to 4 images</span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-slate-400 mt-1">You can upload up to 4 images.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Short Description</label>
            <textarea value={shortDescription} onChange={e => setShortDescription(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Base Price (NPR)</label>
              <input type="number" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Price Unit</label>
              <select value={priceUnit} onChange={e => setPriceUnit(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900">
                <option value="flat">Flat</option>
                <option value="per_hour">Per Hour</option>
                <option value="per_sqft">Per Sqft</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Assigned Professional</label>
            <select value={professionalId} onChange={e => setProfessionalId(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900">
              <option value="">Unassigned</option>
              {professionals.map((pro) => (
                <option key={pro._id} value={pro._id}>
                  {pro.firstName} {pro.lastName} ({pro.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900">
              <option value="electrician">Electrician</option>
              <option value="plumber">Plumber</option>
              <option value="ac_repair">AC Repair</option>
              <option value="painter">Painter</option>
              <option value="carpenter">Carpenter</option>
              <option value="cleaner">Cleaner</option>
              <option value="geyser">Geyser</option>
              <option value="appliance_repair">Appliance Repair</option>
              <option value="pest_control">Pest Control</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
          <button
            onClick={() => onSave({ title, description, shortDescription, basePrice, priceUnit, category, professionalId: professionalId || undefined, imageFiles })}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create Service
          </button>
        </div>
      </div>
    </div>
  );
}
