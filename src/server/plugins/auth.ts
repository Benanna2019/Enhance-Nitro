import { initializeDatabase, cleanupExpiredRefreshTokens } from "../lib/auth";

export default defineNitroPlugin(async (nitroApp) => {
  // Initialize database
  await initializeDatabase();

  // Schedule periodic cleanup of expired tokens
  setInterval(async () => {
    try {
      await cleanupExpiredRefreshTokens();
    } catch (error) {
      console.error("Error cleaning up expired tokens:", error);
    }
  }, 1000 * 60 * 60 * 24); // Run once per day

  console.log("Auth plugin initialized");
});
