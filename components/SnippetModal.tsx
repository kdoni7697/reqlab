"use client";

import { useState } from "react";
import { RequestConfig } from "@/lib/types";

interface Props {
  request: RequestConfig;
  onClose: () => void;
}

type Language = "curl" | "fetch" | "python" | "go";

function generateCurl(req: RequestConfig): string {
  const parts = [`curl -X ${req.method}`];
  parts.push(`  '${req.url}'`);

  req.headers
    .filter((h) => h.enabled && h.key.trim())
    .forEach((h) => {
      parts.push(`  -H '${h.key}: ${h.value}'`);
    });

  if (req.authType === "bearer" && req.authToken) {
    parts.push(`  -H 'Authorization: Bearer ${req.authToken}'`);
  } else if (req.authType === "basic" && req.authUsername) {
    parts.push(`  -u '${req.authUsername}:${req.authPassword}'`);
  }

  if (req.method !== "GET" && req.body.trim()) {
    parts.push(`  -d '${req.body}'`);
  }

  return parts.join(" \\\n");
}

function generateFetch(req: RequestConfig): string {
  const headers: Record<string, string> = {};
  req.headers
    .filter((h) => h.enabled && h.key.trim())
    .forEach((h) => {
      headers[h.key] = h.value;
    });

  if (req.authType === "bearer" && req.authToken) {
    headers["Authorization"] = `Bearer ${req.authToken}`;
  } else if (req.authType === "basic" && req.authUsername) {
    headers["Authorization"] = `Basic ${btoa(`${req.authUsername}:${req.authPassword}`)}`;
  }

  const options: string[] = [];
  options.push(`  method: '${req.method}'`);

  if (Object.keys(headers).length > 0) {
    options.push(`  headers: ${JSON.stringify(headers, null, 4)}`);
  }

  if (req.method !== "GET" && req.body.trim()) {
    options.push(`  body: JSON.stringify(${req.body})`);
  }

  return `const response = await fetch('${req.url}', {\n${options.join(",\n")}\n});\nconst data = await response.json();\nconsole.log(data);`;
}

function generatePython(req: RequestConfig): string {
  const lines = ["import requests", ""];
  const headers: Record<string, string> = {};

  req.headers
    .filter((h) => h.enabled && h.key.trim())
    .forEach((h) => {
      headers[h.key] = h.value;
    });

  if (req.authType === "bearer" && req.authToken) {
    headers["Authorization"] = `Bearer ${req.authToken}`;
  }

  if (Object.keys(headers).length > 0) {
    lines.push(`headers = ${JSON.stringify(headers, null, 4)}`);
    lines.push("");
  }

  const methodLower = req.method.toLowerCase();
  let call = `response = requests.${methodLower}('${req.url}'`;

  if (Object.keys(headers).length > 0) {
    call += ", headers=headers";
  }

  if (req.authType === "basic" && req.authUsername) {
    call += `, auth=('${req.authUsername}', '${req.authPassword}')`;
  }

  if (req.method !== "GET" && req.body.trim()) {
    call += `, json=${req.body}`;
  }

  call += ")";
  lines.push(call);
  lines.push("print(response.json())");

  return lines.join("\n");
}

function generateGo(req: RequestConfig): string {
  const lines = [
    "package main",
    "",
    "import (",
    '    "fmt"',
    '    "io"',
    '    "net/http"',
  ];

  if (req.method !== "GET" && req.body.trim()) {
    lines.push('    "strings"');
  }

  lines.push(")", "", "func main() {");

  if (req.method !== "GET" && req.body.trim()) {
    lines.push(`    body := strings.NewReader(\`${req.body}\`)`);
    lines.push(`    req, err := http.NewRequest("${req.method}", "${req.url}", body)`);
  } else {
    lines.push(`    req, err := http.NewRequest("${req.method}", "${req.url}", nil)`);
  }

  lines.push("    if err != nil {");
  lines.push("        panic(err)");
  lines.push("    }");

  req.headers
    .filter((h) => h.enabled && h.key.trim())
    .forEach((h) => {
      lines.push(`    req.Header.Set("${h.key}", "${h.value}")`);
    });

  if (req.authType === "bearer" && req.authToken) {
    lines.push(`    req.Header.Set("Authorization", "Bearer ${req.authToken}")`);
  }

  lines.push("");
  lines.push("    client := &http.Client{}");
  lines.push("    resp, err := client.Do(req)");
  lines.push("    if err != nil {");
  lines.push("        panic(err)");
  lines.push("    }");
  lines.push("    defer resp.Body.Close()");
  lines.push("");
  lines.push("    respBody, _ := io.ReadAll(resp.Body)");
  lines.push('    fmt.Println(string(respBody))');
  lines.push("}");

  return lines.join("\n");
}

export default function SnippetModal({ request, onClose }: Props) {
  const [language, setLanguage] = useState<Language>("curl");
  const [copied, setCopied] = useState(false);

  const generators: Record<Language, (req: RequestConfig) => string> = {
    curl: generateCurl,
    fetch: generateFetch,
    python: generatePython,
    go: generateGo,
  };

  const snippet = generators[language](request);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-200">Code Snippet</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            ✕
          </button>
        </div>

        {/* Language tabs */}
        <div className="flex border-b border-slate-800 px-4">
          {(["curl", "fetch", "python", "go"] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-2 text-xs capitalize transition-colors ${
                language === lang
                  ? "border-b-2 border-teal-400 text-teal-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {lang === "curl" ? "cURL" : lang === "fetch" ? "JavaScript" : lang === "python" ? "Python" : "Go"}
            </button>
          ))}
        </div>

        {/* Code */}
        <div className="flex-1 overflow-auto p-4">
          <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap">
            {snippet}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 py-3 border-t border-slate-800">
          <button onClick={handleCopy} className="tool-btn">
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
