"use client";

import React, { ChangeEvent, useState, useMemo } from "react";
import { ExternalLink, Upload, Lightbulb, Trash2, Archive, ChevronDown, ChevronUp } from "lucide-react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Markdown from "react-markdown";
import Loading from "@/app/loading";
import ScrapDataDetailModal from "./ScrapDataDetailModal";

interface UploadProps {
  sessionId: Id<"sessions">;
}

interface ScrapedData {
  _id: Id<"scrapedData">;
  _creationTime: number;
  updatedAt?: number;
  deletedAt?: number;
  insightId?: Id<"insights">;
  title: string;
  sessionId: Id<"sessions">;
  content: string;
  url: string;
}

export default function WebInsights({ sessionId }: UploadProps) {
  const scrapInsightsFromWeb = useAction(api.functions.scrapeAndStore.scrapAndStoreInsights);
  const getInsights = useQuery(api.crud.insights.getBySession, { sessionId });
  const [insightLoading, setInsightLoading] = useState(false);
  const [selectedScrapedData, setSelectedScrapedData] = useState<ScrapedData | null>(null);
  const [topic, setTopic] = useState("");
  const [urls, setUrls] = useState<string[]>([""]);
  const [urlErrors, setUrlErrors] = useState<string[]>([""]);
  const [expandedInsights, setExpandedInsights] = useState<{ [key: string]: boolean }>({});

  // Fetch all scraped data for the session
  const scrapedDataByInsight = useQuery(api.crud.scrapedData.get, { sessionId });

  // Group scraped data by insightId for efficient lookup
  const groupedScrapedData = useMemo(() => {
    if (!scrapedDataByInsight) return {};
    return scrapedDataByInsight.reduce((acc, data) => {
      const insightId = data.insightId;
      console.log("data.insightId", data.insightId);
      if (insightId) {
        if (!acc[insightId]) {
          acc[insightId] = [];
        }
        acc[insightId].push(data);
      }
      return acc;
    }, {} as { [key: string]: ScrapedData[] });
  }, [scrapedDataByInsight]);

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

      await scrapInsightsFromWeb({
        sessionId,
        topic: topic.trim() || undefined,
        customUrls: validUrls.length > 0 ? validUrls : undefined
      });
    } catch (error) {
      console.error("Error generating research insight:", error);
    }
    setInsightLoading(false);
  };

  const toggleInsight = (insightId: string) => {
    setExpandedInsights(prev => ({
      ...prev,
      [insightId]: !prev[insightId]
    }));
  };

  return (
    <div className="bg-background border border-border rounded-lg p-4">
      {/* Topic and URLs input + Generate button */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          {/* Topic input */}
          <div>
            <label className="text-sm font-semibold mb-1 block text-gray-700">Topic (optional)</label>
            <input
              type="text"
              placeholder="E.g. AI in Healthcare"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
            />
          </div>
          {/* URLs input */}
          <div>
            <label className="text-sm font-semibold mb-1 block text-gray-700">Reference URLs (optional)</label>
            <div className="space-y-2">
              {urls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={`Paste URL #${index + 1}`}
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      className={`px-3 py-2 border rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 ${
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
                className="text-sm text-primary hover:underline"
              >
                + Add another URL
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md cursor-pointer hover:bg-yellow-600 transition-colors text-sm font-medium"
            disabled={insightLoading || urlErrors.some(error => error !== "")}
            onClick={handleGenerateInsight}
          >
            <Lightbulb size={18} />
            {insightLoading ? "Generating..." : "Generate Research Insight"}
          </button>
        </div>
      </div>

      {/* Current Insights */}
      {getInsights && getInsights.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-base text-gray-700 mb-3">Current Insights</h4>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {getInsights.map((insight) => (
              <div
                key={insight._id}
                className="p-4 border rounded-lg shadow-sm bg-white"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleInsight(insight._id)}
                >
                  <h4 className="font-semibold text-base text-gray-800">
                    {insight.topic || "Untitled Insight"}
                  </h4>
                  {expandedInsights[insight._id] ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                {expandedInsights[insight._id] && (
                  <div className="mt-3 space-y-3">
                    {/* URLs */}
                    {insight.urls && insight.urls.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 font-medium">URLs:</p>
                        <ul className="text-sm text-gray-600 list-disc pl-5">
                          {insight.urls.map((url: string, urlIdx: number) => (
                            <li key={urlIdx}>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Scraped Data Cards */}
                    {groupedScrapedData[insight._id]?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Scraped Data:</p>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          {groupedScrapedData[insight._id].map((data: ScrapedData) => (
                            <div
                              key={data._id}
                              className="p-3 border rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                              onClick={() => setSelectedScrapedData(data)}
                            >
                              <h5 className="text-sm font-medium text-gray-800">{data.title}</h5>
                              <a
                                href={data.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary text-xs hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View Source <ExternalLink size={14} className="inline-block ml-1" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedScrapedData && (
        <ScrapDataDetailModal
          scrapedData={selectedScrapedData}
          setSelectedScrapData={setSelectedScrapedData}
        />
      )}
    </div>
  );
}