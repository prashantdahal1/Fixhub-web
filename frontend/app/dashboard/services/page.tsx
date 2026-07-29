"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Plus, X, Edit3, Trash2 } from "lucide-react";
import ConfirmModal from "@/components/shared/ConfirmModal";
import CreateServiceForm from "@/components/dashboard/services/CreateServiceForm";

type PriceUnit = "flat" | "per_hour" | "per_sqft";
type ServiceCategory =
  | "electrician" | "plumber" | "ac_repair" | "painter"
  | "carpenter" | "cleaner" | "geyser" | "appliance_repair"
  | "pest_control" | "other";

interface Service {
  _id: string;
  title: string;
  slug: string;
  category: ServiceCategory;
  shortDescription: string;
  basePrice: number;
  priceUnit: PriceUnit;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  isCertified: boolean;
  estimatedDuration: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  professionalId?:
    | string
    | {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
      };
}

const CATEGORIES: { value: ServiceCategory | "all"; label: string }[] = [
  { value: "all", label: "All Services" },
  { value: "electrician", label: "Electrician" },
  { value: "plumber", label: "Plumber" },
  { value: "ac_repair", label: "AC Repair" },
  { value: "painter", label: "Painter" },
  { value: "carpenter", label: "Carpenter" },
  { value: "cleaner", label: "Cleaning" },
  { value: "geyser", label: "Geyser" },
  { value: "appliance_repair", label: "Appliance Repair" },
  { value: "pest_control", label: "Pest Control" },
];

