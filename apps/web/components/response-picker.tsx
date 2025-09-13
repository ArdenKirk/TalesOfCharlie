'use client';

import { useState, useEffect } from 'react';
import { getMockChoices, MockAiDecision } from '@toc/ai-mocks';

interface ResponsePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResponse: (response: MockAiDecision) => void;
  articleUrl?: string;
  isVisible?: boolean;
}

export function ResponsePicker({
  isOpen,
  onClose,
  onSelectResponse,
  articleUrl,
  isVisible = false
}: ResponsePickerProps) {
  const [responses, setResponses] = useState<MockAiDecision[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && articleUrl) {
      loadMockResponses();
    }
  }, [isOpen, articleUrl]);

  const loadMockResponses = async () => {
    if (!articleUrl) return;

    try {
      setIsLoading(true);
      // In a real implementation, this might make an API call
      // For now, we'll use the client-side mock function
      const mockResponses = getMockChoices(articleUrl);
      setResponses(mockResponses);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Failed to load mock responses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectResponse = () => {
    if (responses[selectedIndex]) {
      onSelectResponse(responses[selectedIndex]);
      onClose();
    }
  };

  const formatSummary = (summary: string) => {
    // Convert markdown **bold** to HTML <strong>
    // This is a simple formatter - you could use remark/rehype for full markdown
    return summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              AI Response Picker
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
          <p className="text-sm text-gray-600 mt-2">
            Choose which AI response to use for article processing in development mode
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading AI responses...</span>
            </div>
          ) : responses.length > 0 ? (
            <div className="space-y-4">
              {responses.map((response: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedIndex === index
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      checked={selectedIndex === index}
                      onChange={() => setSelectedIndex(index)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          response.decision === 'APPROVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {response.decision}
                        </span>
                        <span className="text-xs text-gray-500">
                          Response {index + 1}
                        </span>
                      </div>

                      <div
                        className="text-sm text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: formatSummary(response.summaryMd)
                        }}
                      />

                      {response.tags && response.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {response.tags.map((tag: string, tagIndex: number) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No responses available</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSelectResponse}
              disabled={responses.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Use Selected Response
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for managing Response Picker state
export function useResponsePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [lastArticleUrl, setLastArticleUrl] = useState<string>();

  const openPicker = (articleUrl?: string) => {
    setLastArticleUrl(articleUrl);
    setIsOpen(true);
  };

  const closePicker = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    lastArticleUrl,
    openPicker,
    closePicker,
  };
}
