"use client";

import { useState } from "react";
import RequestPanel from "@/components/RequestPanel";
import ResponsePanel from "@/components/ResponsePanel";
import Sidebar from "@/components/Sidebar";
import SnippetModal from "@/components/SnippetModal";
import EnvModal from "@/components/EnvModal";
import { RequestConfig, ResponseData, HttpMethod } from "@/lib/types";
import { generateId } from "@/lib/storage";

function createEmptyRequest(): RequestConfig {
  return {
    id: generateId(),
    name: "New Request",
    method: "GET",
    url: "",
    headers: [{ id: generateId(), key: "", value: "", enabled: true }],
    body: "",
    authType: "none",
    authToken: "",
    authUsername: "",
    authPassword: "",
  };
}

export default function Home() {
  const [currentRequest, setCurrentRequest] = useState<RequestConfig>(createEmptyRequest());
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSnippet, setShowSnippet] = useState(false);
  const [showEnv, setShowEnv] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"collections" | "history">("history");

  const handleSend = async () => {
    if (!currentRequest.url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    const startTime = performance.now();

    try {
      const headers: Record<string, string> = {};
      currentRequest.headers
        .filter((h) => h.enabled && h.key.trim())
        .forEach((h) => {
          headers[h.key] = h.value;
        });

      if (currentRequest.authType === "bearer" && currentRequest.authToken) {
        headers["Authorization"] = `Bearer ${currentRequest.authToken}`;
      } else if (currentRequest.authType === "basic" && currentRequest.authUsername) {
        const encoded = btoa(`${currentRequest.authUsername}:${currentRequest.authPassword}`);
        headers["Authorization"] = `Basic ${encoded}`;
      }

      const fetchOptions: RequestInit = {
        method: currentRequest.method,
        headers,
      };

      if (currentRequest.method !== "GET" && currentRequest.body.trim()) {
        fetchOptions.body = currentRequest.body;
        if (!headers["Content-Type"]) {
          headers["Content-Type"] = "application/json";
        }
      }

      const res = await fetch(currentRequest.url, fetchOptions);
      const endTime = performance.now();
      const bodyText = await res.text();

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: bodyText,
        time: Math.round(endTime - startTime),
        size: new Blob([bodyText]).size,
      });

      // Save to history
      const { loadHistory, saveHistory } = await import("@/lib/storage");
      const history = loadHistory();
      history.unshift({
        id: generateId(),
        method: currentRequest.method,
        url: currentRequest.url,
        status: res.status,
        time: Math.round(endTime - startTime),
        timestamp: Date.now(),
      });
      saveHistory(history.slice(0, 50));
    } catch (err) {
      const endTime = performance.now();
      setError(err instanceof Error ? err.message : "Request failed");
      setResponse({
        status: 0,
        statusText: "Error",
        headers: {},
        body: err instanceof Error ? err.message : "Request failed",
        time: Math.round(endTime - startTime),
        size: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromHistory = (method: HttpMethod, url: string) => {
    setCurrentRequest((prev) => ({ ...prev, method, url }));
  };

  const handleSelectFromCollection = (req: RequestConfig) => {
    setCurrentRequest(req);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        tab={sidebarTab}
        onTabChange={setSidebarTab}
        onSelectHistory={handleSelectFromHistory}
        onSelectCollection={handleSelectFromCollection}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <h1 className="text-lg font-semibold text-slate-100">API Client</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowEnv(true)} className="tool-btn-ghost">
              Env Variables
            </button>
            <button onClick={() => setShowSnippet(true)} className="tool-btn-ghost">
              Code Snippet
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="lg:w-1/2 border-r border-slate-800 overflow-auto">
            <RequestPanel
              request={currentRequest}
              onChange={setCurrentRequest}
              onSend={handleSend}
              loading={loading}
            />
          </div>
          <div className="lg:w-1/2 overflow-auto">
            <ResponsePanel response={response} error={error} loading={loading} />
          </div>
        </div>
      </div>

      {showSnippet && (
        <SnippetModal request={currentRequest} onClose={() => setShowSnippet(false)} />
      )}
      {showEnv && <EnvModal onClose={() => setShowEnv(false)} />}
    </div>
  );
}
