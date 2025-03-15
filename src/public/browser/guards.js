class AuthProtectedElement extends HTMLElement {
  connectedCallback() {
    this.setAttribute("data-auth-required", "true");
    this.classList.add("hidden");

    // Initially hidden, will be shown by updateAuthUI() if authenticated
  }
}

class GuestOnlyElement extends HTMLElement {
  connectedCallback() {
    this.setAttribute("data-guest-only", "true");

    // Initially visible, will be hidden by updateAuthUI() if authenticated
  }
}

customElements.define("auth-protected", AuthProtectedElement);
customElements.define("guest-only", GuestOnlyElement);
