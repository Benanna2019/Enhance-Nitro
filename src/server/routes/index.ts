import enhance from "@enhance/ssr";
import BaseHtml from "../../elements/base-html.mjs";
import HelloWorld from "../../elements/hello-world.js";
import MyHeader from "../../elements/my-header.mjs";
import TestElement from "../../elements/test-element.mjs";

export default defineEventHandler(async (event) => {
  const page = await useStorage("assets:pages").getItem(`index.html`);

  console.log("page", page);

  // Example of using enhance.dev for SSR
  //   console.log("event", event.node.req)
  const html = enhance({
    elements: {
      "hello-world": HelloWorld,
      "my-header": MyHeader,
      "test-element": TestElement,
      "base-html": BaseHtml,
    },
  });
  // Example of calling WASM function

  // Create a complete HTML document
  const fullPage = html`${page}`;

  // Render your response
  return new Response(fullPage, {
    headers: {
      "Content-Type": "text/html",
    },
  });
});
