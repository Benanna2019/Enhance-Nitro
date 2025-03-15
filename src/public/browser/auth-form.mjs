import CustomElement from "https://unpkg.com/@enhance/custom-element@1.2.4/index.mjs?module=true";
import AuthFormElement from "/elements/auth-form.mjs";
import { enhanceLoginForm, enhanceRegistrationForm } from "/lib/utils.mjs";

class AuthForm extends CustomElement {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ["type"];
  }

  connectedCallback() {
    console.log("connected");
    this.#ready(this.#init);
  }

  #ready(fn) {
    if (this.children.length) {
      return fn.apply(this);
    }

    new MutationObserver(fn.bind(this)).observe(this, { childList: true });
  }

  #init() {
    const formType = this.getAttribute("type") || "login";
    console.log("type", formType);

    if (formType === "login") {
      enhanceLoginForm();
    } else {
      enhanceRegistrationForm();
    }
  }

  render(args) {
    return AuthFormElement(args);
  }
}

customElements.define("auth-form", AuthForm);
