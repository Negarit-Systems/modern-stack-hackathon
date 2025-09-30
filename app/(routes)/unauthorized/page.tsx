"use client";
import React from "react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg p-8">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">
              Unauthorized Access
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              You do not have permission to access this page. Please log in with
              the appropriate credentials or return to the home page.
            </p>

            <div className="mt-4 flex gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Log In
              </Link>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Home
              </Link>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
