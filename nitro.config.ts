//https://nitro.unjs.io/config
export default defineNitroConfig({
  rootDir: "src",
  routesDir: "src/server/routes",
  apiDir: "src/server/api",
  publicAssets: [
    {
      baseURL: "browser",
      dir: "./src/public/browser",
    },
    {
      baseURL: "lib",
      dir: "./src/lib",
    },
    {
      baseURL: "elements",
      dir: "./src/elements",
    },
    {
      baseURL: "livestore",
      dir: "./src/livestore",
    },
  ],
  serverAssets: [
    {
      baseName: "pages",
      dir: "./src/pages",
    },
    {
      baseName: "elements",
      dir: "./src/elements",
    },
    {
      baseName: "lib",
      dir: "./src/lib",
    },
    {
      baseName: "livestore",
      dir: "./src/livestore",
    },
  ],
  compatibilityDate: "2025-02-23",
  serveStatic: "deno",
  devServer: {
    watch: [
      "src/server/routes",
      "src/server/api",
      "src/elements",
      "src/pages",
      "src/lib",
    ],
  },
  plugins: ["src/server/plugins/auth.ts"],
});
