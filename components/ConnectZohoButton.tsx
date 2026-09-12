"use client";

export default function ConnectZohoButton() {
  const handleConnect = () => {
    window.location.href = "/api/auth/zoho";
  };

  return (
    <button
      onClick={handleConnect}
      className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
    >
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2V7h2v10z" />
      </svg>
      Connect Zoho People
    </button>
  );
}
