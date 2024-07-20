// import { Hono } from "hono";
// // import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
// // import Facebook from "@auth/core/providers/facebook";
// // import { cors } from "hono/cors";

// const app = new Hono({ strict: false }).basePath("/");

import { Hono } from "hono";
import { cors } from "hono/cors";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import { D1Adapter } from "@auth/d1-adapter";
import Resend from "@auth/core/providers/resend";
import Facebook from "@auth/core/providers/facebook";
import Instagram from "@auth/core/providers/instagram";
import Credentials from "@auth/core/providers/credentials";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import {
  users,
  creators,
  campaigns,
  products,
  contracts,
  campaignCreators,
  campaignProducts,
  contractCampaigns,
} from "./db/schema";

export type Env = {
  DB: D1Database;
  AUTH_SECRET: string;
  AUTH_RESEND_KEY: string;
  INSTAGRAM_CLIENT_ID: string;
  INSTAGRAM_CLIENT_SECRET: string;
};

const api = new Hono<{ Bindings: Env }>();

api.route("/", api);

api.use(
  "*",
  cors({
    origin: (origin) => origin,
    allowHeaders: ["Content-Type", "x-auth-return-redirect"],
    credentials: true,
  }),
);

api.use(
  "*",
  initAuthConfig((c) => ({
    secret: c.env.AUTH_SECRET,
    providers: [
      Resend({
        // If your environment variable is named differently than default
        apiKey: c.env.AUTH_RESEND_KEY,
        from: "no-reply@company.com",
      }),
      Facebook({
        clientId: c.env.FACEBOOK_CLIENT_ID,
        clientSecret: c.env.FACEBOOK_CLIENT_SECRET,
      }),
      Instagram({
        clientId: c.env.INSTAGRAM_CLIENT_ID,
        clientSecret: c.env.INSTAGRAM_CLIENT_SECRET,
      }),
      Credentials({
        credentials: {
          username: { label: "Username" },
          password: { label: "Password", type: "password" },
        },
        authorize: async (credentials) => {
          let user = null;

          // logic to salt and hash password
          // const pwHash = saltAndHashPassword(credentials.password);

          // // logic to verify if user exists
          // user = await getUserFromDb(credentials.email, pwHash);

          // if (!user) {
          //   // No user found, so this is their first attempt to login
          //   // meaning this is also the place you could do registration
          //   throw new Error("User not found.");
          // }

          // return user object with the their profile data
          return user;
        },
      }),
    ],
    callbacks: {
      async signIn({ user, account, profile, email, credentials }) {
        console.log("req", c.req);
        console.log("signIn", user, account, profile, email, credentials);
        return true;
      },
      async redirect({ url, baseUrl }) {
        console.log("redirect", url, baseUrl);
        return url;
      },
      async session({ session, user, token }) {
        return session;
      },
      async jwt({ token, user, account, profile, isNewUser }) {
        return token;
      },
    },
    events: {
      createUser: async ({ user }) => {
        // This function will be called when a new user is created
        // You can update the user object in the database here
        console.log("The user object", user);
        // This function will be called when a new user is created
        // You can update the user object in the database here

        try {
          await c.env.DB.update(users)
            .set({
              // Add any additional fields you want to update
              userType: "creator", // or "manager", depending on your logic
              // You can also use data from the Facebook profile if needed
              // For example:
              // name: user.name,
            })
            .where(eq(users.id, user.id));

          console.log("User updated successfully");
        } catch (error) {
          console.error("Error updating user:", error);
        }
      },
    },
    adapter: D1Adapter(c.env.DB),
  })),
);

// TODO: Add Instagram login
// api.use(
//   "*",
//   initAuthConfig((c) => ({
//     secret: c.env.AUTH_SECRET,
//     providers: [
//       Instagram({
//         clientId: c.env.INSTAGRAM_CLIENT_ID,
//         clientSecret: c.env.INSTAGRAM_CLIENT_SECRET,
//       }),
//     ],
//   })),
// );

// Auth routes
api.use("/api/auth/*", authHandler());

api.use("/api/*", verifyAuth());

api.get("/api/protected", (c) => {
  const auth = c.get("authUser");
  return c.json(auth);
});

