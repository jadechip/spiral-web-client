import { Hono } from "hono";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import Facebook from "@auth/core/providers/facebook";
import { cors } from "hono/cors";

const app = new Hono({ strict: false }).basePath("/");

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

app.use(
  "*",
  initAuthConfig((c) => ({
    secret: c.env.AUTH_SECRET,
    providers: [
      Facebook({
        clientId: c.env.FACEBOOK_CLIENT_ID,
        clientSecret: c.env.FACEBOOK_CLIENT_SECRET,
      }),
    ],
  })),
);

app.use("/api/auth/*", authHandler());

app.use("/api/*", verifyAuth());

app.get("/api/protected", async (c) => {
  const auth = c.get("authUser");
  return c.json(auth);
});

export default app;
