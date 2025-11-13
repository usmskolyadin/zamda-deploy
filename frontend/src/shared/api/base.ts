export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function buildUrl(endpoint: string): string {
  const base = API_URL.replace(/\/+$/, "");
  const path = endpoint.replace(/^\/+/, "");
  return `${base}/${path}`;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = buildUrl(endpoint);
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let errorMessage: string;
    try {
      const errorData = await res.json();
      errorMessage = JSON.stringify(errorData, null, 2);
    } catch {
      errorMessage = await res.text();
    }

    throw new Error(
      `API error: ${res.status} ${res.statusText}\nEndpoint: ${endpoint}\nDetails: ${errorMessage}`
    );
  }

  return res.json();
}
