'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface DomainReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DomainReviewModal({ isOpen, onClose }: DomainReviewModalProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const router = useRouter();

  const [formData, setFormData] = useState({
    domain: '',
    monthlyVisitors: '',
    evidenceUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    if (!session) {
      setMessage("You must be signed in to submit a domain review");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    try {
      const monthlyVisitors = parseInt(formData.monthlyVisitors, 10);
      if (isNaN(monthlyVisitors) || monthlyVisitors < 100) {
        setMessage("Monthly visitors must be at least 100,000");
        setMessageType("error");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: formData.domain,
          monthlyVisitorsReported: monthlyVisitors,
          evidenceUrl: formData.evidenceUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Domain review submitted successfully! We'll review it soon.");
        setMessageType("success");
        setFormData({ domain: '', monthlyVisitors: '', evidenceUrl: '' });

        // Close modal after successful submission
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage(data.error?.message || "Failed to submit domain review");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Network error. Please check your connection and try again.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 headline-serif">
              Submit Domain for Review
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2 body-sans">
            Request that Tales of Charlie allow submissions from a specific news domain.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
              Domain Name
            </label>
            <input
              type="text"
              id="domain"
              placeholder="example.com"
              value={formData.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-navy focus:border-transparent text-sm"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the domain without http:// or www
            </p>
          </div>

          <div>
            <label htmlFor="visitors" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Visitors (in thousands)
            </label>
            <input
              type="number"
              id="visitors"
              placeholder="100"
              min="100"
              value={formData.monthlyVisitors}
              onChange={(e) => handleInputChange('monthlyVisitors', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-navy focus:border-transparent text-sm"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 100,000 monthly visitors
            </p>
          </div>

          <div>
            <label htmlFor="evidence" className="block text-sm font-medium text-gray-700 mb-1">
              Evidence URL
            </label>
            <input
              type="url"
              id="evidence"
              placeholder="https://www.similarweb.com/website/example.com"
              value={formData.evidenceUrl}
              onChange={(e) => handleInputChange('evidenceUrl', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-navy focus:border-transparent text-sm"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Link to traffic stats (SimilarWeb, Alexa, etc.)
            </p>
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              messageType === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {message}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors body-sans"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.domain || !formData.monthlyVisitors || !formData.evidenceUrl}
              className="px-4 py-2 bg-news-navy text-white rounded-md hover:bg-news-charcoal transition-colors body-sans disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>

        <div className="p-6 border-t bg-gray-50 rounded-b-lg">
          <div className="text-xs text-gray-600 body-sans">
            <p className="font-medium mb-1">Review Criteria:</p>
            <ul className="space-y-1 ml-4">
              <li>• Domain must have ≥100k monthly visitors</li>
              <li>• Must be a legitimate news publication</li>
              <li>• Review process typically takes 1-2 business days</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
