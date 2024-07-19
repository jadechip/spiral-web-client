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

    // Return a Response object that redirects to the new URL
    return Response.redirect(newUrl, 307);
  }

  // If the path doesn't start with /api/, pass the request through
  return fetch(context.request);
}
