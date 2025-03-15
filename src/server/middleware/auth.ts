import { defineEventHandler, createError } from "h3";
import { authMiddleware } from "../lib/auth";

export default defineEventHandler(async (event) => {
  // Skip auth for non-protected routes
  const url = event.path || "";
  if (url.startsWith("/api/auth/") || !url.startsWith("/api/")) {
    return;
  }

  const userId = await authMiddleware(event);
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  // Add userId to event context for use in route handlers
  event.context.auth = { userId };
});
