"use client";

import React, { ChangeEvent, useState, useMemo, useCallback } from "react";
import {
  ExternalLink,
  Upload,
  Lightbulb,
  Trash2,
  Archive,
  ChevronDown,
  ChevronUp,
  Plus,
  Globe,
  Search,
  AlertCircle,
  CheckCircle,
  Loader2,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
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
  const scrapInsightsFromWeb = useAction(
    api.functions.scrapeAndStore.scrapAndStoreInsights
  );
  const getInsights = useQuery(api.crud.insights.getBySession, { sessionId });
  const [insightLoading, setInsightLoading] = useState(false);
  const [selectedScrapedData, setSelectedScrapedData] =
    useState<ScrapedData | null>(null);
  const [topic, setTopic] = useState("");
  const [urls, setUrls] = useState<string[]>([""]);
  const [urlErrors, setUrlErrors] = useState<string[]>([""]);
  const [expandedInsights, setExpandedInsights] = useState<{
    [key: string]: boolean;
  }>({});

  // Fetch all scraped data for the session
  const scrapedDataByInsight = useQuery(api.crud.scrapedData.get, {
    sessionId,
  });

  // Group scraped data by insightId for efficient lookup
  const groupedScrapedData = useMemo(() => {
    if (!scrapedDataByInsight) return {};
    return scrapedDataByInsight.reduce(
      (acc, data) => {
        const insightId = data.insightId;
        if (insightId) {
          if (!acc[insightId]) {
            acc[insightId] = [];
          }
          acc[insightId].push(data);
        }
        return acc;
      },
      {} as { [key: string]: ScrapedData[] }
    );
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
        .map((url) => url.trim())
        .filter((url) => url.length > 0 && validateUrl(url) === "");

      await scrapInsightsFromWeb({
        sessionId,
        topic: topic.trim() || undefined,
        customUrls: validUrls.length > 0 ? validUrls : undefined,
      });
    } catch (error) {
      console.error("Error generating research insight:", error);
    }
    setInsightLoading(false);
  };

  const toggleInsight = useCallback((insightId: string) => {
    setExpandedInsights((prev) => ({
      ...prev,
      [insightId]: !prev[insightId],
    }));
  }, []);

  const truncate = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
    }
    return text;
  };
  const hasValidUrls = urls.some(
    (url) => url.trim() && !validateUrl(url.trim())
  );
  const hasErrors = urlErrors.some((error) => error !== "");
  const canGenerate =
    !insightLoading && !hasErrors && (topic.trim() || hasValidUrls);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 dark:border-slate-700/50 dark:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-500/10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-primary to-primary rounded-lg shadow-sm dark:from-blue-600 dark:to-indigo-700 dark:shadow-lg">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Web Research Insights
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Generate insights from web sources and custom URLs
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="space-y-6">
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">
            <Search className="w-4 h-4 dark:text-blue-400" />
            Research Topic
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g., AI in Healthcare, Climate Change Solutions..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={`w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                       transition-all duration-200 placeholder:text-gray-400
                       group-hover:border-gray-300
                       dark:bg-slate-800/50 dark:border-slate-600/50 dark:text-white
                       dark:focus:ring-blue-500/30 dark:focus:border-blue-500/50
                       dark:placeholder:text-slate-500 dark:group-hover:border-slate-500/70 dark:backdrop-blur-sm`}
            />
            {topic && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle className="w-4 h-4 text-green-500 dark:text-emerald-400" />
              </div>
            )}
          </div>
        </div>
        {/* URLs Input */}
        <div className="group">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">
            <LinkIcon className="w-4 h-4 dark:text-blue-400" />
            Reference URLs
            <span className="text-xs text-gray-400 font-normal dark:text-slate-500">
              (optional)
            </span>
          </label>
          <div className="space-y-3">
            {urls.map((url, index) => (
              <div key={index} className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={`https://example.com/article-${index + 1}`}
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      className={`w-full px-4 py-3 bg-white border rounded-lg text-sm
                               focus:outline-none focus:ring-2 transition-all duration-200
                               placeholder:text-gray-400 pr-10
                               dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 dark:backdrop-blur-sm
                               ${
                                 urlErrors[index]
                                   ? `border-red-300 focus:ring-red-500/20 focus:border-red-500 dark:border-red-400/50 dark:focus:ring-red-500/20 dark:focus:border-red-400`
                                   : `border-gray-200 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 dark:border-slate-600/50 dark:focus:ring-blue-500/30 dark:focus:border-blue-500/50 dark:hover:border-slate-500/70`
                               }`}
                    />
                    {url && !urlErrors[index] && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle className="w-4 h-4 text-green-500 dark:text-emerald-400" />
                      </div>
                    )}
                    {urlErrors[index] && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                      </div>
                    )}
                  </div>
                  {urls.length > 1 && (
                    <button
                      onClick={() => removeUrlField(index)}
                      className={`p-2 text-gray-400 hover:text-red-500 hover:bg-red-50
                               rounded-lg transition-all duration-200
                               dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-500/10`}
                      title="Remove URL"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {urlErrors[index] && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    {urlErrors[index]}
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={addUrlField}
              className={`flex items-center gap-2 px-3 py-2 text-sm text-blue-600
                       hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200
                       border border-dashed border-blue-200 hover:border-blue-300 w-full justify-center
                       dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-500/10
                       dark:border-blue-500/30 dark:hover:border-blue-400/50`}
            >
              <Plus className="w-4 h-4" />
              Add Another URL
            </button>
          </div>
        </div>
        {/* Generate Button */}
        <div className="pt-2">
          <button
            onClick={handleGenerateInsight}
            disabled={!canGenerate}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl
                     font-medium text-sm transition-all duration-300 transform
                     ${
                       canGenerate
                         ? `bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] dark:from-blue-600 dark:via-indigo-600 dark:to-purple-600 dark:hover:from-blue-700 dark:hover:via-indigo-700 dark:hover:to-purple-700 dark:hover:shadow-blue-500/25`
                         : `bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-slate-700/50 dark:text-slate-500`
                     }`}
          >
            {insightLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Insights...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Research Insights
              </>
            )}
          </button>
        </div>
      </div>

      {/* Current Insights */}
      {getInsights && getInsights.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
              Generated Insights
            </h4>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-3 dark:from-slate-600"></div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full dark:text-slate-300 dark:bg-slate-700/50">
              {getInsights.length} insight{getInsights.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {getInsights.map((insight, index) => (
              <div
                key={insight._id}
                className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md
                         transition-all duration-300 overflow-hidden group
                         dark:bg-slate-800/40 dark:border-slate-700/50 dark:shadow-lg dark:hover:shadow-xl dark:hover:shadow-blue-500/10 dark:backdrop-blur-sm`}
              >
                <div
                  className={`flex items-center justify-between p-4 cursor-pointer
                           hover:bg-gray-50/50 transition-colors duration-200
                           dark:hover:bg-slate-700/30`}
                  onClick={() => toggleInsight(insight._id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 bg-gradient-to-br from-primary to-primary
                                  rounded-lg flex items-center justify-center text-white text-sm font-semibold
                                  dark:from-blue-600 dark:to-indigo-700 dark:shadow-lg`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-300">
                        {insight.topic || "Untitled Research"}
                      </h5>
                      <p className="text-xs text-gray-500 mt-0.5 dark:text-slate-400">
                        {new Date(insight._creationTime).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {groupedScrapedData[insight._id]?.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full dark:bg-blue-500/20 dark:text-blue-300 dark:border dark:border-blue-500/30">
                        {groupedScrapedData[insight._id].length} source
                        {groupedScrapedData[insight._id].length !== 1
                          ? "s"
                          : ""}
                      </span>
                    )}
                    <div className="p-1 rounded-lg group-hover:bg-white transition-colors dark:group-hover:bg-slate-600/50">
                      {expandedInsights[insight._id] ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>
                {expandedInsights[insight._id] && (
                  <div className="border-t border-gray-100 bg-gray-50/30 dark:border-slate-700/50 dark:bg-slate-800/20">
                    <div className="p-4 space-y-4">
                      {/* URLs Section */}
                      {insight.urls && insight.urls.length > 0 && (
                        <div>
                          <h6 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">
                            <LinkIcon className="w-4 h-4 dark:text-blue-400" />
                            Reference URLs
                          </h6>
                          <div className="space-y-2">
                            {insight.urls.map((url: string, urlIdx: number) => (
                              <a
                                key={urlIdx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 p-2 bg-white border border-gray-200
                                         rounded-lg hover:border-blue-300 hover:bg-blue-50/50
                                         transition-all duration-200 group/link text-sm
                                         dark:bg-slate-700/30 dark:border-slate-600/50 dark:hover:border-blue-400/50 dark:hover:bg-blue-500/10`}
                              >
                                <ExternalLink className="w-4 h-4 text-gray-400 group-hover/link:text-blue-500 flex-shrink-0 dark:text-slate-400 dark:group-hover/link:text-blue-400" />
                                <span className="text-gray-600 group-hover/link:text-blue-600 truncate dark:text-slate-300 dark:group-hover/link:text-blue-300">
                                  {url}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Scraped Data Section */}
                      {groupedScrapedData[insight._id]?.length > 0 && (
                        <div>
                          <h6 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3 dark:text-slate-300">
                            <Archive className="w-4 h-4 dark:text-blue-400" />
                            Scraped Content
                          </h6>
                          <div className="grid gap-3">
                            {groupedScrapedData[insight._id].map(
                              (data: ScrapedData) => (
                                <div
                                  key={data._id}
                                  className={`p-3 bg-white border border-gray-200 rounded-lg
                                         hover:border-blue-300 hover:shadow-sm cursor-pointer
                                         transition-all duration-200 group/card
                                         dark:bg-slate-700/30 dark:border-slate-600/50 dark:hover:border-blue-400/50 dark:hover:shadow-lg dark:hover:shadow-blue-500/10`}
                                  onClick={() => setSelectedScrapedData(data)}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <h6
                                        className={`font-medium text-gray-900 group-hover/card:text-blue-600
                                                 transition-colors text-sm line-clamp-2
                                                 dark:text-white dark:group-hover/card:text-blue-300`}
                                      >
                                        {data.title}
                                      </h6>
                                      <p className="text-xs text-gray-500 mt-1 truncate dark:text-slate-400">
                                        {truncate(data.url, 40)}
                                      </p>
                                    </div>
                                    <ExternalLink
                                      className={`w-4 h-4 text-gray-400 group-hover/card:text-blue-500
                                             transition-colors flex-shrink-0 mt-0.5
                                             dark:text-slate-400 dark:group-hover/card:text-blue-400`}
                                    />
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!getInsights || getInsights.length === 0) && !insightLoading && (
        <div className="mt-8 text-center py-8">
          <div
            className={`w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full
                        flex items-center justify-center mx-auto mb-4
                        dark:from-slate-700 dark:to-slate-800 dark:shadow-lg`}
          >
            <Search className="w-8 h-8 text-gray-400 dark:text-slate-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2 dark:text-white">
            No insights yet
          </h4>
          <p className="text-sm text-gray-500 max-w-sm mx-auto dark:text-slate-400">
            Enter a research topic or add reference URLs to generate your first
            web research insight.
          </p>
        </div>
      )}

      {selectedScrapedData && (
        <ScrapDataDetailModal
          scrapedData={selectedScrapedData}
          setSelectedScrapData={setSelectedScrapedData}
        />
      )}

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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
