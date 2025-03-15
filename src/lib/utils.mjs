/**
 * Setup automatic token refresh
 */
export function setupTokenRefresh() {
  // Refresh token every 30 minutes
  setInterval(() => {
    fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    }).catch((error) => {
      console.error("Error refreshing token:", error);
    });
  }, 30 * 60 * 1000); // 30 minutes
}

export function updateAuthUI() {
  // Check if user is logged in
  fetch("/api/me", {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => {
      const authElements = document.querySelectorAll("[data-auth-required]");
      const guestElements = document.querySelectorAll("[data-guest-only]");

      if (response.status === 200) {
        // User is authenticated
        authElements.forEach((el) => el.classList.remove("hidden"));
        guestElements.forEach((el) => el.classList.add("hidden"));
      } else {
        // User is not authenticated
        authElements.forEach((el) => el.classList.add("hidden"));
        guestElements.forEach((el) => el.classList.remove("hidden"));
      }
    })
    .catch((error) => {
      console.error("Error checking authentication status:", error);
    });
}

export function initAuthUI() {
  // Toggle auth-dependent UI elements
  updateAuthUI();

  // Periodically refresh the auth token
  setupTokenRefresh();
}

export function handleHtmxAfterSwap(event) {
  const target = event.detail.target;

  // Handle authentication responses
  if (target.id === "auth-response") {
    const response = JSON.parse(target.textContent || "{}");

    // Clear the JSON and replace with user-friendly message
    target.textContent = "";

    if (response.success) {
      // Success message
      target.className = "auth-response success";
      target.textContent = response.message || "Success!";

      // Redirect to dashboard after successful login/register
      if (response.redirectTo) {
        setTimeout(() => {
          window.location.href = response.redirectTo;
        }, 1000);
      } else if (
        response.message === "Login successful" ||
        response.message === "Registration successful"
      ) {
        setTimeout(() => {
          window.location.href = "/moments";
        }, 1000);
      }
    } else {
      // Error message
      target.className = "auth-response error";
      target.textContent = response.message || "An error occurred";
    }
  }

  // Handle redirect after logout
  if (event.detail.path === "/api/auth/logout") {
    const response = JSON.parse(event.detail.xhr.responseText || "{}");

    if (response.success) {
      // Redirect to login page after logout
      window.location.href = "/login";
    }
  }
}

export function ensureResponseContainer(form) {
  let responseContainer = document.getElementById("auth-response");

  if (!responseContainer) {
    responseContainer = document.createElement("div");
    responseContainer.id = "auth-response";
    responseContainer.className = "auth-response";
    form.appendChild(responseContainer);
  }
}

/**
 * Enhance the registration form with HTMX
 */
export function enhanceRegistrationForm() {
  const registerForm = document.getElementById("register-form");
  const registerEmailInput = document.getElementById("register-email");
  if (!registerForm) return;
  if (registerEmailInput) {
    registerEmailInput.setAttribute("hx-trigger", "keyup changed delay:500ms");
    registerEmailInput.setAttribute("hx-get", "/api/auth/validate-email");
    registerEmailInput.setAttribute("hx-target", "next .validation-message");
  }

  // Add HTMX attributes for better UX
  registerForm.setAttribute("hx-post", "/api/auth/register");
  registerForm.setAttribute("hx-target", "#auth-response");
  registerForm.setAttribute("hx-swap", "innerHTML");
  registerForm.setAttribute("hx-indicator", "#register-spinner");

  // Add password validation
  const passwordInput = registerForm.querySelector('input[name="password"]');
  const confirmInput = registerForm.querySelector(
    'input[name="confirmPassword"]'
  );

  if (passwordInput && confirmInput) {
    confirmInput.addEventListener("input", () => {
      if (passwordInput.value !== confirmInput.value) {
        confirmInput.setCustomValidity("Passwords don't match");
      } else {
        confirmInput.setCustomValidity("");
      }
    });
  }

  // Add a spinner for loading state
  const submitBtn = registerForm.querySelector('button[type="submit"]');
  if (submitBtn) {
    const spinner = document.createElement("span");
    spinner.id = "register-spinner";
    spinner.className = "htmx-indicator spinner";
    spinner.textContent = "↻";
    submitBtn.appendChild(spinner);
  }

  // Create a response container if it doesn't exist
  ensureResponseContainer(registerForm);
}

export function enhanceLoginForm() {
  const loginForm = document.getElementById("login-form");
  console.log("loginForm", loginForm);
  if (!loginForm) return;

  // Add HTMX attributes for better UX
  loginForm.setAttribute("hx-post", "/api/auth/login");
  loginForm.setAttribute("hx-target", "#auth-response");
  loginForm.setAttribute("hx-swap", "innerHTML");
  loginForm.setAttribute("hx-indicator", "#login-spinner");

  // Add a spinner for loading state
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  if (submitBtn) {
    const spinner = document.createElement("span");
    spinner.id = "login-spinner";
    spinner.className = "htmx-indicator spinner";
    spinner.textContent = "↻";
    submitBtn.appendChild(spinner);
  }

  // Create a response container if it doesn't exist
  ensureResponseContainer(loginForm);
}
