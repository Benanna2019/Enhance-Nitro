export default function LogoutButton({ html, state }) {
  const { attrs } = state;
  const { text, class: className } = attrs;

  const buttonText = text || "Logout";
  const buttonClass = className || "btn btn-outline";

  return html`<button class="logout-button ${buttonClass}">
      ${buttonText}
    </button>
    <script>

      function enhanceLogoutButtons() {
        const logoutButtons = document.querySelectorAll(".logout-button");

        logoutButtons.forEach((button) => {
            button.setAttribute("hx-post", "/api/auth/logout");
            button.setAttribute("hx-target", "body");
            button.setAttribute("hx-push-url", "true");
            button.setAttribute("hx-confirm", "Are you sure you want to log out?");
        });
      }

      class LogoutButtonElement extends HTMLElement {
          connectedCallback() {
          const buttonText = this.getAttribute("text") || "Logout";
          const buttonClass = this.getAttribute("class") || "btn btn-outline";

          this.innerHTML = "<button class="logout-button ${buttonClass}">${buttonText}</button>";

          enhanceLogoutButtons();
          }
      }

      customElements.define("logout-button", LogoutButtonElement);
    </script>`;
}
