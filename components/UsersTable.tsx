"use client";

export default function UsersTable({
  users,
  loading,
  error,
  onRefresh,
  page = 1,
  totalPages,
  totalCount,
  limit = 20,
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
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!users || users.length === 0) {
    if (page > 1) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-amber-600 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No employees found on Page {page}</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            You have reached beyond the available employee records.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => onPageChange(page - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Go to Page {page - 1}
            </button>
            <button
              onClick={() => onPageChange(1)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition cursor-pointer"
            >
              Back to First Page
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
        <p className="text-gray-500 font-medium mb-3">No employee records found in Zoho People.</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition cursor-pointer"
        >
          Refresh Data
        </button>
      </div>
    );
  }

  const startRecord = (page - 1) * limit + 1;
  const endRecord = (page - 1) * limit + users.length;

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
          {totalCount !== undefined && totalCount !== null
            ? `Showing ${Math.min(startRecord, totalCount)} - ${Math.min(endRecord, totalCount)} of ${totalCount} records`
            : `Showing ${users.length} records on page ${page}`}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            aria-disabled={page <= 1 || loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-xs font-medium rounded-md shadow-sm transition disabled:opacity-40 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed cursor-pointer text-gray-700"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <span className="px-3 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm">
            {totalPages ? `Page ${page} of ${totalPages}` : `Page ${page}`}
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={!hasMore || loading}
            aria-disabled={!hasMore || loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-xs font-medium rounded-md shadow-sm transition disabled:opacity-40 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed cursor-pointer text-gray-700"
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
