"use client";

export default function UsersTable({
  users,
  loading,
  error,
  onRefresh,
  page = 1,
  hasMore = false,
  onPageChange,
}: any) {
  if (loading && (!users || users.length === 0)) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 text-sm">Loading employees from Zoho People...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 font-medium mb-3">{error}</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
        <p className="text-gray-500 font-medium mb-3">No employee records found in Zoho People.</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
        >
          Refresh Data
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="py-3.5 px-6">Name</th>
              <th className="py-3.5 px-6">ID</th>
              <th className="py-3.5 px-6">Role</th>
              <th className="py-3.5 px-6">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
            {users.map((user: any, index: number) => (
              <tr key={user.id || index} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-4 px-6 font-medium text-gray-900">{user.name}</td>
                <td className="py-4 px-6 font-mono text-xs text-gray-500">{user.id}</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-600">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-gray-500 font-medium">
          Showing {users.length} records on page {page}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-xs font-medium rounded-md shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-gray-700"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <span className="px-3 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm">
            Page {page}
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={!hasMore || loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-xs font-medium rounded-md shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-gray-700"
          >
            Next
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
