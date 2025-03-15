import enhance from "@enhance/ssr";
import BaseHtml from "~/src/elements/base-html.mjs";
import AuthForm from "../../elements/auth-form.mjs";
import { createHead, transformHtmlTemplate } from "unhead/server";

export default defineEventHandler(async (event) => {
  const page = await useStorage("assets:pages").getItem(`login.html`);

  const head = createHead();
  head.push({
    title: "Over the Years - Login",
    meta: [
      { name: "description", content: "Over the Years Scrapbooking Made Easy" },
    ],
  });

  const html = enhance({
    elements: {
      "base-html": BaseHtml,
      "auth-form": AuthForm,
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
