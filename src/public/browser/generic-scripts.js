// File: public/js/auth.js
import { handleHtmxAfterSwap } from "../../lib/utils.mjs";

document.addEventListener("DOMContentLoaded", () => {
  // Handle HTMX events for authentication responses
  document.body.addEventListener("htmx:afterSwap", handleHtmxAfterSwap);
});
