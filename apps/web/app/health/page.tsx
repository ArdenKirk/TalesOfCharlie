export default async function Health() {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost/api";
    const res = await fetch(`${apiUrl}/health`, { cache: "no-store" });
    const json = await res.json();
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">System Health Status</h1>
                    <div className="bg-gray-100 rounded p-4 font-mono text-sm">
                        {JSON.stringify(json, null, 2)}
                    </div>
                </div>
            </div>
        </div>
    );
}
