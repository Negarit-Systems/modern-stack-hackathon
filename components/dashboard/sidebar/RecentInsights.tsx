"use client";

import React, { ChangeEvent, useCallback, useState } from "react";
import {
  ExternalLink,
  Upload,
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Play,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import WebInsights from "./WebInsights";

interface UploadProps {
  onFileSelected?: (file: File) => void;
  sessionId: Id<"sessions">;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "uploaded" | "error";
  error?: string;
}

export default function RecentInsights({
  onFileSelected,
  sessionId,
}: UploadProps) {
  const [collapsed, setCollapsed] = useState(false);
  const generateUploadUrl = useMutation(api.crud.upload.generateUploadUrl);
  const createUpload = useMutation(api.crud.upload.create);
  const deleteUpload = useMutation(api.crud.upload.deleteOne);
  const uploads = useQuery(api.crud.upload.getBySession, { sessionId });
  const processSingleFile = useAction(
    api.functions.processFile.processSingleFile
  );

  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [globalMessage, setGlobalMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const handleFileUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      // Clear previous messages
      setGlobalMessage(null);

      for (const file of files) {
        const uploadId = Date.now().toString() + Math.random();

        // Add to uploading files
        setUploadingFiles((prev) => [
          ...prev,
          {
            id: uploadId,
            file,
            progress: 0,
            status: "uploading",
          },
        ]);

        try {
          if (onFileSelected) {
            onFileSelected(file);
          }

          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.id === uploadId
                  ? { ...f, progress: Math.min(f.progress + 10, 90) }
                  : f
              )
            );
          }, 200);

          const uploadUrl = await generateUploadUrl({});
          const result = await fetch(uploadUrl, {
            method: "POST",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          });

          clearInterval(progressInterval);

          if (!result.ok) {
            throw new Error("File upload failed");
          }

          const { storageId } = await result.json();
          const uploadRecord = await createUpload({
            item: {
              fileName: file.name,
              fileType: file.type,
              storageId: storageId as Id<"_storage">,
              sessionId: sessionId!,
              parseStatus: "pending",
            },
          });

          // Complete upload
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === uploadId
                ? { ...f, progress: 100, status: "uploaded" }
                : f
            )
          );

          // Auto-parse the newly uploaded file
          setTimeout(async () => {
            try {
              const result = await processSingleFile({
                uploadId: uploadRecord,
              });
              if (result.success) {
                setGlobalMessage({
                  type: "success",
                  text: `${file.name} has been processed and is ready for AI analysis!`,
                });
              } else {
                setGlobalMessage({
                  type: "error",
                  text: `Failed to process ${file.name}: ${result.error}`,
                });
              }
            } catch (error) {
              setGlobalMessage({
                type: "error",
                text: `Error processing ${file.name}`,
              });
            }
          }, 1000);

          // Remove from uploading files after 3 seconds
          setTimeout(() => {
            setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
          }, 3000);
        } catch (error) {
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === uploadId
                ? {
                    ...f,
                    status: "error",
                    error:
                      error instanceof Error ? error.message : "Upload failed",
                  }
                : f
            )
          );
        }
      }

      // Reset input
      e.target.value = "";
    },
    [
      generateUploadUrl,
      createUpload,
      onFileSelected,
      sessionId,
      processSingleFile,
    ]
  );

  const handleDeleteFile = useCallback(
    async (uploadId: Id<"uploads">, fileName: string) => {
      try {
        await deleteUpload({ id: uploadId });
        setGlobalMessage({
          type: "info",
          text: `${fileName} has been removed`,
        });
      } catch (error) {
        setGlobalMessage({
          type: "error",
          text: `Failed to remove ${fileName}`,
        });
      }
    },
    [deleteUpload]
  );

  const handleParseFile = useCallback(
    async (uploadId: Id<"uploads">, fileName: string) => {
      try {
        const result = await processSingleFile({ uploadId });
        if (result.success) {
          setGlobalMessage({
            type: "success",
            text: `${fileName} has been processed successfully!`,
          });
        } else {
          setGlobalMessage({
            type: "error",
            text: `Failed to process ${fileName}: ${result.error}`,
          });
        }
      } catch (error) {
        setGlobalMessage({
          type: "error",
          text: `Error processing ${fileName}`,
        });
      }
    },
    [processSingleFile]
  );

  const getStatusIcon = (parseStatus?: string) => {
    switch (parseStatus) {
      case "completed":
        return (
          <CheckCircle
            size={16}
            className="text-green-500 dark:text-emerald-400"
          />
        );
      case "processing":
        return (
          <Loader2
            size={16}
            className="text-blue-500 animate-spin dark:text-blue-400"
          />
        );
      case "error":
        return (
          <AlertCircle size={16} className="text-red-500 dark:text-red-400" />
        );
      default:
        return (
          <FileText size={16} className="text-gray-400 dark:text-slate-400" />
        );
    }
  };

  const getStatusText = (parseStatus?: string) => {
    switch (parseStatus) {
      case "completed":
        return "Ready for AI";
      case "processing":
        return "Processing...";
      case "error":
        return "Failed";
      default:
        return "Pending";
    }
  };

  const completedFiles =
    uploads?.filter((u) => u.parseStatus === "completed").length || 0;
  const totalFiles = uploads?.length || 0;

  return (
    <div className="bg-background border border-border rounded-lg p-4 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 dark:border-slate-700/50 dark:rounded-xl dark:p-6 dark:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-500/10 dark:transition-all dark:duration-300">
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none border-b border-border"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center justify-between mb-4 dark:mb-6">
          <h3 className="font-semibold flex items-center gap-2 text-sm dark:gap-3 dark:text-lg">
            <div className="dark:p-2 dark:bg-gradient-to-br dark:from-blue-600 dark:to-indigo-700 dark:rounded-lg dark:shadow-lg">
              <FileText size={16} className="text-primary dark:text-white" />
            </div>
            <span className="dark:text-white">Document Library</span>
          </h3>
          {totalFiles > 0 && (
            <span className="text-xs text-muted-foreground dark:text-slate-300 dark:bg-slate-700/50 dark:px-2 dark:py-1 dark:rounded-full">
              {completedFiles}/{totalFiles} ready
            </span>
          )}
        </div>
        {collapsed ? (
          <ChevronRight size={16} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground" />
        )}
      </div>

      {!collapsed && (
        <div className="p-3 flex flex-col gap-3">
          {/* Upload Area */}
          <div className="mb-4 dark:mb-6">
            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-primary/20 transition-all duration-200 text-sm dark:gap-3 dark:px-6 dark:py-4 dark:bg-blue-500/10 dark:border-blue-400/30 dark:rounded-xl dark:hover:bg-blue-500/20 dark:hover:border-blue-400/50 dark:transition-all dark:duration-300 dark:backdrop-blur-sm">
              <Upload
                size={16}
                className="text-primary dark:size-[18px] dark:text-blue-400"
              />
              <span className="text-primary font-medium dark:text-blue-300">
                Upload PDF Files
              </span>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf"
              />
            </label>
          </div>

          {/* Global Message */}
          {globalMessage && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                globalMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30"
                  : globalMessage.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30"
                    : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30"
              } dark:mb-6 dark:p-4 dark:rounded-xl dark:gap-3 dark:backdrop-blur-sm`}
            >
              {globalMessage.type === "success" && <CheckCircle size={16} />}
              {globalMessage.type === "error" && <AlertCircle size={16} />}
              {globalMessage.type === "info" && <FileText size={16} />}
              <span>{globalMessage.text}</span>
              <button
                onClick={() => setGlobalMessage(null)}
                className="ml-auto hover:opacity-70 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Uploading Files */}
          {uploadingFiles.length > 0 && (
            <div className="mb-4 space-y-2 dark:mb-6 dark:space-y-3">
              {uploadingFiles.map((uploadingFile) => (
                <div
                  key={uploadingFile.id}
                  className="bg-gray-50 rounded-lg p-3 border dark:bg-slate-800/40 dark:rounded-xl dark:p-4 dark:border-slate-700/50 dark:backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-2 dark:mb-3">
                    <span className="text-sm font-medium truncate dark:text-white">
                      {uploadingFile.file.name}
                    </span>
                    <span className="text-xs text-muted-foreground dark:text-slate-300">
                      {uploadingFile.status === "uploading"
                        ? `${uploadingFile.progress}%`
                        : uploadingFile.status === "uploaded"
                          ? "Uploaded"
                          : "Error"}
                    </span>
                  </div>
                  {uploadingFile.status === "uploading" && (
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-slate-700">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300 dark:bg-gradient-to-r dark:from-blue-500 dark:to-indigo-500"
                        style={{ width: `${uploadingFile.progress}%` }}
                      />
                    </div>
                  )}
                  {uploadingFile.status === "error" && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {uploadingFile.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Uploaded Files */}
          {uploads && uploads.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto dark:space-y-3">
              {uploads.map((upload) => (
                <div
                  key={upload._id}
                  className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:shadow-sm transition-all duration-200 dark:gap-4 dark:p-4 dark:bg-slate-800/40 dark:border-slate-700/50 dark:rounded-xl dark:hover:shadow-lg dark:hover:shadow-blue-500/10 dark:backdrop-blur-sm"
                >
                  {getStatusIcon(upload.parseStatus)}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate dark:text-white">
                      {upload.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-slate-400">
                      {getStatusText(upload.parseStatus)}
                      {upload.parseError && ` - ${upload.parseError}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 dark:gap-2">
                    {upload.parseStatus === "pending" && (
                      <button
                        onClick={() =>
                          handleParseFile(upload._id, upload.fileName)
                        }
                        className="p-1.5 hover:bg-blue-100 rounded-md transition-colors dark:p-2 dark:hover:bg-blue-500/20 dark:rounded-lg"
                        title="Process file"
                      >
                        <Play
                          size={14}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </button>
                    )}

                    {upload.url && (
                      <a
                        href={upload.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors dark:p-2 dark:hover:bg-slate-600/50 dark:rounded-lg"
                        title="View document"
                      >
                        <ExternalLink
                          size={14}
                          className="text-gray-600 dark:text-slate-400"
                        />
                      </a>
                    )}

                    <button
                      onClick={() =>
                        handleDeleteFile(upload._id, upload.fileName)
                      }
                      className="p-1.5 hover:bg-red-100 rounded-md transition-colors dark:p-2 dark:hover:bg-red-500/20 dark:rounded-lg"
                      title="Remove file"
                    >
                      <Trash2
                        size={14}
                        className="text-red-600 dark:text-red-400"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {(!uploads || uploads.length === 0) &&
            uploadingFiles.length === 0 && (
              <div className="text-center py-8">
                <FileText
                  size={32}
                  className="mx-auto mb-2 opacity-50 text-muted-foreground dark:w-16 dark:h-16 dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-800 dark:rounded-full dark:flex dark:items-center dark:justify-center dark:mb-4 dark:shadow-lg dark:text-slate-400"
                />
                <p className="text-sm dark:text-lg dark:font-medium dark:text-white dark:mb-2">
                  No documents uploaded yet
                </p>
                <p className="text-xs dark:text-sm dark:text-slate-400">
                  Upload PDF files to get started
                </p>
              </div>
            )}

          {/* Summary */}
          {totalFiles > 0 && (
            <div className="mt-4 pt-4 border-t border-border dark:mt-6 dark:pt-6 dark:border-slate-700/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-slate-300">
                <span>
                  {totalFiles} document{totalFiles !== 1 ? "s" : ""} uploaded
                </span>
                <span>{completedFiles} ready for AI analysis</span>
              </div>
              {completedFiles > 0 && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 dark:mt-3 dark:bg-slate-700 dark:h-2">
                  <div
                    className="bg-green-500 h-1.5 rounded-full transition-all duration-500 dark:bg-gradient-to-r dark:from-emerald-500 dark:to-green-500 dark:h-2 dark:shadow-sm"
                    style={{ width: `${(completedFiles / totalFiles) * 100}%` }}
                  />
                </div>
              )}
            </div>
          )}
          <WebInsights sessionId={sessionId} />

          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
            @media (prefers-color-scheme: dark) {
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #1e293b;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #475569;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #64748b;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
