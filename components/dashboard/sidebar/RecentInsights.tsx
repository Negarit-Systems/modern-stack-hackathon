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
  Play
} from "lucide-react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Markdown from "react-markdown";
import Loading from "@/app/loading";
import InsightDetailModal from "./ScrapDataDetailModal";
import WebInsights from "./WebInsights";

interface UploadProps {
  onFileSelected?: (file: File) => void;
  sessionId: Id<"sessions">;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'uploaded' | 'error';
  error?: string;
}

export default function RecentInsights({ onFileSelected, sessionId }: UploadProps) {
  const generateUploadUrl = useMutation(api.crud.upload.generateUploadUrl);
  const createUpload = useMutation(api.crud.upload.create);
  const deleteUpload = useMutation(api.crud.upload.deleteOne);
  const uploads = useQuery(api.crud.upload.getBySession, { sessionId });
  const processSingleFile = useAction(api.functions.processFile.processSingleFile);

  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [globalMessage, setGlobalMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  const handleFileUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Clear previous messages
    setGlobalMessage(null);

    for (const file of files) {
      const uploadId = Date.now().toString() + Math.random();

      // Add to uploading files
      setUploadingFiles(prev => [...prev, {
        id: uploadId,
        file,
        progress: 0,
        status: 'uploading'
      }]);

      try {
        if (onFileSelected) {
          onFileSelected(file);
        }

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => prev.map(f =>
            f.id === uploadId ? { ...f, progress: Math.min(f.progress + 10, 90) } : f
          ));
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
            parseStatus: "pending"
          }
        });

        // Complete upload
        setUploadingFiles(prev => prev.map(f =>
          f.id === uploadId ? { ...f, progress: 100, status: 'uploaded' } : f
        ));

        // Auto-parse the newly uploaded file
        setTimeout(async () => {
          try {
            const result = await processSingleFile({ uploadId: uploadRecord });
            if (result.success) {
              setGlobalMessage({
                type: 'success',
                text: `${file.name} has been processed and is ready for AI analysis!`
              });
            } else {
              setGlobalMessage({
                type: 'error',
                text: `Failed to process ${file.name}: ${result.error}`
              });
            }
          } catch (error) {
            setGlobalMessage({
              type: 'error',
              text: `Error processing ${file.name}`
            });
          }
        }, 1000);

        // Remove from uploading files after 3 seconds
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
        }, 3000);

      } catch (error) {
        setUploadingFiles(prev => prev.map(f =>
          f.id === uploadId ? {
            ...f,
            status: 'error',
            error: error instanceof Error ? error.message : 'Upload failed'
          } : f
        ));
      }
    }

    // Reset input
    e.target.value = '';
  }, [generateUploadUrl, createUpload, onFileSelected, sessionId, processSingleFile]);

  const handleDeleteFile = useCallback(async (uploadId: Id<"uploads">, fileName: string) => {
    try {
      await deleteUpload({ id: uploadId });
      setGlobalMessage({
        type: 'info',
        text: `${fileName} has been removed`
      });
    } catch (error) {
      setGlobalMessage({
        type: 'error',
        text: `Failed to remove ${fileName}`
      });
    }
  }, [deleteUpload]);

  const handleParseFile = useCallback(async (uploadId: Id<"uploads">, fileName: string) => {
    try {
      const result = await processSingleFile({ uploadId });
      if (result.success) {
        setGlobalMessage({
          type: 'success',
          text: `${fileName} has been processed successfully!`
        });
      } else {
        setGlobalMessage({
          type: 'error',
          text: `Failed to process ${fileName}: ${result.error}`
        });
      }
    } catch (error) {
      setGlobalMessage({
        type: 'error',
        text: `Error processing ${fileName}`
      });
    }
  }, [processSingleFile]);

  const getStatusIcon = (parseStatus?: string) => {
    switch (parseStatus) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'processing':
        return <Loader2 size={16} className="text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <FileText size={16} className="text-gray-400" />;
    }
  };

  const getStatusText = (parseStatus?: string) => {
    switch (parseStatus) {
      case 'completed':
        return 'Ready for AI';
      case 'processing':
        return 'Processing...';
      case 'error':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const completedFiles = uploads?.filter(u => u.parseStatus === 'completed').length || 0;
  const totalFiles = uploads?.length || 0;

  return (
    <div className="bg-background border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2 text-sm">
          <FileText size={16} className="text-primary" />
          Document Library
        </h3>
        {totalFiles > 0 && (
          <span className="text-xs text-muted-foreground">
            {completedFiles}/{totalFiles} ready
          </span>
        )}
      </div>

      {/* Upload Area */}
      <div className="mb-4">
        <label className="flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-primary/20 transition-all duration-200 text-sm">
          <Upload size={16} className="text-primary" />
          <span className="text-primary font-medium">Upload PDF Files</span>
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
        <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
          globalMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          globalMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {globalMessage.type === 'success' && <CheckCircle size={16} />}
          {globalMessage.type === 'error' && <AlertCircle size={16} />}
          {globalMessage.type === 'info' && <FileText size={16} />}
          <span>{globalMessage.text}</span>
          <button
            onClick={() => setGlobalMessage(null)}
            className="ml-auto hover:opacity-70"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="mb-4 space-y-2">
          {uploadingFiles.map((uploadingFile) => (
            <div key={uploadingFile.id} className="bg-gray-50 rounded-lg p-3 border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium truncate">{uploadingFile.file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {uploadingFile.status === 'uploading' ? `${uploadingFile.progress}%` :
                   uploadingFile.status === 'uploaded' ? 'Uploaded' : 'Error'}
                </span>
              </div>
              {uploadingFile.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadingFile.progress}%` }}
                  />
                </div>
              )}
              {uploadingFile.status === 'error' && (
                <p className="text-xs text-red-600">{uploadingFile.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploads && uploads.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {uploads.map((upload) => (
            <div
              key={upload._id}
              className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:shadow-sm transition-all duration-200"
            >
              {getStatusIcon(upload.parseStatus)}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{upload.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {getStatusText(upload.parseStatus)}
                  {upload.parseError && ` - ${upload.parseError}`}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {upload.parseStatus === 'pending' && (
                  <button
                    onClick={() => handleParseFile(upload._id, upload.fileName)}
                    className="p-1.5 hover:bg-blue-100 rounded-md transition-colors"
                    title="Process file"
                  >
                    <Play size={14} className="text-blue-600" />
                  </button>
                )}

                {upload.url && (
                  <a
                    href={upload.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                    title="View document"
                  >
                    <ExternalLink size={14} className="text-gray-600" />
                  </a>
                )}

                <button
                  onClick={() => handleDeleteFile(upload._id, upload.fileName)}
                  className="p-1.5 hover:bg-red-100 rounded-md transition-colors"
                  title="Remove file"
                >
                  <Trash2 size={14} className="text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {(!uploads || uploads.length === 0) && uploadingFiles.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No documents uploaded yet</p>
          <p className="text-xs">Upload PDF files to get started</p>
        </div>
      )}

      {/* Summary */}
      {totalFiles > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{totalFiles} document{totalFiles !== 1 ? 's' : ''} uploaded</span>
            <span>{completedFiles} ready for AI analysis</span>
          </div>
          {completedFiles > 0 && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(completedFiles / totalFiles) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}
      <WebInsights sessionId={sessionId}/>
    </div>
  );
}