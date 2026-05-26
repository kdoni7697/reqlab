"use client";

import { useState, useEffect } from "react";
import { EnvVariable } from "@/lib/types";
import { loadEnvVariables, saveEnvVariables, generateId } from "@/lib/storage";

interface Props {
  onClose: () => void;
}

export default function EnvModal({ onClose }: Props) {
  const [variables, setVariables] = useState<EnvVariable[]>([]);

  useEffect(() => {
    setVariables(loadEnvVariables());
  }, []);

  const addVariable = () => {
    setVariables([...variables, { id: generateId(), key: "", value: "" }]);
  };

  const updateVariable = (id: string, field: "key" | "value", value: string) => {
    setVariables(variables.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  const removeVariable = (id: string) => {
    setVariables(variables.filter((v) => v.id !== id));
  };

  const handleSave = () => {
    saveEnvVariables(variables.filter((v) => v.key.trim()));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-200">Environment Variables</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            ✕
          </button>
        </div>

        {/* Info */}
        <div className="px-4 py-2 border-b border-slate-800">
          <p className="text-xs text-slate-500">
            Use <code className="text-teal-400">{"{{VAR_NAME}}"}</code> in URLs and headers to substitute variables.
          </p>
        </div>

        {/* Variables */}
        <div className="flex-1 overflow-auto p-4 space-y-2">
          {variables.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-500 text-sm">No variables defined</p>
              <p className="text-slate-600 text-xs mt-1">Add variables to use in your requests</p>
            </div>
          ) : (
            variables.map((v) => (
              <div key={v.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={v.key}
                  onChange={(e) => updateVariable(v.id, "key", e.target.value)}
                  placeholder="VARIABLE_NAME"
                  className="tool-input flex-1 font-mono text-xs"
                />
                <input
                  type="text"
                  value={v.value}
                  onChange={(e) => updateVariable(v.id, "value", e.target.value)}
                  placeholder="value"
                  className="tool-input flex-1 text-xs"
                />
                <button
                  onClick={() => removeVariable(v.id)}
                  className="text-slate-500 hover:text-red-400 text-lg px-1"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between px-4 py-3 border-t border-slate-800">
          <button onClick={addVariable} className="tool-btn-ghost text-xs">
            + Add Variable
          </button>
          <button onClick={handleSave} className="tool-btn">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
