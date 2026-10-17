/**
 * cloudflare/worker.js
 * Cloudflare Worker reverse-proxy for SearchO2
 *
 * Routes:
 *   searcho2.online/api/*  ➔  https://your-backend.onrender.com/api/*
 *   searcho2.online/ws     ➔  wss://your-backend.onrender.com/ws (WebSockets)
 *   searcho2.online/*      ➔  Static Frontend (passes through to origin)
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Target deployed backend URL (set in Cloudflare Worker environment variables, or default)
    const BACKEND_ORIGIN = env.BACKEND_URL || 'https://searcho2-backend.onrender.com';

    // 1. Intercept /api and /ws requests
    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/ws')) {
      const targetUrl = new URL(url.pathname + url.search, BACKEND_ORIGIN);

      // Clone original headers
      const newHeaders = new Headers(request.headers);
      newHeaders.set('X-Forwarded-Host', url.host);
      newHeaders.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

      const proxyReq = new Request(targetUrl.toString(), {
        method: request.method,
        headers: newHeaders,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
        redirect: 'follow',
      });

      try {
        const response = await fetch(proxyReq);
        const newResponseHeaders = new Headers(response.headers);
        newResponseHeaders.set('Access-Control-Allow-Origin', url.origin);
        newResponseHeaders.set('Access-Control-Allow-Credentials', 'true');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newResponseHeaders,
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Backend proxy error: ' + err.message }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 2. Default: Pass static website traffic to original frontend
    return fetch(request);
  },
};
