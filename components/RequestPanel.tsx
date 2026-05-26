"use client";

import { useState } from "react";
import { RequestConfig, HttpMethod, KeyValuePair } from "@/lib/types";
import { generateId } from "@/lib/storage";

interface Props {
  request: RequestConfig;
  onChange: (req: RequestConfig) => void;
  onSend: () => void;
  loading: boolean;
}

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "text-green-400",
  POST: "text-yellow-400",
  PUT: "text-blue-400",
  PATCH: "text-purple-400",
  DELETE: "text-red-400",
};

export default function RequestPanel({ request, onChange, onSend, loading }: Props) {
  const [activeTab, setActiveTab] = useState<"headers" | "body" | "auth">("headers");

  const updateField = <K extends keyof RequestConfig>(key: K, value: RequestConfig[K]) => {
    onChange({ ...request, [key]: value });
  };

  const addHeader = () => {
    const newHeader: KeyValuePair = { id: generateId(), key: "", value: "", enabled: true };
    updateField("headers", [...request.headers, newHeader]);
  };

  const updateHeader = (id: string, field: keyof KeyValuePair, value: string | boolean) => {
    updateField(
      "headers",
      request.headers.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  const removeHeader = (id: string) => {
    updateField(
      "headers",
      request.headers.filter((h) => h.id !== id)
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* Method + URL bar */}
      <div className="flex gap-2">
        <select
          value={request.method}
          onChange={(e) => updateField("method", e.target.value as HttpMethod)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold focus:border-teal-400 focus:outline-none"
        >
          {METHODS.map((m) => (
            <option key={m} value={m} className={METHOD_COLORS[m]}>
              {m}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={request.url}
          onChange={(e) => updateField("url", e.target.value)}
          placeholder="https://api.example.com/endpoint"
          className="tool-input flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") onSend();
          }}
        />

        <button onClick={onSend} disabled={loading} className="tool-btn whitespace-nowrap">
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Method color indicator */}
      <div className="flex items-center gap-2 text-xs">
        <span className={`font-bold ${METHOD_COLORS[request.method]}`}>{request.method}</span>
        <span className="text-slate-500">{request.url || "No URL"}</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {(["headers", "body", "auth"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-teal-400 text-teal-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab}
            {tab === "headers" && request.headers.filter((h) => h.key.trim()).length > 0 && (
              <span className="ml-1 text-xs text-slate-500">
                ({request.headers.filter((h) => h.key.trim()).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "headers" && (
        <div className="space-y-2">
          {request.headers.map((header) => (
            <div key={header.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={header.enabled}
                onChange={(e) => updateHeader(header.id, "enabled", e.target.checked)}
                className="rounded border-slate-700 accent-teal-500"
              />
              <input
                type="text"
                value={header.key}
                onChange={(e) => updateHeader(header.id, "key", e.target.value)}
                placeholder="Header name"
                className="tool-input flex-1"
              />
              <input
                type="text"
                value={header.value}
                onChange={(e) => updateHeader(header.id, "value", e.target.value)}
                placeholder="Value"
                className="tool-input flex-1"
              />
              <button
                onClick={() => removeHeader(header.id)}
                className="text-slate-500 hover:text-red-400 text-lg px-1"
              >
                ×
              </button>
            </div>
          ))}
          <button onClick={addHeader} className="tool-btn-ghost text-xs">
            + Add Header
          </button>
        </div>
      )}

      {activeTab === "body" && (
        <div>
          <textarea
            value={request.body}
            onChange={(e) => updateField("body", e.target.value)}
            placeholder='{"key": "value"}'
            rows={10}
            className="tool-input font-mono text-xs resize-none"
          />
          <p className="text-xs text-slate-500 mt-1">
            Body is sent for POST, PUT, PATCH, and DELETE requests.
          </p>
        </div>
      )}

      {activeTab === "auth" && (
        <div className="space-y-3">
          <select
            value={request.authType}
            onChange={(e) => updateField("authType", e.target.value as RequestConfig["authType"])}
            className="tool-input"
          >
            <option value="none">No Auth</option>
            <option value="bearer">Bearer Token</option>
            <option value="basic">Basic Auth</option>
          </select>

          {request.authType === "bearer" && (
            <input
              type="text"
              value={request.authToken}
              onChange={(e) => updateField("authToken", e.target.value)}
              placeholder="Enter token"
              className="tool-input font-mono text-xs"
            />
          )}

          {request.authType === "basic" && (
            <div className="space-y-2">
              <input
                type="text"
                value={request.authUsername}
                onChange={(e) => updateField("authUsername", e.target.value)}
                placeholder="Username"
                className="tool-input"
              />
              <input
                type="password"
                value={request.authPassword}
                onChange={(e) => updateField("authPassword", e.target.value)}
                placeholder="Password"
                className="tool-input"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
