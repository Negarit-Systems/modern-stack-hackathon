"use client";

import React, { ChangeEvent } from "react";
import { ExternalLink, Upload } from "lucide-react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface UploadProps {
  onFileSelected?: (file: File) => void;
  sessionId: Id<"sessions">;
}

export default function RecentInsights({ onFileSelected, sessionId }: UploadProps) {
  const generateUploadUrl = useMutation(api.crud.upload.generateUploadUrl);
  const createUpload = useMutation(api.crud.upload.create);
  const uploads = useQuery(api.crud.upload.getBySession, { sessionId });
  const parseText = useAction(api.functions.processFile.processSessionFiles);
  const [parseLoading, setParseLoading] = React.useState(false);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
     if (!file) return;

     if (onFileSelected) {
       onFileSelected(file);
     }

     const uploadUrl = await generateUploadUrl({});
     const result = await fetch(uploadUrl, {
       method: "POST",
       body: file,
       headers: {
         "Content-Type": file.type,
       },
     });
     if (!result.ok) {
       throw new Error("File upload failed");
     }

     const { storageId } = await result.json();
     await createUpload({
       item: {
         fileName: file.name,
         fileType: file.type,
         storageId: storageId as Id<"_storage">,
         sessionId: sessionId!
       }
     });
  };

  return (
    <div className="bg-background border border-border rounded-lg p-3">
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
      <ExternalLink size={16} className="text-primary" />
      Recent Insights
      </h3>

      <div className="flex items-center gap-2 mt-3">
      <label className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors text-xs">
        <Upload size={12} />
        Upload
        <input
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf"
        />
      </label>
      </div>

      {uploads && uploads.length > 0 && (
      <div className="mb-4">
        <div className="space-y-2 mt-4 max-h-48 overflow-y-auto">
        {uploads!.map((upload) => (
          <div
          key={upload._id}
          className="flex items-center justify-between rounded-md border p-2 bg-gray-100 shadow-sm"
          >
          <div className="flex-1">
            <p className="text-xs font-semibold truncate">{upload.fileName}</p>
          </div>
          <a
            href={upload.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-primary hover:underline flex items-center"
            title="View Document"
          >
            <ExternalLink size={16} />
          </a>
          </div>
        ))}
        </div>
        <button
          className="mt-4 w-full px-3 py-2 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center"
          disabled={parseLoading}
          onClick={async () => {
            if (uploads && uploads.length > 0) {
              setParseLoading(true);
              try {
          await parseText({ sessionId });
              } finally {
          setParseLoading(false);
              }
            }
          }}
        >
          {parseLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-primary-foreground" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Parsing...
            </span>
          ) : (
            "Parse All PDFs"
          )}
        </button>
      </div>
      )}
    </div>
  );
}
