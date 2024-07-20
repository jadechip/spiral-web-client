import { handle } from "hono/cloudflare-pages";
import api from "@/api";
export const onRequest = handle(api);

// export async function onRequest(context) {
//   // Create a new URL object from the original request URL
//   const url = new URL(context.request.url);
//   url.hostname = "spiral-backend.jadechip.workers.dev";

//   // Create a new Headers object from the original request headers
//   const headers = new Headers(context.request.headers);

//   // Add or modify headers
//   headers.set("Content-Type", "application/json");
//   headers.set(
//     "Access-Control-Allow-Origin",
//     "https://spiral-web-client.pages.dev",
//   );
//   headers.set("Access-Control-Allow-Credentials", "true");

//   // Create a new Request object with the modified URL and headers
//   const request = new Request(url.toString(), {
//     method: context.request.method,
//     headers: headers,
//     body:
//       context.request.method !== "GET" && context.request.method !== "HEAD"
//         ? context.request.body
//         : null,
//     credentials: "include", // Include credentials if necessary
//   });

//   // Fetch the response from the modified request
//   const response = await fetch(request);

//   // Return the response as is
//   return response;
// }
