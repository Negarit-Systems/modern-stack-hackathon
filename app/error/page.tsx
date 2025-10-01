"use client";
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const reason = searchParams?.get("reason");
  const messageParam = searchParams?.get("message");

  let title = "Something went wrong";
  let description = messageParam
    ? messageParam
    : "An unexpected error occurred. You can try reloading the current page or go back to the home page.";

  if (reason === "invalid-invitation") {
    title = "Invalid Invitation";
    description =
      "The invitation link you used is invalid or has expired. Please check the link or request a new invitation.";
  } else if (reason === "invite-acceptance-failed") {
    title = "Invitation Acceptance Failed";
    description =
      "There was an issue accepting your invitation. Please try again or contact support for assistance.";
  }

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
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            <p className="mt-2 text-sm text-gray-500">{description}</p>

            <div className="mt-4 flex gap-3">
              {reason === "invalid-invitation" ||
              reason === "invite-acceptance-failed" ? (
                <>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Go to Home
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Contact Support
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined" && window.location) {
                        window.location.reload();
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Try again
                  </button>

                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Home
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
