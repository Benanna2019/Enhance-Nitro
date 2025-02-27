export default function BaseHtml({ html, state }) {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Server Rendered Page</title>
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
