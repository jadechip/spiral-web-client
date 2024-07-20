// import { handle } from "hono/cloudflare-pages"
// import app from "@/api"
// export const onRequest = handle(app)

export async function onRequest(context) {
  const url = new URL(context.request.url);
  url.hostname = "spiral-backend.jadechip.workers.dev";

  const request = new Request(url.toString(), context.request);
  const response = await fetch(request);

  return response;
}
