import { AuthButton } from "@/components/auth-button";

export default function Home() {
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
                <p className="text-sm text-gray-600">A tribute to Charlie Kirk</p>
              </div>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-6xl mb-6">
            Exposing Media Bias Against
            <span className="text-blue-600 block">Conservatives</span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Professional news aggregation that documents corruption and bias in liberal media. 
            We copy headlines exactly, then provide conservative perspective summaries.
          </p>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>API Backend Running</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>JWT Authentication</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Google OAuth Ready</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Phase 2A ✅ Complete</h3>
              <ul className="text-sm text-gray-600 text-left space-y-2">
                <li>• Authentication API endpoints</li>
                <li>• JWT token management</li>
                <li>• Google OAuth integration</li>
                <li>• Magic link email auth</li>
                <li>• User profile management</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Phase 2B 🚧 In Progress</h3>
              <ul className="text-sm text-blue-700 text-left space-y-2">
                <li>• NextAuth.js integration</li>
                <li>• Frontend authentication UI</li>
                <li>• Article submission form</li>
                <li>• Professional news layout</li>
                <li>• User dashboard</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              API Health: <a href="/api/health" className="text-blue-600 hover:underline" target="_blank">Test Backend</a> | 
              <span className="mx-1">•</span>
              NextAuth: <a href="/api/auth/signin" className="text-blue-600 hover:underline">Sign In Page</a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              This project is a tribute to Charlie Kirk and serves to expose media bias against conservatives.
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-500">
              <span>Professional News Aggregation</span>
              <span>•</span>
              <span>Conservative Commentary</span>
              <span>•</span>
              <span>Open Source</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
