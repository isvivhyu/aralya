"use client";

import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <section className="w-full bg-[#F9FAFB] flex flex-col items-center pb-40 px-5">
      <div className="w-full flex items-center justify-center md:px-10 pt-5 md:pt-0">
        <Navbar textColor="black" />
      </div>
      <div className="pt-13 flex flex-col items-center md:w-[930px] w-full px-0 mt-28">
        <div className="rounded-[16px] bg-white p-8 text-center">
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
    </section>
  );
}
