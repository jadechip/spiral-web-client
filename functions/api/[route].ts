// import { handle } from "hono/cloudflare-pages"
// import app from "@/api"
// export const onRequest = handle(app)

export async function onRequest(context) {
  try {
    const url = new URL(context.request.url);
    url.hostname = "spiral-backend.jadechip.workers.dev";
    url.protocol = "https";

    // Log the original request URL
    console.log("Original Request URL:", context.request.url);

    // Log the modified request URL
    console.log("Modified Request URL:", url.toString());

    const headers = new Headers(context.request.headers);
    headers.set("Origin", "https://spiral-web-client.pages.dev");

    const request = new Request(url.toString(), {
      method: context.request.method,
      headers: headers,
      body:
        context.request.method !== "GET" && context.request.method !== "HEAD"
          ? context.request.body
          : null,
      credentials: "include",
    });

    // Log the headers
    console.log("Request Headers:", [...headers.entries()]);

    const response = await fetch(request);

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const jsonResponse = await response.json();
      return new Response(JSON.stringify(jsonResponse), {
        status: response.status,
        statusText: response.statusText,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://spiral-web-client.pages.dev",
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }

    const textResponse = await response.text();
    return new Response(textResponse, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "https://spiral-web-client.pages.dev",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
