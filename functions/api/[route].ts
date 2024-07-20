// import { handle } from "hono/cloudflare-pages"
// import app from "@/api"
// export const onRequest = handle(app)

export async function onRequest(context) {
  try {
    const url = new URL(context.request.url);
    url.hostname = "spiral-backend.jadechip.workers.dev";
    url.protocol = "https";

    // Copy the request headers
    const headers = new Headers(context.request.headers);
    headers.set("Origin", "https://spiral-web-client.pages.dev"); // Set the Origin header

    // Create a new request with the modified URL
    const request = new Request(url.toString(), {
      method: context.request.method,
      headers: headers,
      body:
        context.request.method !== "GET" && context.request.method !== "HEAD"
          ? context.request.body
          : null,
      credentials: "include", // Ensure credentials are included
    });

    const response = await fetch(request);

    // Log the status and headers for debugging
    console.log("Response Status:", response.status);
    console.log("Response Headers:", JSON.stringify([...response.headers]));

    // Check the content type of the response
    const contentType = response.headers.get("content-type") || "";

    // Log the content type
    console.log("Content Type:", contentType);

    // Return the response as JSON if the content type is JSON
    if (contentType.includes("application/json")) {
      const jsonResponse = await response.json();
      console.log("JSON Response:", JSON.stringify(jsonResponse));
      return new Response(JSON.stringify(jsonResponse), {
        status: response.status,
        statusText: response.statusText,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://spiral-web-client.pages.dev", // Allow the origin
          "Access-Control-Allow-Credentials": "true", // Allow credentials
        },
      });
    }

    // Log the response text for debugging
    const textResponse = await response.text();
    console.log("Text Response:", textResponse);

    // Fallback to text response if content type is not JSON
    return new Response(textResponse, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "https://spiral-web-client.pages.dev", // Allow the origin
        "Access-Control-Allow-Credentials": "true", // Allow credentials
      },
    });
  } catch (error) {
    // Log any errors
    console.error("Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
