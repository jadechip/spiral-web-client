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

// Middleware to proxy requests starting with "/api"
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

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
});

export default app;
