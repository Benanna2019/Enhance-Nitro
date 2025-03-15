export default function MyHeader({ html, state }) {
  const { attrs = {} } = state;
  const { heading = "default" } = attrs;
  return html`
    <style>
      :host {
        color: red;
      }
    </style>
    <div>
      <h1>${heading}</h1>
      <a href="/login">Login</a>
    </div>
    <script type="module" src="/browser/my-header.mjs"></script>
  `;
}
