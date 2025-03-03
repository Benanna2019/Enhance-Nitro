import enhance from "@enhance/ssr";
import HelloWorld from "../../elements/hello-world.js";

export default defineEventHandler((event) => {
  // Example of using enhance.dev for SSR
  //   console.log("event", event.node.req)

  console.log("event", event);

  const html = enhance({
    elements: {
      "hello-world": HelloWorld,
    },
  });
  // Example of calling WASM function

  // Create a complete HTML document
  const fullPage = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Server Rendered Page</title>
        
        <script type="module" src="/browser/enhance-button.mjs"></script>
        <script>
        console.log("enhance-button.mjs")
        </script>
      </head>
      <body>
        ${html`<hello-world
          greeting="Server Rendered about page!"
        ></hello-world>`}
        <h1>Hello World</h1>
        <my-counter count=5></my-counter>
<my-increment click></my-increment>
<my-decrement click></my-decrement>
      </body>
    </html>
  `;

  // Render your response
  return new Response(fullPage, {
    headers: {
      "Content-Type": "text/html",
    },
  });
});
