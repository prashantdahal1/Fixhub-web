"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";

export default function CreateServiceForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    category: "electrician",
    description: "",
    shortDescription: "",
    basePrice: "",
    priceUnit: "flat",
    estimatedDuration: "1-2 hours",
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && key !== "image") {
          submitData.append(key, value as string);
        }
      });
      if (formData.image) {
        submitData.append("image", formData.image);
      }

      submitData.append("slug", formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));

      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || '';

      const response = await fetch("/api/v1/services", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create service");
      }

      toast.success("Service published successfully!");
      onSuccess();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Service Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Master AC Service & Repair"
            required
            className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          >
            <option value="electrician">Electrician</option>
            <option value="plumber">Plumber</option>
            <option value="ac_repair">AC Repair</option>
            <option value="painter">Painter</option>
            <option value="carpenter">Carpenter</option>
            <option value="cleaner">Cleaner</option>
            <option value="geyser">Geyser Repair</option>
            <option value="appliance_repair">Appliance Repair</option>
            <option value="pest_control">Pest Control</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Base Price (Rs)
          </label>
          <input
            type="number"
            name="basePrice"
            value={formData.basePrice}
            onChange={handleChange}
            placeholder="e.g. 1500"
            required
            min="0"
            className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Price Unit
          </label>
          <select
            name="priceUnit"
            value={formData.priceUnit}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          >
            <option value="flat">Flat Rate</option>
            <option value="per_hour">Per Hour</option>
            <option value="per_sqft">Per Sq. Ft.</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Est. Duration
          </label>
          <input
            type="text"
            name="estimatedDuration"
            value={formData.estimatedDuration}
            onChange={handleChange}
            placeholder="e.g. 1-2 hours"
            className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
          Short Description
        </label>
        <input
          type="text"
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleChange}
          placeholder="Brief summary shown on service card..."
          required
          maxLength={180}
          className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
          Detailed Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Full breakdown of scope, tools used, and guarantee..."
          required
          rows={3}
          className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
        />
      </div>

      {/* Custom File Upload Dropzone */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
          Service Image
        </label>
        {imagePreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-28 bg-slate-100 group">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 rounded-2xl cursor-pointer transition-all">
            <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
            <span className="text-xs font-semibold text-slate-700">Click to upload cover photo</span>
            <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, or WEBP up to 5MB</span>
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </label>
        )}
      </div>

      <div className="pt-2 flex items-center justify-end gap-3 pb-4">
        <button
          type="button"
          onClick={onSuccess}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold py-2.5 px-5 rounded-xl transition-all text-xs shadow-md hover:shadow-blue-500/20"
        >
          {isSubmitting ? "Publishing..." : "Publish Service"}
        </button>
      </div>
    </form>
  );
}

