import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono({ strict: false }).basePath("/");

// The target domain to proxy requests to
const TARGET_DOMAIN = "https://spiral-backend.jadechip.workers.dev";

app.use(
  "*",
  cors({
    origin: (origin) => origin,
    allowHeaders: ["Content-Type"],
    allowMethods: ["*"],
    maxAge: 86400,
    credentials: true,
  }),
);

app.use("/*", async (c, next) => {
  const url = new URL(c.req.url);
  console.log("req url", url);
  const targetUrl = `${TARGET_DOMAIN}${url.pathname}${url.search}`;
  console.log("targetUrl", targetUrl);

  const response = await fetch(targetUrl, {
    method: c.req.method,
    headers: c.req.headers,
    body: ["GET", "HEAD"].includes(c.req.method)
      ? undefined
      : await c.req.blob(),
  });

  // Create a new headers object from the original response
  const headers = new Headers(response.headers);

  // Add the custom headers
  headers.set("Content-Type", "application/json");
  headers.set(
    "Access-Control-Allow-Origin",
    "https://spiral-web-client.pages.dev",
  );
  headers.set("Access-Control-Allow-Credentials", "true");

  console.log("response.statusText", response.statusText);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers,
  });
});

export default app;
