import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: "postgresql://neondb_owner:npg_TVmshL4NFr8v@ep-blue-sun-a85qen4w.eastus2.azure.neon.tech/neondb?sslmode=require&connect_timeout=30",
  },
});