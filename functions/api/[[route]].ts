// import { handle } from "hono/cloudflare-pages"
// import app from "@/api"
// export const onRequest = handle(app)

export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Log request details
  console.log("Request URL:", url.toString());
  console.log("Request method:", context.request.method);
  console.log(
    "Request headers:",
    JSON.stringify(Object.fromEntries(context.request.headers), null, 2),
  );

  // Check if the request path starts with /api/
  if (url.pathname.startsWith("/api/")) {
    // Instead of redirecting or proxying, return diagnostic information
    const diagnosticInfo = {
      message: "API request intercepted",
      originalUrl: url.toString(),
      method: context.request.method,
      headers: Object.fromEntries(context.request.headers),
      pathname: url.pathname,
      search: url.search,
    };

    return new Response(JSON.stringify(diagnosticInfo, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  // If the path doesn't start with /api/, log and pass through
  console.log("Non-API request, passing through");
  return fetch(context.request);
}
