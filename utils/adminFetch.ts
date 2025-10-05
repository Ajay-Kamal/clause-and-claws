export async function adminFetch(
  url: string,
  opts?: {
    method?: "POST" | "GET" | "PUT" | "DELETE";
    body?: any;
    confirm?: { title?: string; message?: string };
  }
) {
  if (opts?.confirm) {
    const ok = window.confirm(
      `${opts.confirm.title ?? "Are you sure?"}\n\n${
        opts.confirm.message ?? ""
      }`
    );
    if (!ok) return { cancelled: true };
  }

  const res = await fetch(url, {
    method: opts?.method ?? "POST",
    headers: { "Content-Type": "application/json" },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
    credentials: "same-origin",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      error: data?.error || "Request failed",
      status: res.status,
      raw: data,
    };
  }
  return { data };
}
