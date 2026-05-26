import { Collection, EnvVariable, HistoryEntry } from "./types";

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function loadCollections(): Collection[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("api-client-collections");
  return data ? JSON.parse(data) : [];
}

export function saveCollections(collections: Collection[]): void {
  localStorage.setItem("api-client-collections", JSON.stringify(collections));
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("api-client-history");
  return data ? JSON.parse(data) : [];
}

export function saveHistory(history: HistoryEntry[]): void {
  localStorage.setItem("api-client-history", JSON.stringify(history));
}

export function loadEnvVariables(): EnvVariable[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("api-client-env");
  return data ? JSON.parse(data) : [];
}

export function saveEnvVariables(vars: EnvVariable[]): void {
  localStorage.setItem("api-client-env", JSON.stringify(vars));
}

export function substituteEnvVars(text: string, vars: EnvVariable[]): string {
  let result = text;
  vars.forEach((v) => {
    result = result.replace(new RegExp(`\\{\\{${v.key}\\}\\}`, "g"), v.value);
  });
  return result;
}
