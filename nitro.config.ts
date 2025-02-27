//https://nitro.unjs.io/config
export default defineNitroConfig({
  // srcDir: "src",
  rootDir: "src",
  routesDir: "src/server/routes",
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
  ],
  compatibilityDate: "2025-02-23",
  serveStatic: true,
});

// add a default renderer?

// ./renderer

// import { defineRenderHandler } from "nitropack/runtime";

// export default defineRenderHandler((_event) => {
//   return {
//     body: /* html */ `<!DOCTYPE html>
//     <html>
//       <head>
//         <title>Rendered Page</title>
//         </head>
//         <body>
//             <h1>Rendered by Nitro!</h1>
//         </body>
//     </html>`,
//   };
// });
