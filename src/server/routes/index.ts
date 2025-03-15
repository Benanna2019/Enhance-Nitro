import enhance from "@enhance/ssr";
import BaseHtml from "~/src/elements/base-html.mjs";
import ContextParent from "../../elements/context-parent.mjs";
import HelloWorld from "../../elements/hello-world.js";
import MyHeader from "../../elements/my-header.mjs";
import TestElement from "../../elements/test-element.mjs";
import AuthForm from "../../elements/auth-form.mjs";
import { createHead, transformHtmlTemplate } from "unhead/server";
import { authMiddleware } from "../lib/auth.js";

// Eventually this will be a home page and they will have to click on sign in or something
// and then it will redirect to the login page

export default defineEventHandler(async (event) => {
  const page = await useStorage("assets:pages").getItem(`index.html`);

  const userId = await authMiddleware(event);

  if (userId) {
    return sendRedirect(event, "/moments");
  }

  const head = createHead();
  head.push({
    title: "Over the Years",
    meta: [
      { name: "description", content: "Over the Years Scrapbooking Made Easy" },
    ],
  });

  const html = enhance({
    elements: {
      "hello-world": HelloWorld,
      "my-header": MyHeader,
      "test-element": TestElement,
      "base-html": BaseHtml,
      "context-parent": ContextParent,
      "auth-form": AuthForm,
    },
    initialState: {},
  });
  // Example of calling WASM function

  // Create a complete HTML document
  const fullPage = html`${page}`;

  const transformedHtml = await transformHtmlTemplate(head, fullPage);

  // Render your response
  return new Response(transformedHtml, {
    headers: {
      "Content-Type": "text/html",
    },
  });
});
