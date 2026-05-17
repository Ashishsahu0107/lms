// Simple fetch wrapper scaffold.
// Swap to axios later if desired.

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

export async function apiRequest(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(path, {
    method,
    headers: { ...DEFAULT_HEADERS, ...(headers || {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (data && data.message) || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

