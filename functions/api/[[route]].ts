// import { handle } from "hono/cloudflare-pages"
// import app from "@/api"
// export const onRequest = handle(app)

export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Check if the request path starts with /api/
  if (url.pathname.startsWith("/api/")) {
    // Replace this with your backend URL
    const backendUrl = "https://spiral-backend.jadechip.workers.dev";

    // Construct the new URL by replacing the origin
    const newUrl = backendUrl + url.pathname + url.search;

    // Create a new request with the same method, headers, and body
    const newRequest = new Request(newUrl, {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.body,
    });

    // Fetch the request from the backend
    const response = await fetch(newRequest);

    // Create a new response with the backend's response, but allow CORS
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        "Access-Control-Allow-Origin": url.origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, x-auth-return-redirect",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  // If the path doesn't start with /api/, pass the request through
  return fetch(context.request);
}
