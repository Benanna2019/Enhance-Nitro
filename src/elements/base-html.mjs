export default function BaseHtml({ html, state }) {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Server Rendered Page</title>
        <link rel="stylesheet" href="/browser/auth.css" />
        <script src="https://unpkg.com/htmx.org@1.9.6"></script>
        <script type="module" src="/browser/generic-scripts.mjs" defer></script>
        <script src="/browser/guards.js" defer></script>
      </head>
      <body>
        <slot></slot>
      </body>
      <script type="module" src="/browser/enhance-button.mjs"></script>
      <script>
        console.log("enhance-button.mjs");
      </script>
    </html>
  `;
}
