import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// NextAuth required tables
export const accounts = sqliteTable("accounts", {
  id: text("id").notNull().primaryKey(),
  userId: text("userId").notNull(),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
  oauth_token_secret: text("oauth_token_secret"),
  oauth_token: text("oauth_token"),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").notNull(),
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId").notNull(),
  expires: text("expires").notNull(),
});

export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().primaryKey(),
  expires: text("expires").notNull(),
});

// Modified users table to be compatible with NextAuth
export const users = sqliteTable("users", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: text("emailVerified"),
  image: text("image"),
  passwordHash: text("password_hash"),
  userType: text("user_type").$type<"creator" | "manager">(),
});

// Our custom tables
export const creators = sqliteTable("creators", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  countries: text("countries").notNull(),
  platform: text("platform").notNull(),
  totalReach: integer("total_reach").notNull(),
  status: text("status").notNull().$type<"idle" | "active">(),
});

export const managers = sqliteTable("managers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  department: text("department").notNull(),
});

export const campaigns = sqliteTable("campaigns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  managerId: integer("manager_id")
    .notNull()
    .references(() => managers.id),
  name: text("name").notNull(),
  budget: real("budget").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  status: text("status").notNull(),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productName: text("product_name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
});

export const contracts = sqliteTable("contracts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => creators.id),
  paymentType: text("payment_type").notNull().$type<"cash" | "gift">(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  amount: real("amount").notNull(),
  status: text("status").notNull(),
});

export const campaignCreators = sqliteTable(
  "campaign_creators",
  {
    campaignId: integer("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    creatorId: integer("creator_id")
      .notNull()
      .references(() => creators.id),
  },
  (table) => ({
    pk: sql`PRIMARY KEY (${table.campaignId}, ${table.creatorId})`,
  }),
);

export const campaignProducts = sqliteTable(
  "campaign_products",
  {
    campaignId: integer("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id),
  },
  (table) => ({
    pk: sql`PRIMARY KEY (${table.campaignId}, ${table.productId})`,
  }),
);

export const contractCampaigns = sqliteTable(
  "contract_campaigns",
  {
    contractId: integer("contract_id")
      .notNull()
      .references(() => contracts.id),
    campaignId: integer("campaign_id")
      .notNull()
      .references(() => campaigns.id),
  },
  (table) => ({
    pk: sql`PRIMARY KEY (${table.contractId}, ${table.campaignId})`,
  }),
);
