import enhance from "@enhance/ssr";
import BaseHtml from "~/src/elements/base-html.mjs";
import MyHeader from "~/src/elements/my-header.mjs";
import { createHead, transformHtmlTemplate } from "unhead/server";

export default defineEventHandler(async (event) => {
  const page = await useStorage("assets:pages").getItem(`moments.html`);

  const head = createHead();
  head.push({
    title: "Over the Years - Moments",
    meta: [{ name: "description", content: "Fill out your daily prompt" }],
  });

  const html = enhance({
    elements: {
      "base-html": BaseHtml,
      "my-header": MyHeader,
    },
  });

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