// api.get("/api/auth/callback/facebook", async (c) => {
//   // const { provider } = c.req.param();
//   console.log("About to redirect");
//   // const authResult = await handleAuthCallback(provider, c);
//   return c.redirect("http://localhost:3000");
// });

// // Creators routes
// api
//   .get("/creators", async (c) => {
//     const db = drizzle(c.env.DB);
//     const result = await db.select().from(creators).all();
//     return c.json(result);
//   })
//   .get("/creators/:id", async (c) => {
//     const db = drizzle(c.env.DB);
//     const id = Number(c.req.param("id"));
//     const result = await db.select().from(creators).where(eq(creators.id, id));
//     return c.json(result[0] || {});
//   })
//   .post("/creators", async (c) => {
//     const db = drizzle(c.env.DB);
//     const { name, countries, platform, totalReach, status } =
//       await c.req.json();
//     const result = await db
//       .insert(creators)
//       .values({ name, countries, platform, totalReach, status })
//       .returning();
//     return c.json(result[0]);
//   })
//   .put("/creators/:id", async (c) => {
//     const db = drizzle(c.env.DB);
//     const id = Number(c.req.param("id"));
//     const { name, countries, platform, totalReach, status } =
//       await c.req.json();
//     const result = await db
//       .update(creators)
//       .set({ name, countries, platform, totalReach, status })
//       .where(eq(creators.id, id))
//       .returning();
//     return c.json(result[0]);
//   })
//   .delete("/creators/:id", async (c) => {
//     const db = drizzle(c.env.DB);
//     const id = Number(c.req.param("id"));
//     await db.delete(creators).where(eq(creators.id, id));
//     return c.text("Creator deleted successfully");
//   });

// // Campaigns routes
// api
//   .get("/campaigns", async (c) => {
//     const db = drizzle(c.env.DB);
//     const result = await db.select().from(campaigns).all();
//     return c.json(result);
//   })
//   .get("/campaigns/:id", async (c) => {
//     const db = drizzle(c.env.DB);
//     const id = Number(c.req.param("id"));
//     const result = await db
//       .select()
//       .from(campaigns)
//       .where(eq(campaigns.id, id));
//     return c.json(result[0] || {});
//   })
//   .post("/campaigns", async (c) => {
//     const db = drizzle(c.env.DB);
//     const { name, budget, startDate, endDate, status } = await c.req.json();
//     const result = await db
//       .insert(campaigns)
//       .values({ name, budget, startDate, endDate, status })
//       .returning();
//     return c.json(result[0]);
//   })
//   .put("/campaigns/:id", async (c) => {
//     const db = drizzle(c.env.DB);
//     const id = Number(c.req.param("id"));
//     const { name, budget, startDate, endDate, status } = await c.req.json();
//     const result = await db
//       .update(campaigns)
//       .set({ name, budget, startDate, endDate, status })
//       .where(eq(campaigns.id, id))
//       .returning();
//     return c.json(result[0]);
//   })
//   .delete("/campaigns/:id", async (c) => {
//     const db = drizzle(c.env.DB);
//     const id = Number(c.req.param("id"));
//     await db.delete(campaigns).where(eq(campaigns.id, id));
//     return c.text("Campaign deleted successfully");
//   });

// // Products routes
// api
//   .get("/products", async (c) => {
//     const db = drizzle(c.env.DB);
//     const result = await db.select().from(products).all();
//     return c.json(result);
//   })
//   .get("/products/:id", async (c) => {
//     const db = drizzle(c.env.DB);
//     const id = Number(c.req.param("id"));
//     const result = await db.select().from(products).where(eq(products.id, id));
//     return c.json(result[0] || {});
//   })
//   .post("/products", async (c) => {
//     const db = drizzle(c.env.DB);
//     const { productName, description, price } = await c.req.json();
//     const result = await db
//       .insert(products)
//       .values({ productName, description, price })
//       .returning();
//     return c.json(result[0]);
//   })
//   .put("/products/:id", async (c) => {
//     const db = drizzle(c.env.DB);
//     const id = Number(c.req.param("id"));
//     const { productName, description, price } = await c.req.json();
//     const result = await db
//       .update(products)
//       .set({ productName, description, price })
//       .where(eq(products.id, id))
//       .returning();
//     return c.json(result[0]);
//   })
//   .delete("/products/:id", async (c) => {
//     const db = drizzle(c.env.DB);
//     const id = Number(c.req.param("id"));
//     await db.delete(products).where(eq(products.id, id));
//     return c.text("Product deleted successfully");
//   });

