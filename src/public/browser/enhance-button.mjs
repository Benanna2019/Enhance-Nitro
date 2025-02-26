import enhance from "https://unpkg.com/@enhance/element@1.4.2/dist/index.js?module=true";
import Store from "https://unpkg.com/@enhance/store@1.0.2/index.mjs?module=true";

//Initialize store
const store = Store({ count: 0 });

enhance("my-counter", {
  // Define what keys on the store you want to listen to updates for
  keys: ["count"],
  store,
  render({ html, state }) {
    const { store = {} } = state;
    const { count = 0 } = store;
    return html`
      <div>
        <span>Count: ${count}</span>
        <slot></slot>
      </div>
    `;
  },

  connected() {
    console.log('Counter connected, setting initial count:', this.getAttribute("count"));
    this.store.count = Number(this.getAttribute("count") || 0);
  }
});

enhance("my-increment", {
  store,
  click() {
    console.log('Increment clicked, current count:', this.store.count);
    this.store.count = this.store.count + 1;
  },
  render({ html }) {
    return html`
      <button id="increment">+</button>
    `;
  },

  connected() {
    console.log('Increment connected, setting initial count:')
  }
});

enhance("my-decrement", {
  store,
  click() {
    console.log('Decrement clicked, current count:', this.store.count);
    this.store.count = this.store.count - 1;
  },
  render({ html }) {
    return html`
      <button>-</button>
    `;
  }
});
