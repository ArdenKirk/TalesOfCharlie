"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ResponsePicker, useResponsePicker } from "@/components/response-picker";

export default function SubmitArticle() {
  const { data: session, status } = useSession()
  const [url, setUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")
  const router = useRouter()
  const responsePicker = useResponsePicker()

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage("")

    try {
      // Check if we should use Response Picker for development
      const isDevelopment = process.env.NODE_ENV === 'development';
      const aiMode = process.env.AI_MODE || 'mock';

      if (isDevelopment && aiMode === 'mock') {
        // In development with mock AI, show Response Picker first
        responsePicker.openPicker(url);
        setIsSubmitting(false);
        return;
      }

      // Normal production flow
      const response = await fetch("/api/posts/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (response.ok) {
        const result = await response.json()
        setMessage("Article submitted successfully! It will be processed for review.")
        setMessageType("success")
        setUrl("")
      } else if (response.status === 401) {
        setMessage("Authentication required. Please sign in again.")
        setMessageType("error")
      } else {
        const error = await response.json()
        setMessage(error.message || "Failed to submit article")
        setMessageType("error")
      }
    } catch (error) {
      setMessage("Network error. Please check your connection and try again.")
      setMessageType("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">TC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tales of Charlie</h1>
                <p className="text-sm text-gray-600">Submit an Article</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit an Article</h2>
            <p className="text-gray-600">
              Share a news article URL for conservative analysis. Our system will process the article,
              verify its authenticity, and provide a balanced conservative perspective.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Article URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/news-article"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base transition duration-200"
                disabled={isSubmitting}
              />
            </div>

            {message && (
              <div className={`p-4 rounded-md ${messageType === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                <p className={`text-sm ${messageType === "success" ? "text-green-800" : "text-red-800"}`}>
                  {message}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !url.trim()}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                "Submit Article"
              )}
            </button>
          </form>

          <div className="mt-8 border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Article URL is validated and processed</li>
                  <li>• Domain reputation is checked</li>
                  <li>• Conservative analysis is generated</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Content Guidelines</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Must be a news article URL</li>
                  <li>• Content must be accessible</li>
                  <li>• Respects platform standards</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="flex flex-col space-y-4">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-500 transition duration-200"
            >
              ← Back to Home
            </a>

            {/* Development: Response Picker Demo Button */}
            {process.env.NODE_ENV === 'development' && process.env.AI_MODE === 'mock' && (
              <button
                onClick={() => responsePicker.openPicker(url || 'https://example.com/sample-article')}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                🛠️ Development: Test AI Response Picker
              </button>
            )}
          </div>
        </div>

        {/* Response Picker Modal */}
        <ResponsePicker
          isOpen={responsePicker.isOpen}
          onClose={responsePicker.closePicker}
          onSelectResponse={async (response) => {
            try {
              setIsSubmitting(true);
              setMessage("");

              const mockResponse = await fetch("/api/posts/submit/mock", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  url: responsePicker.lastArticleUrl,
                  mockDecision: response.decision,
                  mockSummaryMd: response.summaryMd,
                  mockTags: response.tags,
                }),
              });

              if (mockResponse.ok) {
                const result = await mockResponse.json();
                setMessage("Article processed with mock AI response! It has been published.");
                setMessageType("success");
                setUrl("");
                router.push("/"); // Redirect to home after successful mock processing
              } else {
                const error = await mockResponse.json();
                setMessage(error.error?.message || "Failed to process article with mock response");
                setMessageType("error");
              }
            } catch (error) {
              setMessage("Network error. Please check your connection and try again.");
              setMessageType("error");
            } finally {
              setIsSubmitting(false);
            }
          }}
          articleUrl={responsePicker.lastArticleUrl}
        />
      </main>
    </div>
  )
}