// // Contracts routes
// api
//   .get("/contracts", async (c) => {
//     const db = drizzle(c.env.DB);
//     const result = await db.select().from(contracts).all();
//     return c.json(result);
//   })
//   .get("/contracts/:id", async (c) => {
//     const db = drizzle(c.env.DB);
//     const id = Number(c.req.param("id"));
//     const result = await db
//       .select()
//       .from(contracts)
//       .where(eq(contracts.id, id));
//     return c.json(result[0] || {});
//   })
//   .post("/contracts", async (c) => {
//     const db = drizzle(c.env.DB);
//     const { creatorName, paymentType, startDate, endDate, amount, status } =
//       await c.req.json();
//     const result = await db
//       .insert(contracts)
//       .values({ creatorName, paymentType, startDate, endDate, amount, status })
//       .returning();
//     return c.json(result[0]);
//   })
//   .put("/contracts/:id", async (c) => {
//     const db = drizzle(c.env.DB);
//     const id = Number(c.req.param("id"));
//     const { creatorName, paymentType, startDate, endDate, amount, status } =
//       await c.req.json();
//     const result = await db
//       .update(contracts)
//       .set({ creatorName, paymentType, startDate, endDate, amount, status })
//       .where(eq(contracts.id, id))
//       .returning();
//     return c.json(result[0]);
//   })
//   .delete("/contracts/:id", async (c) => {
//     const db = drizzle(c.env.DB);
//     const id = Number(c.req.param("id"));
//     await db.delete(contracts).where(eq(contracts.id, id));
//     return c.text("Contract deleted successfully");
//   });

// // Routes for junction tables
// api
//   // Campaign Creators
//   .post("/campaign-creators", async (c) => {
//     const db = drizzle(c.env.DB);
//     const { campaignId, creatorId } = await c.req.json();
//     const result = await db
//       .insert(campaignCreators)
//       .values({ campaignId, creatorId })
//       .returning();
//     return c.json(result[0]);
//   })
//   .delete("/campaign-creators", async (c) => {
//     const db = drizzle(c.env.DB);
//     const { campaignId, creatorId } = await c.req.json();
//     await db
//       .delete(campaignCreators)
//       .where(eq(campaignCreators.campaignId, campaignId))
//       .where(eq(campaignCreators.creatorId, creatorId));
//     return c.text("Campaign-Creator association deleted successfully");
//   })
//   // Campaign Products
//   .post("/campaign-products", async (c) => {
//     const db = drizzle(c.env.DB);
//     const { campaignId, productId } = await c.req.json();
//     const result = await db
//       .insert(campaignProducts)
//       .values({ campaignId, productId })
//       .returning();
//     return c.json(result[0]);
//   })
//   .delete("/campaign-products", async (c) => {
//     const db = drizzle(c.env.DB);
//     const { campaignId, productId } = await c.req.json();
//     await db
//       .delete(campaignProducts)
//       .where(eq(campaignProducts.campaignId, campaignId))
//       .where(eq(campaignProducts.productId, productId));
//     return c.text("Campaign-Product association deleted successfully");
//   })
//   // Contract Campaigns
//   .post("/contract-campaigns", async (c) => {
//     const db = drizzle(c.env.DB);
//     const { contractId, campaignId } = await c.req.json();
//     const result = await db
//       .insert(contractCampaigns)
//       .values({ contractId, campaignId })
//       .returning();
//     return c.json(result[0]);
//   })
//   .delete("/contract-campaigns", async (c) => {
//     const db = drizzle(c.env.DB);
//     const { contractId, campaignId } = await c.req.json();
//     await db
//       .delete(contractCampaigns)
//       .where(eq(contractCampaigns.contractId, contractId))
//       .where(eq(contractCampaigns.campaignId, campaignId));
//     return c.text("Contract-Campaign association deleted successfully");
//   });

// api
//   // Upload Routes
//   .post("/upload", async (c) => {
//     const body = await c.req.parseBody();
//     const f = body["filename"];
//     if (f && f instanceof File) {
//       console.log("Uploading to R2");
//     }
//   });

export default api;
