"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { UploadCloud, Image as ImageIcon, X, Sparkles } from "lucide-react";

export default function CreateServiceForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    category: "electrician",
    description: "",
    shortDescription: "",
    basePrice: "",
    priceUnit: "flat",
    estimatedDuration: "1-2 hours",
    images: [] as File[],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      const newImages = [...formData.images, ...files].slice(0, 4); // Max 4 images
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
      setFormData({ ...formData, images: newImages });
      setImagePreviews(newPreviews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newPreviews);
  };

  const handleAIGeneration = async () => {
    if (formData.images.length === 0) {
      toast.error("Please upload at least one image first");
      return;
    }

    setIsGeneratingAI(true);
    try {
      const submitData = new FormData();
      formData.images.forEach((image) => {
        submitData.append("images", image);
      });
      submitData.append("category", formData.category);

      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || '';

      const response = await fetch("/api/v1/services/generate-ai-description", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData,
      });

      const data = await response.json();
      
      if (response.ok && data.data) {
        // Auto-fill the form with AI-generated content
        setFormData({
          ...formData,
          title: data.data.title || formData.title,
          description: data.data.description || formData.description,
          shortDescription: data.data.shortDescription || formData.shortDescription,
        });
        toast.success("AI generated service description successfully!");
      } else {
        throw new Error(data.message || "AI generation failed");
      }
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      toast.error(error.message || "Failed to generate AI description");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "images" && value !== null && value !== "") {
          submitData.append(key, value as string);
        }
      });
      
      // Add images
      formData.images.forEach((image) => {
        submitData.append("images", image);
      });

      if (formData.title) {
        submitData.append("slug", formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
      }

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
            Service Title <span className="text-slate-400 font-normal">(optional - AI can generate)</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Master AC Service & Repair"
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
          Short Description <span className="text-slate-400 font-normal">(optional - AI can generate)</span>
        </label>
        <input
          type="text"
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleChange}
          placeholder="Brief summary shown on service card..."
          maxLength={180}
          className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
          Detailed Description <span className="text-slate-400 font-normal">(optional - AI can generate)</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Full breakdown of scope, tools used, and guarantee..."
          rows={3}
          className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
        />
      </div>

      {/* Custom File Upload Dropzone - Multiple Images */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
          Service Images <span className="text-slate-400 font-normal">(up to 4 images)</span>
        </label>
        
        {imagePreviews.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative rounded-2xl overflow-hidden border border-slate-200 h-28 bg-slate-100 group">
                <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {imagePreviews.length < 4 && (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 rounded-2xl cursor-pointer transition-all">
                <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-700">Add more</span>
                <input
                  type="file"
                  name="images"
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </label>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 rounded-2xl cursor-pointer transition-all">
            <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
            <span className="text-xs font-semibold text-slate-700">Click to upload service images</span>
            <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, or WEBP up to 5MB (max 4 images)</span>
            <input
              type="file"
              name="images"
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* AI Generation Button */}
      {imagePreviews.length > 0 && (
        <button
          type="button"
          onClick={handleAIGeneration}
          disabled={isGeneratingAI}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4" />
          {isGeneratingAI ? "Generating AI Description..." : "Generate AI Description from Images"}
        </button>
      )}

      <div className="pt-2 flex items-center justify-end gap-3">
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

