'use client'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Welcome to FixItNow Admin Panel</h2>
          <p className="text-gray-600">
            You have successfully logged in to the admin panel!
          </p>
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800">
              ✅ Authentication working correctly
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}