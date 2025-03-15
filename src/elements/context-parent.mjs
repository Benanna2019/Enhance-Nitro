export default function ContextParent({ html, state }) {
  const { store } = state;
  store.context.message = "Heading set via context";
  return html`
    <style>
      :host {
        display: block;
        height: 100dvh;
        padding-top: 3rem;
        text-align: center;
        font-family: sans-serif;
      }
    </style>
    <slot></slot>
  `;
}
