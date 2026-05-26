"use client";

import { useState } from "react";
import { ResponseData } from "@/lib/types";

interface Props {
  response: ResponseData | null;
  error: string | null;
  loading: boolean;
}

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (status >= 300 && status < 400) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  if (status >= 400 && status < 500) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  if (status >= 500) return "bg-red-500/20 text-red-400 border-red-500/30";
  return "bg-slate-500/20 text-slate-400 border-slate-500/30";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function tryFormatJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

export default function ResponsePanel({ response, error, loading }: Props) {
  const [viewMode, setViewMode] = useState<"pretty" | "raw" | "headers">("pretty");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Sending request...</p>
        </div>
      </div>
    );
  }

  if (error && !response) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-2">
          <div className="text-red-400 text-2xl">⚠</div>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-2">
          <div className="text-slate-600 text-4xl">↗</div>
          <p className="text-slate-500 text-sm">Send a request to see the response</p>
          <p className="text-slate-600 text-xs">Enter a URL and click Send or press Enter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Status bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(response.status)}`}
        >
          {response.status} {response.statusText}
        </span>
        <span className="text-xs text-slate-400">
          ⏱ {response.time}ms
        </span>
        <span className="text-xs text-slate-400">
          📦 {formatSize(response.size)}
        </span>
      </div>

      {/* View mode tabs */}
      <div className="flex border-b border-slate-800">
        {(["pretty", "raw", "headers"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 text-sm capitalize transition-colors ${
              viewMode === mode
                ? "border-b-2 border-teal-400 text-teal-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Content */}
      {viewMode === "pretty" && (
        <pre className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-300 overflow-auto max-h-[60vh] whitespace-pre-wrap break-words">
          {tryFormatJson(response.body)}
        </pre>
      )}

      {viewMode === "raw" && (
        <pre className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-300 overflow-auto max-h-[60vh] whitespace-pre-wrap break-words">
          {response.body}
        </pre>
      )}

      {viewMode === "headers" && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-1">
          {Object.entries(response.headers).length === 0 ? (
            <p className="text-slate-500 text-sm">No headers available</p>
          ) : (
            Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex gap-2 text-xs font-mono">
                <span className="text-teal-400 font-semibold min-w-0">{key}:</span>
                <span className="text-slate-300 break-all">{value}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
