//https://nitro.unjs.io/config
export default defineNitroConfig({
  // srcDir: "src",
  rootDir: "src",
  routesDir: "src/server/routes",
  apiDir: "src/api",
  publicAssets: [
    {
      baseURL: "browser",
      dir: "./src/public/browser",
    },
    {
      baseURL: "elements",
      dir: "./src/elements",
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
  ],
  compatibilityDate: "2025-02-23",
  serveStatic: true,
});
