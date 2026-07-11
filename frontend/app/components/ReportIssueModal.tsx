import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ReportIssueModal = ({ isOpen, onClose, onSubmit, bookingContext }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [details, setDetails] = useState('');
  const [files, setFiles] = useState([]);
  
  const fileInputRef = useRef(null);

  const categories = ['Late Delivery', 'Missing Items', 'Wrong Item', 'Quality Issue', 'Other'];

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      category: selectedCategory,
      details,
      attachments: files,
      bookingContext
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-[6px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-[550px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-8 pb-6 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Report Service Issue</h3>
                  {bookingContext && (
                    <div className="mt-4 text-sm text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <p><span className="font-semibold text-gray-900">Order ID:</span> {bookingContext.id}</p>
                      <p className="mt-1"><span className="font-semibold text-gray-900">Service:</span> {bookingContext.serviceName}</p>
                      <p className="mt-1"><span className="font-semibold text-gray-900">Date:</span> {bookingContext.date}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 -mt-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  type="button"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 pt-0 overflow-y-auto flex-1 custom-scrollbar">
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Issue Category
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-600 ring-offset-2'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label htmlFor="details" className="block text-sm font-semibold text-gray-900 mb-3">
                  Provide Details
                </label>
                <textarea
                  id="details"
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 p-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 resize-none transition-all text-gray-900 bg-gray-50 placeholder-gray-400"
                  placeholder="Please describe the service issue in detail..."
                  required
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Attachments
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex justify-center rounded-2xl border-2 border-dashed border-gray-200 px-6 py-8 hover:border-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer group bg-gray-50"
                >
                  <div className="space-y-3 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <svg
                        className="h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        Click to upload
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                  />
                </div>
                {files.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {files.map((file, idx) => (
                       <li key={idx} className="flex items-center space-x-3 bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-sm text-gray-700 truncate font-medium">{file.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all shadow-md shadow-blue-500/20"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
