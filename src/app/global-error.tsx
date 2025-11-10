"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Error is available but not used in this component
  void error;
  return (
    <html>
      <body>
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-5">
          <div className="rounded-[16px] bg-white p-8 text-center max-w-md">
            <h1 className="text-4xl font-bold text-[#0E1C29] mb-4">
              Something went wrong!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              We encountered an unexpected error. Please try again.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={reset}
                className="bg-[#774BE5] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#6B3FD6] transition-colors"
              >
                Try again
              </button>
              <Link
                href="/"
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
