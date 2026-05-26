"use client";

import { useState, useEffect } from "react";
import { Collection, HistoryEntry, HttpMethod, RequestConfig } from "@/lib/types";
import {
  loadHistory,
  loadCollections,
  saveCollections,
  generateId,
} from "@/lib/storage";

interface Props {
  tab: "collections" | "history";
  onTabChange: (tab: "collections" | "history") => void;
  onSelectHistory: (method: HttpMethod, url: string) => void;
  onSelectCollection: (req: RequestConfig) => void;
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "text-green-400",
  POST: "text-yellow-400",
  PUT: "text-blue-400",
  PATCH: "text-purple-400",
  DELETE: "text-red-400",
};

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Sidebar({ tab, onTabChange, onSelectHistory, onSelectCollection }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
    setCollections(loadCollections());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHistory(loadHistory());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const addCollection = () => {
    if (!newCollectionName.trim()) return;
    const updated = [
      ...collections,
      { id: generateId(), name: newCollectionName.trim(), requests: [] },
    ];
    setCollections(updated);
    saveCollections(updated);
    setNewCollectionName("");
  };

  const deleteCollection = (id: string) => {
    const updated = collections.filter((c) => c.id !== id);
    setCollections(updated);
    saveCollections(updated);
  };

  if (collapsed) {
    return (
      <div className="w-10 border-r border-slate-800 flex flex-col items-center py-3">
        <button
          onClick={() => setCollapsed(false)}
          className="text-slate-400 hover:text-slate-200 text-lg"
          title="Expand sidebar"
        >
          ☰
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-slate-800 flex flex-col bg-slate-900/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-800">
        <div className="flex gap-1">
          {(["history", "collections"] as const).map((t) => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              className={`px-2 py-1 text-xs rounded capitalize transition-colors ${
                tab === t
                  ? "bg-slate-700 text-slate-200"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="text-slate-500 hover:text-slate-300 text-sm"
          title="Collapse sidebar"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {tab === "history" && (
          <>
            {history.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-xs">No history yet</p>
                <p className="text-slate-600 text-xs mt-1">Send a request to get started</p>
              </div>
            ) : (
              history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => onSelectHistory(entry.method, entry.url)}
                  className="w-full text-left px-2 py-2 rounded hover:bg-slate-800 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${METHOD_COLORS[entry.method]} w-12`}>
                      {entry.method}
                    </span>
                    <span className="text-xs text-slate-400 truncate flex-1">
                      {entry.url.replace(/^https?:\/\//, "")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs ${entry.status >= 400 ? "text-red-400" : "text-green-400"}`}>
                      {entry.status}
                    </span>
                    <span className="text-xs text-slate-600">{entry.time}ms</span>
                    <span className="text-xs text-slate-600 ml-auto">{timeAgo(entry.timestamp)}</span>
                  </div>
                </button>
              ))
            )}
          </>
        )}

        {tab === "collections" && (
          <>
            <div className="flex gap-1 mb-2">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="New collection"
                className="tool-input text-xs flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCollection();
                }}
              />
              <button onClick={addCollection} className="tool-btn text-xs px-2">
                +
              </button>
            </div>

            {collections.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-xs">No collections</p>
                <p className="text-slate-600 text-xs mt-1">Create one to save requests</p>
              </div>
            ) : (
              collections.map((col) => (
                <div key={col.id} className="mb-2">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-xs font-medium text-slate-300">{col.name}</span>
                    <button
                      onClick={() => deleteCollection(col.id)}
                      className="text-slate-600 hover:text-red-400 text-xs"
                    >
                      ×
                    </button>
                  </div>
                  {col.requests.length === 0 ? (
                    <p className="text-xs text-slate-600 px-2">Empty</p>
                  ) : (
                    col.requests.map((req) => (
                      <button
                        key={req.id}
                        onClick={() => onSelectCollection(req)}
                        className="w-full text-left px-3 py-1 rounded hover:bg-slate-800 transition-colors"
                      >
                        <span className={`text-xs font-bold ${METHOD_COLORS[req.method]}`}>
                          {req.method}
                        </span>{" "}
                        <span className="text-xs text-slate-400 truncate">{req.name}</span>
                      </button>
                    ))
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
