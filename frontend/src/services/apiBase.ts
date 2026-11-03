const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const fallbackApiBaseUrl = import.meta.env.DEV ? "http://localhost:5000" : "";

export const API_BASE_URL = (configuredApiBaseUrl ?? fallbackApiBaseUrl).replace(
  /\/+$/,
  "",
);

export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
