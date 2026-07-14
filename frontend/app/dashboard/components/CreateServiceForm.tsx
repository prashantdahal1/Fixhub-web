"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData({ ...formData, image: file });
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

      // We'll generate a simple slug for the backend, though the backend also generates it
      submitData.append("slug", formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));

      // For FixHub token auth
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

      toast.success("Service created successfully!");
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Service Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Deep AC Cleaning"
            required
            className="w-full px-4 py-2 text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
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
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Base Price (Rs)</label>
          <input
            type="number"
            name="basePrice"
            value={formData.basePrice}
            onChange={handleChange}
            placeholder="e.g. 1500"
            required
            min="0"
            className="w-full px-4 py-2 text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Price Unit</label>
          <select
            name="priceUnit"
            value={formData.priceUnit}
            onChange={handleChange}
            className="w-full px-4 py-2 text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="flat">Flat</option>
            <option value="per_hour">Per Hour</option>
            <option value="per_sqft">Per Sq. Ft.</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Short Description</label>
        <input
          type="text"
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleChange}
          placeholder="Brief summary of the service"
          required
          maxLength={200}
          className="w-full px-4 py-2 text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Detailed Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Full details of what the service includes..."
          required
          rows={4}
          className="w-full px-4 py-2 text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Estimated Duration</label>
        <input
          type="text"
          name="estimatedDuration"
          value={formData.estimatedDuration}
          onChange={handleChange}
          placeholder="e.g. 1-2 hours"
          className="w-full px-4 py-2 text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Service Image</label>
        <input
          type="file"
          name="image"
          onChange={handleFileChange}
          accept="image/*"
          className="w-full px-4 py-2 text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div className="pt-2 flex justify-end gap-3">
        <button
          type="button"
          onClick={onSuccess}
          className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-xl transition-all text-sm shadow-sm hover:shadow-md"
        >
          {isSubmitting ? "Creating..." : "Create Service"}
        </button>
      </div>
    </form>
  );
}
