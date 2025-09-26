"use client";
import Link from "next/link";
import { useCallback } from "react";

export default function NotFound() {
  const goBack = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/";
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg p-8 sm:p-12">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-shrink-0 w-40 h-40 rounded-lg bg-gradient-to-br from-rose-100 via-amber-100 to-emerald-100 grid place-items-center shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-24 h-24 text-rose-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9v6m6-6v6"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 16V8a2 2 0 00-2-2h-4.586a1 1 0 01-.707-.293L11.414 3.293A1 1 0 0010.707 3H5a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2z"
              />
            </svg>
          </div>

          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              404 — Page not found
            </h1>
            <p className="mt-3 text-slate-600 text-base sm:text-lg">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved. Check the URL or try one of the options below.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300"
                aria-label="Go to homepage"
              >
                Go to homepage
              </Link>

              <button
                onClick={goBack}
                className="inline-flex items-center justify-center px-5 py-3 rounded-md border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
                aria-label="Go back"
              >
                Go back
              </button>
            </div>

            <p className="mt-6 text-sm text-slate-400">
              If you believe this is an error, contact your site administrator.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
