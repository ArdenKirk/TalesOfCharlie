import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DomainReview {
  id: string;
  domain: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  monthlyVisitorsReported: number;
  evidenceUrl: string;
  createdAt: string;
  decidedBy?: string;
  decidedAt?: string;
  legitimacyAssessment?: string;
}

interface WhitelistedDomain {
  domain: string;
  addedAt: string;
  addedBy?: string;
}

interface BlacklistedDomain {
  domain: string;
  reason: string;
  addedAt: string;
  addedBy?: string;
}

export default function DomainManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'reviews' | 'whitelist' | 'blacklist'>('reviews');
  const [reviews, setReviews] = useState<DomainReview[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistedDomain[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistedDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  // Check if user is admin (simplified - in production, check roles)
  const isAdmin = session?.user?.email?.includes('admin') || process.env.NODE_ENV === 'development';

  if (!isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
        <Link href="/submit" className="text-blue-600 hover:text-blue-500">
          ← Back to Submit Articles
        </Link>
      </div>
    </div>;
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [reviewsRes, whitelistRes, blacklistRes] = await Promise.all([
        fetch('/api/domains/reviews'),
        fetch('/api/domains/whitelist'),
        fetch('/api/domains/blacklist')
      ]);

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.success ? reviewsData.data : []);
      }

      if (whitelistRes.ok) {
        const whitelistData = await whitelistRes.json();
        setWhitelist(whitelistData.success ? whitelistData.data : []);
      }

      if (blacklistRes.ok) {
        const blacklistData = await blacklistRes.json();
        setBlacklist(blacklistData.success ? blacklistData.data : []);
      }
    } catch (err) {
      setError('Failed to load domain data');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (reviewId: string, decision: 'APPROVE' | 'DENY', reason?: string) => {
    try {
      const response = await fetch(`/api/domains/reviews/${reviewId}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, reason })
      });

      if (response.ok) {
        loadData(); // Reload data
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Failed to process decision');
      }
    } catch (err) {
      setError('Network error - please try again');
    }
  };

  const renderReviews = () => (
    <div className="space-y-4">
      {reviews.map(review => (
        <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{review.domain}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  review.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : review.status === 'APPROVED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {review.status}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <p>Reported monthly visitors: {review.monthlyVisitorsReported.toLocaleString()}</p>
                <p>Submitted: {new Date(review.createdAt).toLocaleDateString()}</p>
                {review.evidenceUrl && (
                  <p><a href={review.evidenceUrl} target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-500">View evidence</a></p>
                )}
              </div>

              {review.status === 'PENDING' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDecision(review.id, 'APPROVE')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for denial:');
                      if (reason) handleDecision(review.id, 'DENY', reason);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Deny
                  </button>
                </div>
              )}

              {review.status !== 'PENDING' && review.decidedAt && (
                <div className="text-sm text-gray-500">
                  Decision made on {new Date(review.decidedAt).toLocaleDateString()}
                  {review.legitimacyAssessment && (
                    <p className="mt-1 italic">Note: {review.legitimacyAssessment}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {reviews.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No domain reviews found
        </div>
      )}
    </div>
  );

  const renderWhitelist = () => (
    <div className="space-y-4">
      {whitelist.map(domain => (
        <div key={domain.domain} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{domain.domain}</h3>
              <p className="text-sm text-gray-500">
                Whitelisted on {new Date(domain.addedAt).toLocaleDateString()}
              </p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
              APPROVED
            </span>
          </div>
        </div>
      ))}

      {whitelist.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No whitelisted domains
        </div>
      )}
    </div>
  );

  const renderBlacklist = () => (
    <div className="space-y-4">
      {blacklist.map(domain => (
        <div key={domain.domain} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{domain.domain}</h3>
              <p className="text-sm text-gray-600 mb-1">Reason: {domain.reason}</p>
              <p className="text-sm text-gray-500">
                Blacklisted on {new Date(domain.addedAt).toLocaleDateString()}
              </p>
            </div>
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
              BLOCKED
            </span>
          </div>
        </div>
      ))}

      {blacklist.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No blacklisted domains
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-xl">TC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tales of Charlie</h1>
                <p className="text-sm text-gray-600">Domain Management</p>
              </div>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-500 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Domain Management Panel</h2>
          <p className="text-gray-600">
            Manage domain approvals and blacklists for article submissions across Tales of Charlie
          </p>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { key: 'reviews', label: 'Pending Reviews', count: reviews.filter(r => r.status === 'PENDING').length },
              { key: 'whitelist', label: 'Whitelisted Domains', count: whitelist.length },
              { key: 'blacklist', label: 'Blacklisted Domains', count: blacklist.length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    key === 'reviews' ? 'bg-yellow-100 text-yellow-800' :
                    key === 'whitelist' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              {activeTab === 'reviews' && 'Domain Review Queue'}
              {activeTab === 'whitelist' && 'Approved Source Domains'}
              {activeTab === 'blacklist' && 'Blocked Source Domains'}
            </h3>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            ) : (
              <>
                {activeTab === 'reviews' && renderReviews()}
                {activeTab === 'whitelist' && renderWhitelist()}
                {activeTab === 'blacklist' && renderBlacklist()}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
