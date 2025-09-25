"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { authClient } from "@/app/lib/auth.client";

export default function DashboardPage() {
  const user = authClient.useSession();
  const documents = useQuery(api.crud.document.get, {});

  if (documents === undefined) {
    return <div>Loading....</div>;
  }

  if (!documents || documents.length === 0) {
    return <div>No documents found.</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        My Documents ({documents.length})
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((document) => (
          <div
            key={document._id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-2">
              {document.title || "Untitled Document"}
            </h3>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {document.content || "No content"}
            </p>

            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{document.collaborators?.length || 0} collaborators</span>
              <span>
                {document.lastModified
                  ? (new Date(document.lastModified), "MMM d, yyyy")
                  : "No date"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No documents found. Create your first one to get started.
        </div>
      )}
    </div>
  );
}
