// import { handle } from "hono/cloudflare-pages"
// import app from "@/api"
// export const onRequest = handle(app)

export async function onRequest(context) {
  const url = new URL(context.request.url);
  url.hostname = "spiral-backend.jadechip.workers.dev";
  url.protocol = "https";

  // Copy the request headers
  const headers = new Headers(context.request.headers);

  // Create a new request with the modified URL
  const request = new Request(url.toString(), {
    method: context.request.method,
    headers: headers,
    body:
      context.request.method !== "GET" && context.request.method !== "HEAD"
        ? context.request.body
        : null,
  });

  const response = await fetch(request);

  // Copy the response headers
  const responseHeaders = new Headers(response.headers);

  // Check if the response content type is JSON and add the header if necessary
  if (responseHeaders.get("content-type")?.includes("application/json")) {
    responseHeaders.set("content-type", "application/json");
  }

  const body = await response.text();

  // Return the response with the copied headers
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
