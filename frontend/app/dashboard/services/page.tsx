"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { toast } from "react-toastify";
import { Plus, X } from "lucide-react";

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

      const res = await fetch(`/api/v1/services?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        let list: Service[] = json.data || [];
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
  }, [activeCategory, debouncedSearch, page, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, debouncedSearch]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handlePostService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingService(true);
    try {
      const price = parseFloat(formData.basePrice);
      if (isNaN(price) || price <= 0) {
        toast.error("Please enter a valid price");
        setSubmittingService(false);
        return;
      }

      const res = await fetch("/api/v1/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {isPro ? "Job Marketplace & Service Catalog" : "Browse Services"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isPro
              ? "Manage your service offerings or explore available customer jobs."
              : "Find and book verified home maintenance professionals in Nepal."}
          </p>
        </div>
        {isPro && (
          <button
            onClick={() => setPostModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-blue-500/20 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Post New Service
          </button>
        )}
      </div>

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
          {total} service{total !== 1 ? "s" : ""} found
          {activeCategory !== "all" ? ` in "${activeCategory.replace("_", " ")}"` : ""}
          {debouncedSearch ? ` for "${debouncedSearch}"` : ""}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)
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
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
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
            <CreateServiceForm onSuccess={() => { setPostModalOpen(false); toast.success("Service posted!"); fetchServices(); }} />
          </div>
        </div>
      )}
    </div>
  );
}
