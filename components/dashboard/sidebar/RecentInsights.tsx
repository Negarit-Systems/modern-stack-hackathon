"use client";

import React, { ChangeEvent, useState } from "react";
import { ExternalLink, Upload, Lightbulb, Trash2, Archive } from "lucide-react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Markdown from "react-markdown";
import Loading from "@/app/loading";
import InsightDetailModal from "./InsightDetailModel";

interface UploadProps {
  onFileSelected?: (file: File) => void;
  sessionId: Id<"sessions">;
}

export default function RecentInsights({ onFileSelected, sessionId }: UploadProps) {
  const generateUploadUrl = useMutation(api.crud.upload.generateUploadUrl);
  const createUpload = useMutation(api.crud.upload.create);
  const createInsight = useMutation(api.crud.insights.create);
  const uploads = useQuery(api.crud.upload.getBySession, { sessionId });
  const parseText = useAction(api.functions.processFile.processSessionFiles);
  const scrapeUrls = useAction(api.functions.scrapeAndStore.scrapAndStoreInsights);
  const scrappedInsights = useQuery(api.crud.scrapedData.get, { sessionId });
  const archivedInsights = useQuery(api.crud.insights.getBySession, { sessionId });

  const [parseLoading, setParseLoading] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<any | null>(null);
  const [topic, setTopic] = useState("");
  const [urls, setUrls] = useState<string[]>([""]);
  const [urlErrors, setUrlErrors] = useState<string[]>([""]);

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
        sessionId: sessionId!,
      },
    });
  };

  const validateUrl = (url: string): string => {
    if (!url) return "";
    try {
      new URL(url);
      return "";
    } catch {
      return "Invalid URL";
    }
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);

    const newErrors = [...urlErrors];
    newErrors[index] = validateUrl(value);
    setUrlErrors(newErrors);
  };

  const addUrlField = () => {
    setUrls([...urls, ""]);
    setUrlErrors([...urlErrors, ""]);
  };

  const removeUrlField = (index: number) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
      setUrlErrors(urlErrors.filter((_, i) => i !== index));
    }
  };

  const handleGenerateInsight = async () => {
    setInsightLoading(true);
    try {
      const validUrls = urls
        .map(url => url.trim())
        .filter(url => url.length > 0 && validateUrl(url) === "");

      await scrapeUrls({
        sessionId,
        topic: topic.trim() || undefined,
        customUrls: validUrls.length > 0 ? validUrls : undefined
      });
    } catch (error) {
      console.error("Error generating research insight:", error);
    }
    setInsightLoading(false);
  };

  const handleArchiveInsight = async () => {
    if (!scrappedInsights || scrappedInsights.length === 0) {
      console.warn("No insights to archive");
      return;
    }

    try {
      const uploadIds = uploads?.map(upload => upload._id) || [];
      const scrapedDataIds = scrappedInsights?.map(insight => insight._id) || [];
      await createInsight({
        item: {
          sessionId,
          topic: topic.trim() || "Untitled Topic",
          urls: urls.filter(url => url.trim().length > 0 && validateUrl(url) === ""),
          uploadIds,
          scrapedDataIds,
        }
      });
    } catch (error) {
      console.error("Error archiving insight:", error);
    }
  };

  return (
    <div className="bg-background border border-border rounded-lg p-3">
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
        <ExternalLink size={16} className="text-primary" />
        Research Insights
      </h3>

      {/* Topic and URLs input + Upload + Generate + Archive buttons */}
      <div className="space-y-3">
        <div className="flex flex-col gap-4">
          {/* Topic input with label */}
          <div>
            <label className="text-xs font-semibold mb-1 block text-gray-700">Topic (optional)</label>
            <input
              type="text"
              placeholder="E.g. AI in Healthcare"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="px-2 py-1 border rounded-md text-xs w-full focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
            />
          </div>
          {/* URLs input with label and better spacing */}
          <div>
            <label className="text-xs font-semibold mb-1 block text-gray-700">Reference URLs (optional)</label>
            <div className="space-y-2">
              {urls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={`Paste URL #${index + 1}`}
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      className={`px-2 py-1 border rounded-md text-xs w-full focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 ${
                        urlErrors[index] ? "border-red-500" : ""
                      }`}
                    />
                    {urlErrors[index] && (
                      <p className="text-red-500 text-xs mt-1">{urlErrors[index]}</p>
                    )}
                  </div>
                  {urls.length > 1 && (
                    <button
                      onClick={() => removeUrlField(index)}
                      className="text-red-500 hover:text-red-600"
                      title="Remove URL"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addUrlField}
                className="text-xs text-primary hover:underline"
              >
                + Add another URL
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors text-xs">
            <Upload size={20} />
            Upload
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf"
            />
          </label>
          <button
            className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded-md cursor-pointer hover:bg-yellow-600 transition-colors text-xs"
            disabled={insightLoading || urlErrors.some(error => error !== "")}
            onClick={handleGenerateInsight}
          >
            <Lightbulb size={20} />
            {insightLoading ? "Generating..." : "Generate Research Insight"}
          </button>
          <button
            className="flex items-center gap-1 px-2 py-1 bg-gray-500 text-white rounded-md cursor-pointer hover:bg-gray-600 transition-colors text-xs"
            disabled={!scrappedInsights || scrappedInsights.length === 0}
            onClick={handleArchiveInsight}
          >
            <Archive size={20} />
            Archive Insights
          </button>
        </div>
      </div>

      {/* Current Insights */}
      {scrappedInsights && scrappedInsights.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">Current Insights</h4>
          <div className="max-h-64 overflow-y-auto grid grid-cols-1 sm:grid-cols-1 gap-3">
            {scrappedInsights.map((insight, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedInsight(insight)}
                className="p-3 border rounded-lg shadow-sm bg-white cursor-pointer hover:shadow-md transition"
              >
                <h4 className="font-semibold text-sm text-gray-800">
                  {insight.title || "Untitled Insight"}
                </h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedInsight && (
        <InsightDetailModal
          selectedInsight={selectedInsight}
          setSelectedInsight={setSelectedInsight}
        />
      )}

      {/* Archived Insights as collapsible tabs */}
      {archivedInsights && archivedInsights.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2 text-sm text-gray-700">Archived Insights</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {archivedInsights.map((insight, idx) => (
              <details key={idx} className="border rounded-md p-2 bg-gray-50">
                <summary className="cursor-pointer font-semibold text-xs text-gray-800">
                  {insight.topic || "Untitled Archived Insight"}
                </summary>
                <div className="mt-2 text-xs text-gray-700 space-y-2">
                  <div>
                    <strong>Topic:</strong> {insight.topic || "None"}
                  </div>
                  <div>
                    <strong>URLs:</strong> {insight.urls.length > 0 ? (
                      <ul className="list-disc pl-4">
                        {insight.urls.map((url, urlIdx) => (
                          <li key={urlIdx}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "None"
                    )}
                  </div>
                  <div>
                    <strong>Uploads:</strong> {insight.uploadIds.length > 0 ? (
                      <ul className="list-disc pl-4">
                        {uploads?.filter(upload => insight.uploadIds.includes(upload._id)).map(upload => (
                          <li key={upload._id}>
                            <a
                              href={upload.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {upload.fileName}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "None"
                    )}
                  </div>
                  <div>
                    <strong>Scraped Data:</strong> {insight.scrapedDataIds.length > 0 ? (
                      <ul className="list-disc pl-4">
                        {scrappedInsights?.filter(data => insight.scrapedDataIds.includes(data._id)).map(data => (
                          <li key={data._id}>
                            <span
                              className="text-blue-600 hover:underline cursor-pointer"
                              onClick={() => setSelectedInsight(data)}
                            >
                              {data.title || "Untitled Scraped Data"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "None"
                    )}
                  </div>
                  {insight.updatedAt && (
                    <div>
                      <strong>Last Updated:</strong> {new Date(insight.updatedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded PDFs */}
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
              setParseLoading(true);
              try {
                await parseText({ sessionId });
              } catch (error) {
                console.error("Error parsing files:", error);
              }
              setParseLoading(false);
            }}
          >
            {parseLoading ? (
              <span className="flex items-center gap-2">
                <span>Parsing...</span>
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