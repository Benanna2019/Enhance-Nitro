export default function AuthForm({ html, state }) {
  const { attrs, store } = state;
  const { type: formType } = attrs;

  const formId = formType === "login" ? "login-form" : "register-form";
  const formTitle = formType === "login" ? "Sign In" : "Create Account";
  const buttonText = formType === "login" ? "Login" : "Register";
  const altText =
    formType === "login" ? "Need an account?" : "Already have an account?";
  const altLink = formType === "login" ? "/register" : "/login";
  const altLinkText = formType === "login" ? "Register" : "Login";

  return html`
    <div class="auth-form-container">
      <h2>${formTitle}</h2>
      <form
        id="${formId}"
        method="POST"
        action="/api/auth/${formType}"
        class="auth-form"
      >
        <div class="form-group">
          <label for="${formType}-email">Email</label>
          <input type="email" id="${formType}-email" name="email" required />
          <div class="validation-message"></div>
        </div>
        <div class="form-group">
          <label for="${formType}-password">Password</label>
          <input
            type="password"
            id="${formType}-password"
            name="password"
            required
            minlength="8"
          />
          <div class="validation-message"></div>
        </div>
        ${formType === "register"
          ? `
          <div class="form-group">
            <label for="confirm-password">Confirm Password</label>
            <input type="password" id="confirm-password" name="confirmPassword" required>
            <div class="validation-message"></div>
          </div>
          `
          : ""}
        <button type="submit" class="btn btn-primary">${buttonText}</button>
      </form>
      <div id="auth-response" class="auth-response"></div>
      <div class="auth-alt">
        <p>${altText} <a hx-get="${altLink}">${altLinkText}</a></p>
      </div>
    </div>

    <script type="module" src="/browser/auth-form.mjs"></script>
  `;
}
