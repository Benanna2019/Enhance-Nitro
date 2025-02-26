export default function MyHeader({ html, state  }) {
  const { attrs={} } = state
  const { heading='default' } = attrs
  return html`
    <style>
      :host {
        color: red;
      }
    </style>
    <h1>${heading}</h1>
    <test-element></test-element>
    <script type="module" src="/browser/my-header.mjs"></script>
  `
}