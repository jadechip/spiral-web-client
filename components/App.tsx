import ClientExample from "@/components/client-example";
import { SessionProvider, authConfigManager } from "@hono/auth-js/react";
import Layout from "./layout";

authConfigManager.setConfig({
  baseUrl: "https://spiral-backend.jadechip.workers.dev",
  basePath: "/api/auth",
  credentials: "include",
});

export default function App() {
  return (
    <SessionProvider>
      <Layout>
        <ClientExample />
      </Layout>
    </SessionProvider>
  );
}