const PRICE_UNIT_LABEL: Record<PriceUnit, string> = {
  flat: "flat",
  per_hour: "/hr",
  per_sqft: "/sqft",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="11" height="11" viewBox="0 0 24 24" fill={n <= Math.round(rating) ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="1.75">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function formatCategoryLabel(category: ServiceCategory | string) {
  return category.replace(/_/g, " ");
}

function ServiceCard({ service }: { service: Service }) {
  const fallbackGradients: Record<ServiceCategory, string> = {
    electrician: "linear-gradient(135deg,#1e3a8a,#2563eb)",
    plumber: "linear-gradient(135deg,#164e63,#0891b2)",
    ac_repair: "linear-gradient(135deg,#134e4a,#0d9488)",
    painter: "linear-gradient(135deg,#4c1d95,#7c3aed)",
    carpenter: "linear-gradient(135deg,#78350f,#d97706)",
    cleaner: "linear-gradient(135deg,#065f46,#10b981)",
    geyser: "linear-gradient(135deg,#7f1d1d,#ef4444)",
    appliance_repair: "linear-gradient(135deg,#1e3a8a,#3b82f6)",
    pest_control: "linear-gradient(135deg,#365314,#65a30d)",
    other: "linear-gradient(135deg,#374151,#6b7280)",
  };

  return (
    <Link href={`/dashboard/services/${service.slug}`} className="group block">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col h-full">
        <div
          className="h-40 relative flex items-end p-4"
          style={{
            background: service.imageUrl
              ? `url(${service.imageUrl}) center/cover no-repeat`
              : fallbackGradients[service.category],
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {service.isCertified && (
            <span className="relative z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 select-none">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="#2563eb" stroke="none">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              FixHub Certified
            </span>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1 gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              {service.category.replace("_", " ")}
            </p>
            <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
              {service.title}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
              {service.shortDescription}
            </p>
          </div>

          <div className="flex items-center gap-1.5 mt-auto">
            <StarRating rating={service.rating} />
            <span className="text-[11px] font-semibold text-slate-700">{service.rating.toFixed(1)}</span>
            <span className="text-[11px] text-slate-400">({service.reviewCount})</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Starting from</p>
              <p className="text-base font-extrabold text-slate-900">
                Rs {service.basePrice.toLocaleString()}
                <span className="text-xs font-medium text-slate-400 ml-1">{PRICE_UNIT_LABEL[service.priceUnit]}</span>
              </p>
            </div>
            <span className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
              {service.estimatedDuration}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProfessionalServiceCard({
  service,
  onEdit,
  onDelete,
}: {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
}) {
  const fallbackGradients: Record<ServiceCategory, string> = {
    electrician: "linear-gradient(135deg,#1e3a8a,#2563eb)",
    plumber: "linear-gradient(135deg,#164e63,#0891b2)",
    ac_repair: "linear-gradient(135deg,#134e4a,#0d9488)",
    painter: "linear-gradient(135deg,#4c1d95,#7c3aed)",
    carpenter: "linear-gradient(135deg,#78350f,#d97706)",
    cleaner: "linear-gradient(135deg,#065f46,#10b981)",
    geyser: "linear-gradient(135deg,#7f1d1d,#ef4444)",
    appliance_repair: "linear-gradient(135deg,#1e3a8a,#3b82f6)",
    pest_control: "linear-gradient(135deg,#365314,#65a30d)",
    other: "linear-gradient(135deg,#374151,#6b7280)",
  };

  return (
    <div className="group bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col h-full">
      <div
        className="h-36 relative flex items-start justify-between p-3.5"
        style={{
          background: service.imageUrl
            ? `url(${service.imageUrl}) center/cover no-repeat`
            : fallbackGradients[service.category],
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />
        
        <div className="relative z-10 flex items-center gap-1.5 flex-wrap">
          <span className="bg-slate-900/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded-lg border border-white/20 select-none">
            {formatCategoryLabel(service.category)}
          </span>
          {service.isCertified && (
            <span className="flex items-center gap-1 bg-blue-600/90 backdrop-blur-md text-[10px] font-bold text-white px-2.5 py-1 rounded-lg border border-blue-400/40 select-none">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="none">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              Certified
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
            {service.title}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
            {service.shortDescription || "No service description added yet."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 mt-auto">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Starting price</p>
            <p className="text-xs font-extrabold text-slate-900 mt-0.5">
              Rs {service.basePrice.toLocaleString()}
              <span className="text-[10px] font-medium text-slate-500 ml-0.5">{PRICE_UNIT_LABEL[service.priceUnit]}</span>
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Duration</p>
            <p className="text-xs font-bold text-slate-800 mt-0.5">{service.estimatedDuration}</p>
          </div>
        </div>

        {/* Approval status badge */}
        {service.approvalStatus && service.approvalStatus !== "approved" && (
          <div className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold border ${
            service.approvalStatus === "pending"
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-rose-50 border-rose-200 text-rose-700"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              service.approvalStatus === "pending" ? "bg-amber-500" : "bg-rose-500"
            }`} />
            {service.approvalStatus === "pending"
              ? "Under Review — awaiting admin approval"
              : `Rejected${service.rejectionReason ? `: ${service.rejectionReason}` : ""}`
            }
          </div>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 mt-1">
          <div className="flex items-center gap-1.5">
            <StarRating rating={service.rating} />
            <span className="text-[11px] font-bold text-slate-800">{service.rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-400">({service.reviewCount})</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Only allow edit/delete for approved or pending (not rejected) */}
            <button
              type="button"
              onClick={() => onEdit(service)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600 transition-all shadow-xs"
            >
              <Edit3 className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(service._id)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200/80 bg-rose-50/60 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition-all shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-40 bg-slate-100" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-slate-100 rounded w-1/4" />
        <div className="h-4 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
        <div className="h-px bg-slate-100 mt-2" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 bg-slate-100 rounded w-1/3" />
          <div className="h-5 bg-slate-100 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}



import { useAuth } from "../../../contexts/AuthContext";

export default function ServicesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") as ServiceCategory | null;

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">(categoryParam || "all");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    shortDescription: "",
    basePrice: 0,
    priceUnit: "flat" as PriceUnit,
    category: "electrician" as ServiceCategory,
  });
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const LIMIT = 12;

  // Post Service Modal state
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [submittingService, setSubmittingService] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "electrician" as ServiceCategory,
    shortDescription: "",
    basePrice: "",
    priceUnit: "flat" as PriceUnit,
    estimatedDuration: "1-2 hours",
  });

  const isPro = user?.role === "professional";

  const getServiceOwnerId = (service: Service) => {
    if (!service.professionalId) return null;
    if (typeof service.professionalId === "string") return service.professionalId;
    return service.professionalId._id || service.professionalId.toString?.();
  };

  const isOwnService = (service: Service) => {
    if (!isPro || !user?._id) return false;
    const ownerId = getServiceOwnerId(service);
    return ownerId === user._id || ownerId === (user as any).id;
  };

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (activeCategory !== "all") params.set("category", activeCategory);
      if (debouncedSearch) params.set("search", debouncedSearch);
      
      // For professionals, only show their own services
      if (isPro && user?._id) {
        params.set("professionalId", user._id);
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/v1/services?${params.toString()}`, {
        headers,
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        let list: Service[] = json.data || [];
        
        // Additional client-side filtering for professionals as safety check
        if (isPro && user?._id) {
          list = list.filter(service => {
            const serviceOwnerId = typeof service.professionalId === "string" 
              ? service.professionalId 
              : service.professionalId?._id;
            return serviceOwnerId === user._id;
          });
        }
        
        if (sortBy === "price_desc") {
          list = [...list].sort((a, b) => b.basePrice - a.basePrice);
        } else if (sortBy === "price_asc") {
          list = [...list].sort((a, b) => a.basePrice - b.basePrice);
        } else if (sortBy === "rating_desc") {
          list = [...list].sort((a, b) => b.rating - a.rating);
        }
        setServices(list);
        setTotal(json.meta?.total ?? 0);
      }
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, debouncedSearch, page, sortBy, isPro, user?._id]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, debouncedSearch]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openEditServiceModal = (service: Service) => {
    setEditingService(service);
    setEditForm({
      title: service.title,
      shortDescription: service.shortDescription,
      basePrice: service.basePrice,
      priceUnit: service.priceUnit,
      category: service.category,
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editingService) return;
    setIsProcessingAction(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/v1/services/${editingService._id}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          title: editForm.title,
          shortDescription: editForm.shortDescription,
          basePrice: editForm.basePrice,
          priceUnit: editForm.priceUnit,
          category: editForm.category,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.message || 'Failed to update service');
        return;
      }

      const json = await res.json();
      setServices((prev) => prev.map((service) => (service._id === editingService._id ? json.data : service)));
      setShowEditModal(false);
      setEditingService(null);
      toast.success('Service updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update service');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsProcessingAction(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/v1/services/${deleteTargetId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.message || 'Failed to delete service');
        return;
      }
      setServices((prev) => prev.filter((s) => s._id !== deleteTargetId));
      toast.success('Service deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete service');
    } finally {
      setDeleteTargetId(null);
      setIsProcessingAction(false);
    }
  };

  const handlePostService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.isVerified) {
      toast.error("Account verification required! Only verified professionals can post services. Please upload your National ID in Profile.");
      return;
    }
    setSubmittingService(true);
    try {
      const price = parseFloat(formData.basePrice);
      if (isNaN(price) || price <= 0) {
        toast.error("Please enter a valid price");
        setSubmittingService(false);
        return;
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch("/api/v1/services", {
        method: "POST",
        headers,
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          basePrice: price,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Service posted successfully!");
        setPostModalOpen(false);
        setFormData({
          title: "",
          category: "electrician",
          shortDescription: "",
          basePrice: "",
          priceUnit: "flat",
          estimatedDuration: "1-2 hours",
        });
        fetchServices();
      } else {
        toast.error(json.message || "Failed to post service");
      }
    } catch (err: any) {
      toast.error(err.message || "Error posting service");
    } finally {
      setSubmittingService(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const pendingCount = isPro ? services.filter(s => s.approvalStatus === "pending").length : 0;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {isPro ? "My Services" : "Browse Services"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isPro
              ? "Manage your service offerings. New listings need admin approval before going live."
              : "Find and book verified home maintenance professionals in Nepal."}
          </p>
        </div>
        {isPro && (
          <button
            onClick={() => {
              if (!user?.isVerified) {
                toast.error("Account verification required! Only verified professionals can post services. Please upload your National ID in Profile.");
                return;
              }
              setPostModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-blue-500/20 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Post New Service
          </button>
        )}
      </div>

      {/* Unverified Professional Warning Banner */}
      {isPro && !user?.isVerified && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-red-800">Verification Required to Post Services</p>
            <p className="text-[11px] text-red-700 mt-0.5 leading-relaxed">
              Your professional account is currently unverified. Only verified professionals can list services or accept jobs. Please navigate to <Link href="/dashboard/profile" className="font-semibold underline">Profile Settings</Link> to submit your National ID for verification.
            </p>
          </div>
        </div>
      )}

      {/* Pending approval banner for professionals */}
      {isPro && pendingCount > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-amber-800">{pendingCount} listing{pendingCount > 1 ? "s" : ""} under review</p>
            <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
              Your submission{pendingCount > 1 ? "s are" : " is"} pending admin approval. You'll get a notification once reviewed — usually within 24 hours.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>
        <div className="sm:w-56">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 font-medium transition-all"
          >
            <option value="popular">Sort by: Popular</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="rating_desc">Highest Rated</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              activeCategory === cat.value
                ? "bg-[#EFF6FF] text-[#2563EB] border-blue-200"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {!loading && (
        <p className="text-xs text-slate-400">
          {isPro ? services.filter(isOwnService).length : total} service{(isPro ? services.filter(isOwnService).length : total) !== 1 ? "s" : ""} found
          {activeCategory !== "all" ? ` in "${activeCategory.replace("_", " ")}"` : ""}
          {debouncedSearch ? ` for "${debouncedSearch}"` : ""}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)
          : isPro
          ? (services.filter(isOwnService).length > 0
              ? services.filter(isOwnService).map((service) => (
                  <ProfessionalServiceCard
                    key={service._id}
                    service={service}
                    onEdit={openEditServiceModal}
                    onDelete={(id) => setDeleteTargetId(id)}
                  />
                ))
              : (
                <div className="col-span-3 text-center py-16">
                  <p className="text-slate-400 text-sm font-medium">You haven’t posted any services yet.</p>
                  <p className="text-slate-400 text-xs mt-1">Use the button above to publish your first service and start receiving bookings.</p>
                </div>
              ))
          : services.length > 0
          ? services.map((s) => <ServiceCard key={s._id} service={s} />)
          : (
            <div className="col-span-3 text-center py-16">
              <p className="text-slate-400 text-sm font-medium">No services found.</p>
              <p className="text-slate-400 text-xs mt-1">Try a different category or search term.</p>
            </div>
          )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500 font-medium px-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* Backdrop Blur Modal for Post Service */}
      {postModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Post a New Service</h2>
                <p className="text-xs text-slate-500 mt-0.5">List your service on the FixHub catalog for local clients.</p>
              </div>
              <button
                onClick={() => setPostModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors text-sm font-bold shrink-0"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 custom-scrollbar">
              <CreateServiceForm onSuccess={() => { setPostModalOpen(false); toast.success("Service published!"); fetchServices(); }} />
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingService && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Edit Service</h2>
                <p className="text-xs text-slate-500 mt-0.5">Update your listing details and pricing.</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingService(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors text-sm font-bold shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Service title</label>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  placeholder="Example: Fast AC Repair"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea
                  value={editForm.shortDescription}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, shortDescription: e.target.value }))}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  placeholder="Describe what the customer can expect"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Base price</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.basePrice}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, basePrice: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pricing unit</label>
                  <select
                    value={editForm.priceUnit}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, priceUnit: e.target.value as PriceUnit }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  >
                    <option value="flat">Flat</option>
                    <option value="per_hour">Per hour</option>
                    <option value="per_sqft">Per sqft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value as ServiceCategory }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                >
                  {CATEGORIES.filter((item) => item.value !== "all").map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingService(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditSave}
                disabled={isProcessingAction}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {isProcessingAction ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete this service?"
        message="This will remove the listing from your profile and it will no longer be visible to customers."
        confirmText="Delete Service"
        cancelText="Keep It"
        variant="danger"
        isLoading={isProcessingAction}
      />
    </div>
  );
}
