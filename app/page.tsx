"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ConnectZohoButton from "@/components/ConnectZohoButton";
import DashboardHeader from "@/components/DashboardHeader";
import UsersTable from "@/components/UsersTable";

function DashboardContent() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Check for error in query params (e.g. from OAuth redirect)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(`Zoho OAuth Error: ${errorParam}`);
    }
  }, [searchParams]);

  // Check auth status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
        setAuthenticated(Boolean(data.authenticated));
        if (data.authenticated) {
          loadUsers(1);
        }
      } catch {
        setAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuth();
  }, []);

  const loadUsers = async (pageNumber = 1, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoadingUsers(true);
    }
    setError(null);

    try {
      const res = await fetch(`/api/users?page=${pageNumber}&limit=10`);
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to load users");
      }

      setUsers(data.users || []);
      setPage(data.page || pageNumber);
      setHasMore(Boolean(data.hasMore));
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoadingUsers(false);
      setRefreshing(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    loadUsers(newPage);
  };

  const handleDisconnect = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setAuthenticated(false);
      setUsers([]);
      setPage(1);
      setHasMore(false);
      router.replace("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {!authenticated ? (
          <div className="max-w-md mx-auto mt-16 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mb-6">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2V7h2v10z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
              Zoho People Integration
            </h1>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Connect your Zoho People account to view employees, roles, and user details in a unified table.
            </p>

            {error && (
              <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 text-left">
                {error}
              </div>
            )}

            <ConnectZohoButton />

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        ) : (
          <div>
            <DashboardHeader
              total={users.length}
              refreshing={refreshing}
              onRefresh={() => loadUsers(page, true)}
              onDisconnect={handleDisconnect}
            />

            <UsersTable
              users={users}
              loading={loadingUsers}
              error={error}
              page={page}
              hasMore={hasMore}
              onPageChange={handlePageChange}
              onRefresh={() => loadUsers(page, false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <DashboardContent />
    </Suspense>
  );
}
