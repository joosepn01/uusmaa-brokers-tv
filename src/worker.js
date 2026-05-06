// Cloudflare Worker layered on top of the static `out/` bundle.
// Handles two API endpoints; everything else falls through to static
// assets (the Next.js export) via the ASSETS binding.
//
// Bindings (declared in wrangler.jsonc):
//   ASSETS    Fetcher   — the static asset bucket (Next.js out/)
//   RANKINGS  KVNamespace (optional) — stores the live rankings
//   ADMIN_TOKEN  string secret (optional) — bearer auth for PUT
//
// The KV namespace and admin token are optional so this Worker can
// deploy successfully even before the user wires those up in the
// Cloudflare dashboard. PUT just returns 503 / GET returns null until
// the binding is added.

const KV_KEY = "rankings:current";

const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...(init.headers || {}),
    },
  });

async function getRankings(env) {
  if (!env.RANKINGS) return json(null);
  const raw = await env.RANKINGS.get(KV_KEY);
  if (!raw) return json(null);
  try {
    return json(JSON.parse(raw));
  } catch {
    return json(null);
  }
}

async function putRankings(request, env) {
  // Require a bearer token only if ADMIN_TOKEN is configured. This makes
  // local / first-time deploys frictionless — the token is added later
  // as a Cloudflare secret and the same code starts enforcing it.
  if (env.ADMIN_TOKEN) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${env.ADMIN_TOKEN}`) {
      return json({ error: "unauthorized" }, { status: 401 });
    }
  }
  if (!env.RANKINGS) {
    return json({ error: "kv-not-configured" }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad-json" }, { status: 400 });
  }
  if (
    !body ||
    !Array.isArray(body.monthlyTop) ||
    !Array.isArray(body.yearlyTop)
  ) {
    return json({ error: "missing-arrays" }, { status: 400 });
  }

  const value = {
    monthlyTop: body.monthlyTop.map(String),
    yearlyTop: body.yearlyTop.map(String),
    updatedAt: new Date().toISOString(),
  };
  await env.RANKINGS.put(KV_KEY, JSON.stringify(value));
  return json({ ok: true, updatedAt: value.updatedAt });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/rankings") {
      if (request.method === "GET") return getRankings(env);
      if (request.method === "PUT") return putRankings(request, env);
      if (request.method === "OPTIONS")
        return new Response(null, { status: 204 });
      return json({ error: "method-not-allowed" }, { status: 405 });
    }

    // Anything else: serve from the static asset bucket. The default
    // not_found_handling kicks in if no file matches.
    return env.ASSETS.fetch(request);
  },
};
