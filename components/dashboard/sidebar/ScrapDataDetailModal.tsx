import { ExternalLink } from "lucide-react";
import React from "react";
import Markdown from "react-markdown";

interface InsightDetailModalProps {
  scrapedData: any;
  setSelectedScrapData: (insight: any) => void;
}

const ScrapDataDetailModal: React.FC<InsightDetailModalProps> = ({
  scrapedData,
  setSelectedScrapData,
}) => {
  if (!scrapedData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-18">
      <div className="bg-white rounded-xl p-8 max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative">
      {/* Close button */}
      <button
        onClick={() => setSelectedScrapData(null)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-bold text-xl"
        aria-label="Close"
      >
        ✕
      </button>

      {/* Insight title */}
      <h4 className="text-xl font-semibold mb-5">{scrapedData.title}</h4>
      <a
        href={scrapedData.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline mb-3 block text-base"
      >
        View Source <ExternalLink size={16} className="inline-block ml-1" />
      </a>

      {/* Insight content (Markdown support) */}
      <div className="text-base text-gray-700 whitespace-pre-wrap">
        <Markdown>{scrapedData.content}</Markdown>
      </div>
      </div>
    </div>
  );
};

export default ScrapDataDetailModal;